const apiError = require("../utils/apiError");

function errorHandler(err, req, res, next) {
  if (err instanceof apiError) {
    return res.status(err.status).json({ error: err.message });
  }
  return res
    .status(err.status || 500)
    .json(err.message || "something went wrong");
}

module.exports = errorHandler;
