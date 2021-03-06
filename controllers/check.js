const Check = require("../models/check");
const {
  removeJob,
  addCheckJob,
  getAllRepeatable,
  removeAllJobs,
} = require("../queues/check");
const { validateCheck, validateEditingCheck } = require("../validators/check");
const {
  calculateDurations,
  calculateOutages,
  calculateAverageResponseTimeAndAvailability,
} = require("../services/request");

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
      tags,
    } = req.body;
    const valid = validateCheck(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateCheck.errors[0] });
    }
    const uniqueTags = [...new Set(tags)];

    const newURL = new URL(linkText);
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
      tags: uniqueTags,
      creator: req.user.id,
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
    const { id } = req.params;
    const pausedCheck = await Check.findById(id);
    if (!pausedCheck) {
      return res.status(404).json({ error: "check not found" });
    }

    if (!pausedCheck.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }
    await removeJob(pausedCheck);

    return res.status(200).json({ message: "check paused" });
  } catch (err) {
    next(err);
  }
};

exports.resumeCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }

    if (!check.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }
    await addCheckJob(check);

    return res.status(200).json({ message: "check resumed" });
  } catch (err) {
    next(err);
  }
};

exports.getOneCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }
    if (!check.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }

    return res.status(200).json({ check: check });
  } catch (err) {
    next(err);
  }
};
exports.deleteCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }
    if (!check.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }

    await removeJob(check);

    const deletedCheck = await Check.findByIdAndRemove(id);

    return res.status(200).json({ message: "check deleted" });
  } catch (err) {
    next(err);
  }
};

exports.findByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;

    const checks = await Check.find({ tags: tag, creator: req.user.id });
    if (!checks || !checks.length) {
      return res.status(404).json({ error: "no checks found with tag" });
    }
    return res.status(200).json({ checks: checks });
  } catch (err) {
    next(err);
  }
};
exports.getReportForCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await Check.findById(id).populate(
      "requests",
      "-updatedAt",
      "request",
      { sort: { created_at: 1 } }
    );
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }
    if (!check.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }

    const history = check.requests;
    if (!history || !history.length) {
      return res.status(404).json({ message: "no requests performed yet" });
    }
    const { status } = history[history.length - 1];

    const outages = await calculateOutages(check);

    const { availability, averageResponseTime } =
      await calculateAverageResponseTimeAndAvailability(check._id, outages);
    const { uptime, downtime } = await calculateDurations(history, check);
    return res.status(200).json({
      outages,
      status,
      averageResponseTime,
      availability,
      uptime,
      downtime,
      history,
    });
  } catch (err) {
    next(err);
  }
};

exports.editCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
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
      tags,
    } = req.body;

    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }

    if (!check.creator.equals(req.user.id)) {
      return res.sendStatus(401);
    }

    const valid = validateEditingCheck(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateEditingCheck.errors[0] });
    }

    const uniqueTags = [...new Set(tags)];

    let newURL;

    if (linkText) {
      newURL = new URL(linkText);
    }

    await removeJob(check);

    const editedCheck = await Check.findByIdAndUpdate(
      id,
      {
        name: name,
        url: newURL ? newURL.origin : undefined,
        path: newURL ? newURL.pathname : undefined,
        protocol: newURL ? newURL.protocol : undefined,
        port: newURL ? newURL.port : undefined,
        webhook: webhook,
        timeoutInSeconds: timeout,
        interval: interval,
        assert: { statusCode: assertStatus },
        ignoreSSL: ignoreSSL,
        authentication: authentication,
        httpHeaders: httpHeaders,
        threshold: threshold,
        tags: uniqueTags,
      },
      { new: true }
    );
    await addCheckJob(editedCheck);

    return res.status(200).json({
      editedCheck: editedCheck,
    });
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
exports.getAllChecksAndRemove = async (req, res, next) => {
  try {
    const promises = [];
    const checks = await Check.find();
    checks.forEach((check) => {
      promises.push(Check.deleteOne({ _id: check._id }));
    });
    await Promise.all(promises);
    return res.status(200).json({ checks: checks });
  } catch (err) {
    next(err);
  }
};
exports.getAllChecks = async (req, res, next) => {
  try {
    const checks = await Check.find();
    return res.status(200).json({ checks: checks });
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
