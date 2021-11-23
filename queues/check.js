const { Queue, QueueScheduler, Worker } = require("bullmq");
const got = require("got");
const { HTTPError, RequestError } = require("got");
const { addRequest, sendToWebhook } = require("../services/request");
const { requestCheck } = require("../services/check");
const Check = require("../models/check");
const connection = {
  connection: {
    port: 6379,
    host: "localhost",
  },
};
const myQueueScheduler = new QueueScheduler("check", connection);

const myQueue = new Queue("check", connection);

const worker = new Worker("check", async (job) => {
  const check = await Check.findById(job.data.checkId);
  try {
    const response = await requestCheck(check);
    const newRequest = await addRequest(
      {
        status: response.statusCode,
        responseDuration: response.timings.phases.total / 1000,
      },
      check
    );
  } catch (err) {
    if (err instanceof HTTPError) {
      const newRequest = await addRequest(
        {
          status: err.response.statusCode,
          responseDuration: err.timings.phases.total / 1000,
          error: err,
        },
        check
      );
    } else {
      const newRequest = await addRequest(
        {
          error: err,
        },
        check
      );
    }
  }
});

exports.addCheckJob = async (check) => {
  return await myQueue.add(
    "check",
    {
      check: check,
    },
    {
      repeat: { every: check.interval * 1000 },
      jobId: check._id.toString(),
    }
  );
};

exports.removeJob = async (check) => {
  return await myQueue.removeRepeatable(
    "check",
    { every: check.interval * 1000 },
    check._id
  );
};

exports.removeAllJobs = async () => {
  const alljobs = await myQueue.getRepeatableJobs();
  alljobs.forEach(async (j) => {
    await myQueue.removeRepeatableByKey(j.key);
  });
};
exports.getAllRepeatable = async (check) => {
  return await myQueue.getRepeatableJobs();
};