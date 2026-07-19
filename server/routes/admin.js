const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/auth");

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

// Delete any item
router.delete("/items/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;