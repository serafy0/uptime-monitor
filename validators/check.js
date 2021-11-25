const { ajv } = require("./index");
const mongoose = require("mongoose");

const check = {
  type: "object",
  required: ["linkText", "name"],

  properties: {
    name: { type: "string" },
    linkText: { type: "string", format: "uri" },
    webhook: { type: "string", format: "uri" },
    timeout: { type: "number" },
    interval: { type: "number" },
    threshold: { type: "number" },
    httpHeaders: { type: "object" },
    authentication: {
      type: "object",
      properties: {
        username: { type: "string" },
        password: { type: "string", format: "password" },
      },
    },
    assertStatus: { type: "number", minimum: 100, maximum: 599 },
    ignoreSSL: { type: "boolean" },
    tags: {
      type: "array",
      items: {
        type: "string",
        transform: ["trim", "toLowerCase"],
      },
    },
  },
  additionalProperties: false,
};

const editCheck = check;
editCheck.required = [];

const validateCheck = ajv.compile(check);
const validateEditingCheck = ajv.compile(editCheck);

const validateObjectId = (string) => mongoose.isValidObjectId(string);
module.exports = {
  validateCheck,
  validateObjectId,
  validateEditingCheck,
};
