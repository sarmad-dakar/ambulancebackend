const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
    unique: true,
  },
  bloodGroup: {
    type: String,
    required: false,
  },

  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "driver"],
    default: "user",
  },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    address: {
      type: String,
    },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
    },
  },
  vehicle: {
    oxygenCylinder: {
      type: Boolean,
      default: false,
    },
    bloodPressureMachine: {
      type: Boolean,
      default: false,
    },
    wheelchair: {
      type: Boolean,
      default: false,
    },
    paramedic: {
      type: Boolean,
      default: false,
    },
  },
  vehicleRegistered: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isAdminApproved: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
