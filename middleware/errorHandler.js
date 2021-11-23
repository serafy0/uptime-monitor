const apiError = require("../utils/apiError");
const { HTTPError, TimeoutError } = require("got");

function errorHandler(err, req, res, next) {
  if (err instanceof apiError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof HTTPError) {
    return res.status(200).json({ message: err.response.statusCode });
  }
  if (err instanceof TimeoutError) {
    const responseTimeInSeconds = err.timings.phases.total / 1000;
    return res
      .status(200)
      .json({ error: err, responseTimeInSeconds: responseTimeInSeconds });
  }
  return res
    .status(err.status || 500)
    .json({ error: err.message || "something went wrong" });
}

module.exports = errorHandler;
