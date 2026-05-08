const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./models/Item");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Create item (protected)
app.post("/api/items", authMiddleware, async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      postedBy: req.user.userId
    });
    await newItem.save();
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active items only
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find({
      $or: [{ status: "active" }, { status: { $exists: false } }]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get items posted by logged in user
app.get("/api/items/mine", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user.userId });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark item as resolved (owner or admin)
app.patch("/api/items/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // Check if user is owner or admin
    const user = await User.findById(req.user.userId);
    const isOwner = item.postedBy && item.postedBy.toString() === req.user.userId;
    const isAdmin = user && user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(401).json({ error: "Not authorized" });
    }

    item.status = "resolved";
    await item.save();
    res.json({ message: "Item marked as resolved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item (owner only)
app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }
    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connect to MongoDB + Start server
mongoose.connect("mongodb+srv://raptor2322_db_user:joseph2002@cluster0.7kbwgqt.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(8000, () => console.log("Server running on port 8000"));
  })
  .catch(err => console.log(err));