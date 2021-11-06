function apiError(status, message) {
  this.message = message;
  this.status = status;
}
apiError.prototype = new Error();
module.exports = apiError;
