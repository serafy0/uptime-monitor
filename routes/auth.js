const { Router } = require("express");
const router = Router();
require("dotenv").config();

const {
  registerUser,
  loginUser,
  getUser,
  logoutUser,
  resendEmailToken,
  verifyEmail,
} = require("../controllers/auth");
const protect = require("../middleware/auth");

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/user").get(protect, getUser);

router.route("/logout").get(protect, logoutUser);
router.route("/resend-token").post(resendEmailToken);
router.route("/verify-email/:refreshTokenValue").get(verifyEmail);
module.exports = router;
