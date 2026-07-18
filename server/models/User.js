const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  indexNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  indexNumberNormalized: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: "student"
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);