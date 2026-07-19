const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");

// Admin check middleware
const adminMiddleware = async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

// Get stats
router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const activeItems = await Item.countDocuments({
      $or: [{ status: "active" }, { status: { $exists: false } }]
    });
    const resolvedItems = await Item.countDocuments({ status: "resolved" });
    const lostItems = await Item.countDocuments({
      type: "lost",
      $or: [{ status: "active" }, { status: { $exists: false } }]
    });
    const foundItems = await Item.countDocuments({
      type: "found",
      $or: [{ status: "active" }, { status: { $exists: false } }]
    });

    res.json({ totalUsers, totalItems, activeItems, resolvedItems, lostItems, foundItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all items
router.get("/items", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const items = await Item.find().populate("postedBy", "name email");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete any item (admin) — also deletes image from Cloudinary
router.delete("/items/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Delete image from Cloudinary if it exists
    if (item.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr.message);
        // Don't block item deletion if Cloudinary fails
      }
    }

    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;