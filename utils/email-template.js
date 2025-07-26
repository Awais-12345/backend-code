// utils/emailTemplates.js
const resetPasswordEmailTemplate = (name, resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
    <h2>Hello ${name},</h2>
    <p>You requested a password reset. Click the button below:</p>
    <a href="${resetLink}" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    ">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <br/>
    <p>Regards,<br/>Online Registration Team</p>
  </div>
`;

module.exports = {
  resetPasswordEmailTemplate,
};
