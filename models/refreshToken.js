const mongoose = require("mongoose");
const crypto = require("crypto");
const randomToken = () => crypto.randomBytes(64).toString("hex");

const refreshTokenSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      default: randomToken(),
      unique: true,
    },
    expirationDate: {
      type: Date,
      default: new Date(Date.now() + 10),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expirationDate;
});
refreshTokenSchema.methods.resetToken = function () {
  this.value = randomToken();
  this.expirationDate = new Date(Date.now() + 10);

  return this.value;
};

module.exports = RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);
