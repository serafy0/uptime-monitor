const Check = require("../models/check");
const {
  removeJob,
  addCheckJob,
  getAllRepeatable,
  removeAllJobs,
} = require("../queues/check");
const { validateCheck, validateEditingCheck } = require("../validators/check");

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
    const valid = validateCheck(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateCheck.errors[0] });
    }

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

exports.getOneCheck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
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
    await removeJob(check);

    const deletedCheck = await Check.findByIdAndRemove(id);

    return res.status(200).json({ message: "check deleted" });
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
    } = req.body;

    const check = await Check.findById(id);
    if (!check) {
      return res.status(404).json({ error: "check not found" });
    }

    const valid = validateEditingCheck(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateEditingCheck.errors[0] });
    }

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
exports.removeAllJobs = async (req, res, next) => {
  try {
    const jobs = await removeAllJobs();
    return res.status(200).json({ message: "all is done" });
  } catch (err) {
    next(err);
  }
};
