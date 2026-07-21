require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `"CU Item Rescue" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER, // sends to itself as a test
  subject: "Test Email - CU Item Rescue",
  html: "<h2>This is a test email from CU Item Rescue</h2>"
})
.then(() => {
  console.log("✅ Email sent successfully");
})
.catch((err) => {
  console.error("❌ Email failed:", err.message);
});