const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  type: String, // lost or found
  image: String, // cloudinary url
  imagePublicId: String, // cloudinary public_id for deletion
  status: {
    type: String,
    enum: ["active", "resolved"],
    default: "active"
  },
  dateOccurred: {
    type: Date
  },
  takenToStudentServices: {
    type: Boolean,
    default: false
  },
  contactType: String,
  contactValue: String,
  contactEmail: String,
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