const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = "lostfound_secret_key";

function normalizeIndexNumber(indexNumber) {
  return String(indexNumber || "").replace(/[\/\s-]/g, "").toUpperCase();
}

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, indexNumber, department, level } = req.body;
    const normalizedIndexNumber = normalizeIndexNumber(indexNumber);

    if (!email || !email.endsWith("@central.edu.gh")) {
      return res.status(400).json({ error: "You must use your Central University email address" });
    }

    if (!name || !password || !normalizedIndexNumber || !department || !level) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingIndexNumber = await User.findOne({
      $or: [
        { indexNumber },
        { indexNumberNormalized: normalizedIndexNumber }
      ]
    });
    if (existingIndexNumber) {
      return res.status(400).json({ error: "Index number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      indexNumber,
      indexNumberNormalized: normalizedIndexNumber,
      department,
      level,
      role: "student"
    });
    await user.save();

    // Auto-login: generate token immediately after signup
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Account created successfully",
      token,
      name: user.name,
      isAdmin: user.isAdmin || false,
      email: user.email,
      role: user.role || "student",
      isNewUser: true  // flag so frontend knows to show how-to page
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginId = String(email || "").trim();
    const normalizedLoginId = normalizeIndexNumber(loginId);

    let user = await User.findOne({
      $or: [
        { email: loginId },
        { indexNumber: loginId },
        { indexNumberNormalized: normalizedLoginId }
      ]
    });

    if (!user && normalizedLoginId) {
      const usersWithIndexNumbers = await User.find({ indexNumber: { $exists: true, $ne: "" } });
      user = usersWithIndexNumbers.find(existingUser => {
        return normalizeIndexNumber(existingUser.indexNumber) === normalizedLoginId;
      });
    }

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      name: user.name,
      isAdmin: user.isAdmin,
      email: user.email,
      role: user.role || "student"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CURRENT USER PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No account found with that email" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"CU Item Rescue" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Temporary Password - CU Item Rescue",
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Your temporary password is: <strong>${tempPassword}</strong></p>
        <p>Please login with this password and change it immediately.</p>
        <p>— CU Item Rescue Team</p>
      `
    });

    res.json({ message: "Temporary password sent to your email" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CHANGE PASSWORD
router.post("/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;