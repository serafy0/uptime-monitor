const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    status: Number,
    responseDuration: Number,
    error: { type: String },
    check: { type: mongoose.Schema.Types.ObjectId, ref: "check" },
  },
  { timestamps: true }
);

module.exports = Request = mongoose.model("request", requestSchema);
