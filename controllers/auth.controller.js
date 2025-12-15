const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user.model");

const signup = asyncHandler(async (req, res, next) => {
  // 1- create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // 2- generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  // 3- send response
  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // 1- check if email and password exist
  if (!email || !password) {
    return next(new ApiError("Please provide email and password!", 400));
  }
  // 2- check if user exists && password is correct
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3- if everything ok, Generate token and send to client
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
  });
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const protect = asyncHandler(async (req, res, next) => {
  // 1- getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new ApiError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2- verification token

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3- check if user still exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // 4- check if user changed password after the token was issued
  if (currentUser.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (decoded.iat < changedTimeStamp) {
      return next(
        new ApiError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  });

const forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Get User by Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`No user for this email ${req.body.email}`, 404));
  }
  // 2- Generate Reset Random Numbers (6 digits) and save it on db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // 3- Set passwordResetCode and passwordResetCodeExpires
  user.passwordResetCode = hashedResetCode;
  user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  // 3- Send email to user with reset code
  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Use the following code to reset your password: ${resetCode}</p>
  <p>This code is valid for 10 minutes</p>
  <p>Thanks</p>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message: message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(
      new ApiError("There was an error sending the email. Try again later", 500)
    );
  }
  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

const verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1- Get User by Encypt reset Code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError("Reset code is invalid or has expired", 400));
  }
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "success", message: "Reset code verified" });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1- get user based on email
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new ApiError(`No user for this email ${req.body.email}`, 404));
  }
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code is invalid or has expired", 400));
  }
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  // 3- generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.redirect("/");
});

module.exports = {
  signup,
  login,
  protect,
  allowedTo,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  logout,
};
