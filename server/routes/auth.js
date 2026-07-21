const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Brevo API setup
async function sendEmail(to, subject, html, name = "") {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: "CU Item Rescue", email: process.env.EMAIL_USER },
      to: [{ email: to, name: name || to }],
      subject,
      htmlContent: html
    })
  });

  const data = await res.json();
  if (!data.messageId) {
    throw new Error(JSON.stringify(data));
  }
  return data;
}

// Temporary OTP store — { email: { otp, expiresAt, userData } }
const otpStore = new Map();

function normalizeIndexNumber(indexNumber) {
  return String(indexNumber || "").replace(/[\/\s-]/g, "").toUpperCase();
}

// SEND OTP (step 1 of signup)
router.post("/send-otp", async (req, res) => {
  try {

    const SKIP_OTP = true; // Set to true to skip OTP verification

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

    // Handle resend
    if (resend) {
      const existingOtp = otpStore.get(email);
      if (!existingOtp) {
        return res.status(400).json({ error: "No signup in progress for this email. Please sign up again." });
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStore.set(email, { otp: newOtp, expiresAt, userData: existingOtp.userData });

      await sendEmail(
        email,
        "Your New Verification Code - CU Item Rescue",
        `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #CC0000;">CU Item Rescue</h2>
            <p>Your new verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #CC0000; margin: 20px 0;">
              ${newOtp}
            </div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>— CU Item Rescue Team</p>
          </div>
        `,
        existingOtp.userData.name
      );

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

    await sendEmail(
      email,
      "Your Verification Code - CU Item Rescue",
      `
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
      `,
      name
    );

    console.log("OTP sent to:", email, "OTP:", otp);
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
      name, email,
      password: hashedPassword,
      indexNumber,
      indexNumberNormalized: normalizedIndexNumber,
      school, department, level,
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

// FORGOT PASSWORD — send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No account found with that email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Store reset OTP separately from signup OTP
    otpStore.set(`reset_${email}`, { otp, expiresAt });

    await sendEmail(
      email,
      "Password Reset Code - CU Item Rescue",
      `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #CC0000;">CU Item Rescue</h2>
          <p>Hi ${user.name},</p>
          <p>Your password reset code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #CC0000; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>— CU Item Rescue Team</p>
        </div>
      `,
      user.name
    );

    res.json({ message: "Verification code sent to your email" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// VERIFY RESET OTP AND SET NEW PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const stored = otpStore.get(`reset_${email}`);

    if (!stored) {
      return res.status(400).json({ error: "No reset code found. Please request a new one." });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`reset_${email}`);
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect code. Please try again." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpStore.delete(`reset_${email}`);

    res.json({ message: "Password reset successfully" });

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