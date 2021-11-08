const { ajv } = require("./index");
const mongoose = require("mongoose");
const email = {
  type: "string",
  format: "email",
};

const authLogin = {
  type: "object",

  properties: {
    email,
    password: { type: "string" },
  },
  additionalProperties: false,
};
const authSignUp = {
  type: "object",
  required: ["email", "password"],

  properties: {
    email,
    password: { type: "string", format: "password" },
  },
  additionalProperties: false,
};

const validateLogin = ajv.compile(authLogin);
const validateSignUp = ajv.compile(authSignUp);
const validateEmail = ajv.compile(email);

const validateObjectId = (string) => mongoose.isValidObjectId(string);
module.exports = {
  validateLogin,
  validateSignUp,
  validateEmail,
  validateObjectId,
};
