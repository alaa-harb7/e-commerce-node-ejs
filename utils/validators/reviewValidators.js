const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const slugify = require("slugify");
const Review = require("../../models/review.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings").notEmpty().withMessage("Rating is required").isNumeric().withMessage("Rating must be a number").isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid User id format"),
  check("product").isMongoId().withMessage("Invalid Product id format").custom((val, {req}) => {
    return Review.findOne({
      user: req.user._id,
      product: val,
    }).then((review) => {
      if (review) {
        return Promise.reject(new Error("User already reviewed this product"));
      }
      return true;
    })
  }),

  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format").custom((val, {req}) => {
    return Review.findById(val).then((review) => {
      if (!review) {
        return Promise.reject(new Error("Review not found"));
      }
      const owner = review.user;
      if (owner._id.toString() !== req.user._id.toString()) {
        return Promise.reject(new Error("You are not authorized to update this review"));
      }
      return true;
    })
  }),
  body("title").optional().custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format").custom((val, {req}) => {
    return Review.findById(val).then((review) => {
      if (!review) {
        return Promise.reject(new Error("Review not found"));
      }
      // the admin and user created this review can delete it 
      if (req.user.role === "admin" || req.user._id.toString() === review.user._id.toString()) {
        return true;
      }
      return Promise.reject(new Error("You are not authorized to delete this review"));
    })
  }),
  validatorMiddleware,
];
