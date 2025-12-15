const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");
const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({
      min: 6,
    })
    .withMessage("Too short password"),
  check("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation required")
    .isLength({
      min: 6,
    })
    .withMessage("Too short password")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
  check("profileImage").optional().isString().withMessage("Invalid image URL"),
  check("role")
    .notEmpty()
    .withMessage("Role required")
    .isIn(["user", "admin"])
    .withMessage("Role must be user or admin"),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("currentPassword").notEmpty().withMessage("Password required"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation required"),
  body("password")
    .notEmpty()
    .withMessage("Password required")

    .custom(async (val, { req }) => {
      // check current password == user password
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordCorrect = await bcrypt.compareSync(
        req.body.currentPassword,
        user.password
      );
      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      // check password == password confirmation
      if (val !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }

      return true;
    }),

  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email")
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user._id.toString() !== req.params.id) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),
  check("profileImage").optional().isString().withMessage("Invalid image URL"),
  check("role")
    .notEmpty()
    .withMessage("Role required")
    .isIn(["user", "admin"])
    .withMessage("Role must be user or admin"),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateLoggedValidator = [
  body("name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email")
    .custom((val, { req }) =>
      User.findOne({ email: val }).then((user) => {
        if (user && user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(new Error("Email already exists"));
        }
      })
    ),

  check("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid phone number"),
  validatorMiddleware,
];
