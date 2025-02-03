const Ride = require("../models/rideModel");
const User = require("../models/userModel");

const requestRide = async (req, res) => {
  try {
    const { pickupLocation, vehicle } = req.body;
    const userId = req.user.id; // Authenticated user making the request

    const newRide = new Ride({
      requestedBy: userId,
      pickupLocation: {
        type: "Point",
        coordinates: [
          parseFloat(pickupLocation.longitude),
          parseFloat(pickupLocation.latitude),
        ],
      },
      vehicle,
    });
    const userObject = await User.findById(userId);

    const savedRide = await newRide.save();
    res.status(201).send({
      message: "Ride requested successfully.",
      ride: savedRide,
      userOject: {
        riderName: `${userObject.firstName} ${userObject.lastName}`,
        riderEmail: userObject.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error creating ride request." });
  }
};

const driverOngoingRide = async (req, res) => {
  try {
    const driverId = req.user.id; // Authenticated driver

    // Find an ongoing ride that is accepted by the driver and not completed
    const ongoingRide = await Ride.findOne({
      acceptedBy: driverId,
      status: { $in: ["accepted", "in-progress"] }, // Include statuses for ongoing rides
    }).populate("requestedBy");

    if (!ongoingRide) {
      return res
        .status(404)
        .send({ message: "No ongoing rides found for this driver." });
    }

    res.status(200).send({
      message: "Ongoing ride retrieved successfully.",
      ride: ongoingRide,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching ongoing ride." });
  }
};

const userLastRide = async (req, res) => {
  try {
    const userid = req.user.id; // Authenticated driver

    // Find an ongoing ride that is accepted by the driver and not completed
    const ongoingRide = await Ride.findOne({
      requestedBy: userid,
      status: { $in: ["accepted"] }, // Include statuses for ongoing rides
    }).populate("acceptedBy");

    if (!ongoingRide) {
      return res
        .status(404)
        .send({ message: "No ongoing rides found for this driver." });
    }

    res.status(200).send({
      message: "Ongoing ride retrieved successfully.",
      ride: ongoingRide,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching ongoing ride." });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    const driverId = req.user.id; // Authenticated user accepting the ride

    // Verify that the user has the role of a driver
    const user = await User.findById(driverId);
    if (!user || user.role !== "driver") {
      return res
        .status(403)
        .send({ message: "Only drivers can accept rides." });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).send({ message: "Ride not found." });
    }

    const ongoingRide = await Ride.findOne({
      acceptedBy: driverId,
      status: { $ne: "completed" },
    });

    if (ongoingRide) {
      return res.status(400).send({
        message:
          "You already have an ongoing ride. Complete it before accepting a new one.",
      });
    }

    if (ride.status !== "pending") {
      return res.status(400).send({
        message: "Ride is no longer available for acceptance.",
      });
    }

    ride.status = "accepted";
    ride.acceptedBy = driverId;
    const updatedRide = await ride.save();

    res.status(200).send({
      message: "Ride accepted successfully.",
      ride: updatedRide,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error accepting the ride." });
  }
};

const completeRide = async (req, res) => {
  try {
    const { rideId } = req.body;
    console.log(rideId, "ride id ");
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).send({ message: "Ride not found." });
    }

    if (ride.status !== "accepted") {
      return res.status(400).send({
        message: "Ride cannot be completed at this stage.",
      });
    }

    ride.status = "completed";
    ride.completedAt = new Date();
    const updatedRide = await ride.save();

    res.status(200).send({
      message: "Ride completed successfully.",
      ride: updatedRide,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error completing the ride." });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate("requestedBy acceptedBy");
    res.status(200).send({
      message: "All rides retrieved successfully.",
      rides,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching all rides." });
  }
};

const getTotalNumberOfRides = async (req, res) => {
  try {
    const totalRides = await Ride.countDocuments();
    res.status(200).send({
      message: "Total number of rides retrieved successfully.",
      totalRides,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching total number of rides." });
  }
};

const getRideRatio = async (req, res) => {
  try {
    const completedRides = await Ride.countDocuments({ status: "completed" });
    const otherRides = await Ride.countDocuments({
      status: { $ne: "completed" },
    });

    const ratio =
      otherRides === 0
        ? "All rides completed"
        : (completedRides / otherRides).toFixed(2);

    res.status(200).send({
      message: "Ride ratio retrieved successfully.",
      completedRides,
      otherRides,
      ratio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error calculating ride ratio." });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  completeRide,
  userLastRide,
  driverOngoingRide,
  getAllRides,
  getRideRatio,
  getTotalNumberOfRides,
};
