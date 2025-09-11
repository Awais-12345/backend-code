// utils/send-email.js
const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("❌ Missing email credentials (EMAIL_USER or EMAIL_PASS)");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || "Online Registration"}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: message,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
