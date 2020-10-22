const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create a transporter
  // Using mailtrap to get all host, port, user,pass
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: 'Sam Shrestha <hello@sam.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html
  };
  // 3) Actually send the email
  await transporter.sendMail({
    mailOptions
  });
};

module.exports = sendEmail;