// utils/send-email.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('📧 Gmail: Setting up email transporter...');
  
  // Check required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing EMAIL_USER or EMAIL_PASS');
    throw new Error('Email credentials missing');
  }

  console.log('📧 Gmail config:', {
    host: 'smtp.gmail.com',
    port: 587,
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASS
  });

  // Create Gmail transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email message
  const message = {
    from: `"${process.env.FROM_NAME || 'Online Registration'}" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  console.log('📧 Sending Gmail to:', options.email);

  try {
    const info = await transporter.sendMail(message);
    console.log('✅ Gmail sent successfully!', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Gmail send failed:', error.message);
    throw error;
  }
};

module.exports = sendEmail;