const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./models/Item");

const app = express();

// Middleware
app.use(cors({ origin: "http://127.0.0.1:5500" }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.post("/api/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Connect to MongoDB + Start server
mongoose.connect("mongodb+srv://raptor2322_db_user:joseph2002@cluster0.7kbwgqt.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(8000, () => console.log("Server running on port 8000")); // ← changed to 8000
  })
  .catch(err => console.log(err));