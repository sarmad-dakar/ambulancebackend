const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const saltRounds = 10; // The number of salt rounds for bcrypt hashing
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, latitude, longitude, role } =
      req.body;
    // Check if the user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .send({ message: "User with this email already exists." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });
    const response = await newUser.save();
    res.status(201).send({
      message: "User registered successfully.",
      user_id: response._id,
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
