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
      index: true,
    },
    expirationDate: {
      type: Date,
      default: Date.now() + 1000 * 60 * 15,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

refreshTokenSchema.virtual("isExpired").get(function () {
  return new Date(Date.now()) >= this.expirationDate;
});
refreshTokenSchema.methods.resetToken = async function () {
  const newTokenValue = randomToken();
  const newExpirationDate = Date.now() + 1000 * 60 * 15;
  await this.model("RefreshToken").findOneAndUpdate(
    { _id: this._id },
    { value: newTokenValue, expirationDate: newExpirationDate }
  );
  return newTokenValue;
};

module.exports = RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);
