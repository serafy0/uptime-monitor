const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    status: { type: Number, required: true },
    responseDuration: { type: Number },
    check: [{ type: mongoose.Schema.Types.ObjectId, ref: "check" }],
  },
  { timestamps: true }
);

module.exports = Request = mongoose.model("request", requestSchema);
