const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  status: { type: Number, required: true },
  availability: Number,
  outages: { type: Number, default: 0 },
  downtimeInSeconds: { type: Number, default: 0 },
  uptimeInSeconds: { type: Number, default: 0 },
  responseTime: { type: Number },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "check" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

module.exports = Report = mongoose.model("report", reportSchema);
