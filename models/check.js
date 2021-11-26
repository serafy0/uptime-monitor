const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  path: {
    type: String,
    lowercase: true,
    trim: true,
  },
  protocol: {
    type: String,
    enum: ["http:", "https:", "tcp"],
    required: true,
  },
  port: Number,
  webhook: {
    type: String,
  },
  timeoutInSeconds: { type: Number, default: 5 },
  interval: { type: Number, default: 10 * 60 },
  threshold: { type: Number, default: 1 },
  authentication: {
    username: String,
    password: String,
  },
  httpHeaders: mongoose.Schema.Types.Mixed,
  assert: {
    statusCode: { type: Number, max: 599, min: 100 },
  },
  tags: [{ type: String }],
  ignoreSSL: { type: Boolean, default: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  isDown: { type: Boolean, default: true },
});

checkSchema.virtual("requests", {
  ref: "request",
  localField: "_id",
  foreignField: "check",
});

module.exports = Check = mongoose.model("check", checkSchema);
