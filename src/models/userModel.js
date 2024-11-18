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
});

const User = mongoose.model("User", userSchema);

module.exports = User;

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
