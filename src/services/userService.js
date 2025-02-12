const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10; // The number of salt rounds for bcrypt hashing
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Yahoo",
  auth: {
    user: "sarmadshakeel30@yahoo.com",
    pass: "zcsjxxoeegloqurc",
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      latitude,
      longitude,
      role,
      phone,
      bloodGroup,
    } = req.body;
    // Check if the user with the provided email already exists
    console.log(req.body);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .send({ message: "User with this email already exists." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const otp = generateOTP();

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      bloodGroup,
      password: hashedPassword,
      role: role,
      isAdminApproved: role == "user" ? true : false,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      otp,
    });
    const response = await newUser.save();

    const mailOptions = {
      from: "sarmadshakeel30@yahoo.com",
      to: email,
      subject: "Your OTP for Email Verification",
      text: `Your OTP for verification is: ${otp}. This OTP will expire in 10 minutes.`,
    };
    res.status(201).send({
      message: "User registered successfully. OTP sent to email.",
      user_id: newUser._id,
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ message: "Error occurred during user registration." });
  }
};

const loginUser = async (req, res) => {
  try {
    var { email, password } = req.body;
    email = email.trim();
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    if (!user.isAdminApproved && user?.role == "driver") {
      return res
        .status(403)
        .send({ message: "Your account is not approved by admin." });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid credentials." });
    }

    // Generate a JWT token and include any necessary user data (optional)
    const token = jwt.sign({ userId: user._id }, "privateKey");

    // You can include any additional user data in the response if needed (e.g., user ID, name, etc.)
    res.status(200).send({
      message: "Login successful.",
      token,
      user: user,
      firstName: user.firstName,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error occurred during login." });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the user by email and OTP
    console.log(email, otp);
    const user = await User.findOne({ email, otp });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again." });
    }

    // Clear OTP after successful verification
    user.isPhoneVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP." });
  }
};

module.exports = { registerUser, verifyOTP };

const getUserProfile = async (req, res) => {
  try {
    // req.user contains the authenticated user data from the auth middleware
    console.log(req.user);
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Return the user's profile
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error occurred while fetching the user profile." });
  }
};

const updateVehicleDetails = async (req, res) => {
  try {
    const { vehicleData } = req.body;
    const driverId = req.user.id;

    // Check if the user is a driver
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== "driver") {
      return res.status(403).send({ message: "User is not a driver." });
    }

    // Update vehicle details and mark vehicleRegistered as true
    driver.vehicle = vehicleData;
    driver.vehicleRegistered = true;
    await driver.save();

    return res.status(200).send({
      message: "Vehicle details updated successfully.",
      vehicle: driver.vehicle,
      vehicleRegistered: driver.vehicleRegistered,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating vehicle details." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }, "-password").sort({
      createdAt: -1,
    }); // Sorting by latest

    // Excluding passwords from response
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching users." });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: "driver" }, "-password").sort({
      createdAt: -1,
    }); // Sorting by latest

    res.status(200).send(drivers);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching drivers." });
  }
};

const approveDriver = async (req, res) => {
  try {
    const { user } = req.body;

    const driver = await User.findById(user);

    if (!driver) {
      return res.status(404).send({ message: "Driver not found." });
    }

    // Toggle isAdminApproved value
    driver.isAdminApproved = !driver.isAdminApproved;
    await driver.save();

    res.status(200).send({
      message: `Driver ${
        driver.isAdminApproved ? "approved" : "disapproved"
      } successfully.`,
      driver,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating driver." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateVehicleDetails,
  getAllUsers,
  getAllDrivers,
  approveDriver,
  verifyOTP,
};
