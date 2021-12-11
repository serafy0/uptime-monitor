const nodemailer = require("nodemailer");

exports.sendEmail = async (to, { subject, text, html }) => {
  let transporter;
  if (process.env.NODE_ENV !== "production") {
    let testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIl_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  let info = await transporter.sendMail({
    from: process.env.EMAIl_ADDRESS, // sender address
    to: to,
    subject: subject,
    text: text,
    html: html,
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};
