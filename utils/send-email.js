const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ email, subject, message }) => {
  const msg = {
    to: email,
    from: {
      name: process.env.FROM_NAME,
      email: process.env.FROM_EMAIL,
    },
    subject,
    text: "Please view this email in HTML format.",
    html: message,
  };

  await sgMail.send(msg);
};

module.exports = sendEmail;
   
