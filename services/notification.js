const got = require("got");
const { sendEmail } = require("./email");

const sendNotification = async (
  { email, webhook },
  { subject, text, html }
) => {
  if (email) {
    await sendEmail(email, { subject, text, html });
  }
  if (webhook) {
    await sendToWebhook(webhook, text);
  }
};

const sendToWebhook = async (webhook, message) => {
  try {
    if (webhook) {
      await got({
        url: webhook,
        method: "POST",
        body: JSON.stringify({
          text: message,
        }),
      });
    }
  } catch (err) {
    return;
  }
};

module.exports = { sendNotification };
