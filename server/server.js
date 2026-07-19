require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./models/Item");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/admin");
const { upload, cloudinary } = require("./config/cloudinary");

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

// Create item with optional image (protected)
app.post("/api/items", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    const newItem = new Item({
      ...req.body,
      postedBy: req.user.userId,
      contactEmail: req.body.contactType === "school_email" ? user.email : "",
      image: req.file ? req.file.path : "",
      imagePublicId: req.file ? req.file.filename : ""
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

// Delete item (owner only) — also deletes image from Cloudinary
app.delete("/api/items/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

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

// Connect to MongoDB + Start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(8000, () => console.log("Server running on port 8000"));
  })
  .catch(err => console.log(err));