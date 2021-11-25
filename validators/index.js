const Ajv = require("ajv");
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
const addFormats = require("ajv-formats");
require("ajv-keywords")(ajv, ["transform"]);

addFormats(ajv);
module.exports = {
  ajv,
};
