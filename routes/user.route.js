const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedValidator,
} = require("../utils/validators/userValidators");

const {
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
  deleteLoggedUser
} = require("../controllers/user.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router();

router.use(protect);

// User routes
router.get("/me",getLoggedUserData, getUser);
router.put("/changeMyPassword",updateLoggedUserPassword);
router.put("/updateMe", uploadUserImage, resizeUserImage, updateLoggedValidator, updateLoggedUserData);
router.delete("/deleteMe",deleteLoggedUser);

// Admin routes
router.get("/",allowedTo("admin"), getUsers);

router.post(
  "/",
  allowedTo("admin"),
  uploadUserImage,
  resizeUserImage,
  createUserValidator,
  createUser
);

router.get("/:id", getUserValidator, getUser);

// route for update password
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

// route for update user
router.put(
  "/:id",
  allowedTo("admin"),
  uploadUserImage,
  resizeUserImage,
  updateUserValidator,
  updateUser
);
router.delete(
  "/:id",
  allowedTo("admin"),
  deleteUserValidator,
  deleteUser
);

module.exports = router;
