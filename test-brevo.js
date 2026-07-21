require("dotenv").config();

fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "accept": "application/json",
    "api-key": process.env.BREVO_API_KEY,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    sender: { name: "CU Item Rescue", email: process.env.EMAIL_USER },
    to: [{ email: process.env.EMAIL_USER }],
    subject: "Brevo Test - CU Item Rescue",
    htmlContent: "<h2 style='color:#CC0000'>Brevo is working!</h2>"
  })
})
.then(res => res.json())
.then(data => {
  if (data.messageId) {
    console.log("✅ Brevo email sent successfully:", data.messageId);
  } else {
    console.error("❌ Brevo failed:", JSON.stringify(data));
  }
})
.catch(err => console.error("❌ Error:", err.message));