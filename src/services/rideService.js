const Ride = require("../models/rideModel");
const User = require("../models/userModel");

const requestRide = async (req, res) => {
  try {
    const { pickupLocation } = req.body;
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
    });

    const savedRide = await newRide.save();
    res.status(201).send({
      message: "Ride requested successfully.",
      ride: savedRide,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error creating ride request." });
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
    const { rideId } = req.params;

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

module.exports = {
  requestRide,
  acceptRide,
  completeRide,
};
