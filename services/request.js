const Request = require("../models/request");
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

exports.requestHistory = async (checkId) => {
  const requests = await Request.find(
    { check: checkId },
    "-check -updatedAt"
  ).sort({
    createdAt: 1,
  });
  return requests;
};

exports.calculateDurations = async (requests, check) => {
  let uptime = 0;
  let downtime = 0;

  requests.forEach((request, index) => {
    if (requests[index + 1]) {
      const nextRequest = requests[index + 1];

      if (!request.error && request.status !== check.assert.statusCode) {
        uptime +=
          (nextRequest.createdAt.getTime() - request.createdAt.getTime()) /
          1000;
      } else {
        downtime +=
          (nextRequest.createdAt.getTime() - request.createdAt.getTime()) /
          1000;
      }
    }
  });
  return { upDuration: uptime, downDuration: downtime };
};

exports.calculateOutages = async (check) => {
  const outages = await Request.count({
    check: check._id,
    status: { $ne: check.assert ? check.assert.statusCode : undefined },
    error: { $exists: true },
  });

  return outages;
};

exports.calculateAverageResponseTimeAndAvailability = async (
  checkId,
  outages
) => {
  const aggregation = await Request.aggregate([
    { $match: { check: checkId } },

    {
      $group: {
        _id: null,
        averageResponseTime: { $avg: "$responseDuration" },
        count: { $sum: 1 },
      },
    },
  ]);
  const requestCount = aggregation[0].count;
  const averageResponseTime = aggregation[0].averageResponseTime;

  const upCount = requestCount - outages;
  const availability = (100 * upCount) / requestCount;

  return { availability, averageResponseTime };
};
