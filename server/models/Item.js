const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  type: String, // lost or found
  image: String,
  status: {
    type: String,
    enum: ["active", "resolved"],
    default: "active"
  },
  takenToStudentServices: {
    type: Boolean,
    default: false
  },
  contactType: String, // school_email, personal_email, phone
  contactValue: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Item", itemSchema);