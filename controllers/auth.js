const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const generateToken = require("../utils/generateToken");
const {
  validateLogin,
  validateSignUp,
  validateObjectId,
  validateEmail,
} = require("../validators/auth");
const { sendVerificationCode } = require("../services/email");
const mongoose = require("mongoose");

exports.registerUser = async (req, res, next) => {
  try {
    const valid = validateSignUp(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateSignUp.errors[0] });
    }
    const { email, password } = req.body;

    const session = await mongoose.startSession();
    const emailExists = await User.findOne({ email }, "email");

    if (emailExists) {
      return res
        .status(400)
        .json({ error: "A user with that email already exists" });
    }

    let user = await User.create({
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({ error: "invalid email or password" });
    }

    const token = generateToken(user._id);
    const secondsInWeek = 604800;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: secondsInWeek * 1000,
    });
    const refreshToken = await RefreshToken.create({ user: user._id });
    user.refreshToken = refreshToken._id;
    user.save();
    await sendVerificationCode(user.email, refreshToken.value);
    await session.endSession();
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const valid = validateLogin(req.body);
    if (!valid) {
      return res.status(400).json({ error: validateLogin.errors[0] });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }, "email _id");
    if (!user) {
      return res.status(400).json({ error: "email not found" });
    }
    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "wrong email or password" });
    }
    const token = generateToken(user._id);
    const secondsInWeek = 604800;

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: secondsInWeek * 1000,
    });

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.user;
    if (!validateObjectId(id)) {
      return res.status(401).json({ error: "Not authorized" });
    }
    const user = await User.findById(id, "_id email emailVerified");

    if (!user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    res.status(200).json({
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");

  res.status(200).json({ message: "You have successfully logged out" });
};

exports.resendEmailToken = async (req, res, next) => {
  try {
    const { email } = req.body;
    const valid = validateEmail(email);
    if (!valid) {
      return res.status(400).json({ error: "invalid email" });
    }
    const user = await User.findOne({ email: email }).populate("refreshToken");
    user.refreshToken.resetToken();
    await user.save();
    await sendVerificationCode(user.email, user.refreshToken.value);
    return res.status(200).json({
      message: `new refresh token sent to ${user.email}`,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { refreshTokenValue } = req.params;
    const token = await RefreshToken.findOne({
      value: refreshTokenValue,
    }).populate("user", "emailVerified");
    if (!token) {
      return res.status(404).json({ message: "token not found" });
    }
    if (token.isExpired) {
      return res.status(404).json({ message: "token is expired" });
    }
    if (token.user.emailVerified) {
      return res.status(403).json({ message: "email already verified " });
    }
    token.user.emailVerified = true;
    await token.user.save();

    return res.status(200).json({ message: token });
  } catch (err) {
    next(err);
  }
};
