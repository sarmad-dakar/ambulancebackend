const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const { auth } = require("../middlewares/auth");

router.post("/register", userService.registerUser);
router.post("/login", userService.loginUser);
router.get("/getAllUsers", userService.getAllUsers);
router.get("/getAllDrivers", userService.getAllDrivers);

router.get("/profile", auth, userService.getUserProfile);
router.post("/updateVehicle", auth, userService.updateVehicleDetails);

module.exports = router;
