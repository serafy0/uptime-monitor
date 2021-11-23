const Check = require("../models/check");
const {
  removeJob,
  addCheckJob,
  getAllRepeatable,
  removeAllJobs,
} = require("../queues/check");

exports.addCheck = async (req, res, next) => {
  try {
    const {
      name,
      linkText,
      webhook,
      timeout,
      interval,
      threshold,
      authentication,
      httpHeaders,
      assertStatus,
      ignoreSSL,
    } = req.body;
    const newURL = new URL(linkText);
    console.log(newURL);
    const newCheck = await Check.create({
      name: name,
      url: newURL.origin,
      path: newURL.pathname,
      protocol: newURL.protocol,
      port: newURL.port,
      webhook: webhook,
      timeoutInSeconds: timeout,
      interval: interval,
      assert: { statusCode: assertStatus },
      ignoreSSL: ignoreSSL,
      authentication: authentication,
      httpHeaders: httpHeaders,
      threshold: threshold,
    });

    await addCheckJob(newCheck);

    return res.status(201).json({
      newCheck: newCheck,
    });
  } catch (err) {
    next(err);
  }
};
exports.pauseCheck = async (req, res, next) => {
  try {
    const { id } = req.body;
    const pausedCheck = await Check.findById(id);
    if (!pausedCheck) {
      return res.status(404).json({ error: "check not found" });
    }
    await removeJob(pausedCheck);

    return res.status(200).json({ message: "check paused" });
  } catch (err) {
    next(err);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await getAllRepeatable();
    return res.status(200).json({ runningJobs: jobs });
  } catch (err) {
    next(err);
  }
};
exports.removeAllJobs = async (req, res, next) => {
  try {
    const jobs = await removeAllJobs();
    return res.status(200).json({ message: "all is done" });
  } catch (err) {
    next(err);
  }
};
