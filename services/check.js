const got = require("got");

exports.requestCheck = async (check) => {
  return got({
    url: check.url,
    https: {
      rejectUnauthorized: !check.ignoreSSL,
    },
    path: check.path,
    protocol: check.protocol,
    headers: check.httpHeaders,
    timeout: { response: check.timeoutInSeconds * 1000 },
    retry: { limit: check.threshold },
    username: check.authentication ? check.authentication.username : null,
    password: check.authentication ? check.authentication.password : null,
  });
};
