const { sendEmail } = require("./email");

exports.sendVerificationCode = async (email, token) => {
  await sendEmail(email, {
    subject: "uptime monitor email verification",
    text: `Hey there, here's your token ${process.env.API_URL}/auth/verify-email/${token}`,
    html: `<b>Hey there, here's your token <a href="${process.env.API_URL}/auth/verify-email/${token}">verify</a> </b>`,
  });
};
