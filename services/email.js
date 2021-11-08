const mailer = require("nodemailer");
const nodemailer = require("nodemailer");

const sendVerificationCode = async (email, token) => {
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
    from: '"Fred Foo" <bosta@example.com>' || process.env.EMAIl_ADDRESS, // sender address
    to: email,
    subject: "email verification",
    text: `Hey there, here's your token ${process.env.API_URL}/auth/verify-email/${token}`,
    html: `<b>Hey there, here's your token <a href="${process.env.API_URL}/auth/verify-email/${token}">verify</a> </b>`,
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

module.exports = { sendVerificationCode };
