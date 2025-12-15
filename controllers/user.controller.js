const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const User = require("../models/user.model");

const factory = require("./handlerFactor");
const ApiError = require("../utils/apiError");

const uploadUserImage = uploadSingleImage("profileImage");

const resizeUserImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const filename = `user-${uuidv4()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${filename}`);
  req.body.profileImage = filename;
  next();
});

// @desc Get all Users
// @route GET /api/v1/users
// @access Private
const getUsers = factory.getAll(User);

// @desc Get specific user
// @route GET /api/v1/users/:id
// @access Private
const getUser = factory.getOne(User);

// @desc Create User
// @route POST /api/v1/users
// @access Private
const createUser = factory.createOne(User);

// @desc Update User
// @route PUT /api/v1/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res, next) => {
  // update all data without password field

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: user });
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: user });
});

// @desc Delete User
// @route DELETE /api/v1/u sers/:id
// @access Private
const deleteUser = factory.deleteOne(User);

const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;

  next();
});

const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({ status: "success", token, data: { user } });
});

const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: "success", data: { user } });
});

// const deleteLoggedUser = asyncHandler(async (req, res, next) => {
//   await User.findByIdAndUpdate(req.user._id, { active: false });

//   res.status(204).json({ status: "success" });
// });

const deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  res.status(204).json({ status: "success", message: "User deleted successfully" });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
};
