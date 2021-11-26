const Request = require("../models/request");
const Check = require("../models/check");
const got = require("got");

exports.addRequest = async ({ status, responseDuration, error }, check) => {
  try {
    const request = await Request.create({
      status: status,
      responseDuration: responseDuration,
      error: error,
      check: check._id,
    });
    let isDown = check.isDown;
    if (
      check.isDown &&
      (!error || (check.assert && check.assert.statusCode === status))
    ) {
      isDown = false;
      await sendToWebhook(
        check.webhook,
        `${check.url + check.path} is working as expected`
      );
    }

    if (!check.isDown && error && check.assert.statusCode !== status) {
      isDown = true;
      await sendToWebhook(
        check.webhook,
        `${check.url + check.path} is down ${error}`
      );
    }

    const updatedCheck = await Check.findOneAndUpdate(
      { _id: check._id },
      { isDown: isDown, $push: { requests: request._id } }
    );
  } catch (err) {
    return;
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
