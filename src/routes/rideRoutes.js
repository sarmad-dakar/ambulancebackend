const express = require("express");
const router = express.Router();
const rideService = require("../services/rideService");
const { auth } = require("../middlewares/auth");

router.post("/request", auth, rideService.requestRide);
router.post("/accept", auth, rideService.acceptRide);
router.post("/complete", auth, rideService.completeRide);
router.get("/ongoingDriver", auth, rideService.driverOngoingRide);
router.get("/ongoingUserRide", auth, rideService.userLastRide);
router.get("/getAllRides", rideService.getAllRides);
router.get("/getRidesNumber", rideService.getRideRatio);
router.get("/getRideRatio", rideService.getRideRatio);

module.exports = router;
