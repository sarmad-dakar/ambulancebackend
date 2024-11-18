const express = require("express");
const router = express.Router();
const rideService = require("../services/rideService");
const { auth } = require("../middlewares/auth");

router.post("/request", auth, rideService.requestRide);
router.post("/accept", auth, rideService.acceptRide);
router.get("/complete", auth, rideService.completeRide);

module.exports = router;
