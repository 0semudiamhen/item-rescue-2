const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Temporary OTP store — { email: { otp, expiresAt, userData } }
const otpStore = new Map();

function normalizeIndexNumber(indexNumber) {
  return String(indexNumber || "").replace(/[\/\s-]/g, "").toUpperCase();
}

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// SEND OTP (step 1 of signup)
router.post("/send-otp", async (req, res) => {
  try {
    
    const SKIP_OTP = false; // Set to true to skip OTP verification for testing

    if (SKIP_OTP) {
      const { name, email, password, indexNumber, school, department, level } = req.body;
      const normalizedIndexNumber = normalizeIndexNumber(indexNumber);

      if (!email || !email.endsWith("@central.edu.gh")) {
        return res.status(400).json({ error: "You must use your Central University email address" });
      }

      if (!name || !password || !normalizedIndexNumber || !department || !level || !school) {
        return res.status(400).json({ error: "Please fill in all required fields" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingIndex = await User.findOne({
        $or: [{ indexNumber }, { indexNumberNormalized: normalizedIndexNumber }]
      });
      if (existingIndex) {
        return res.status(400).json({ error: "Index number already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name, email, password: hashedPassword,
        indexNumber, indexNumberNormalized: normalizedIndexNumber,
        school, department, level, role: "student"
      });
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        message: "Account created successfully",
        token, name: user.name,
        isAdmin: user.isAdmin || false,
        email: user.email,
        role: user.role || "student",
        isNewUser: true
      });
    }

    const { name, email, password, indexNumber, school, department, level, resend } = req.body;

    // Handle resend — skip validation, just regenerate and resend
    if (resend) {
      const existingOtp = otpStore.get(email);
      if (!existingOtp) {
        return res.status(400).json({ error: "No signup in progress for this email. Please sign up again." });
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStore.set(email, { otp: newOtp, expiresAt, userData: existingOtp.userData });

      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"CU Item Rescue" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your New Verification Code - CU Item Rescue",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #CC0000;">CU Item Rescue</h2>
            <p>Your new verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #CC0000; margin: 20px 0;">
              ${newOtp}
            </div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>— CU Item Rescue Team</p>
          </div>
        `
      });

      return res.json({ message: "New verification code sent" });
    }

    // Normal signup flow
    const normalizedIndexNumber = normalizeIndexNumber(indexNumber);

    if (!email || !email.endsWith("@central.edu.gh")) {
      return res.status(400).json({ error: "You must use your Central University email address" });
    }

    if (!name || !password || !normalizedIndexNumber || !department || !level || !school) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingIndex = await User.findOne({
      $or: [{ indexNumber }, { indexNumberNormalized: normalizedIndexNumber }]
    });
    if (existingIndex) {
      return res.status(400).json({ error: "Index number already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      expiresAt,
      userData: { name, email, password, indexNumber, normalizedIndexNumber, school, department, level }
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"CU Item Rescue" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Verification Code - CU Item Rescue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #CC0000;">CU Item Rescue</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #CC0000; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>— CU Item Rescue Team</p>
        </div>
      `
    });

    res.json({ message: "Verification code sent to your school email" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VERIFY OTP AND CREATE ACCOUNT (step 2 of signup)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({ error: "No verification code found. Please sign up again." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "Verification code has expired. Please sign up again." });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect verification code. Please try again." });
    }

    const { name, password, indexNumber, normalizedIndexNumber, school, department, level } = stored.userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      indexNumber,
      indexNumberNormalized: normalizedIndexNumber,
      school,
      department,
      level,
      role: "student"
    });

    await user.save();
    otpStore.delete(email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Account created successfully",
      token,
      name: user.name,
      isAdmin: user.isAdmin || false,
      email: user.email,
      role: user.role || "student",
      isNewUser: true
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

    const transporter = createTransporter();
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