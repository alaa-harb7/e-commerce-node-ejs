const asyncHandler = require("express-async-handler");

const Review = require("../models/review.model");

const factory = require("./handlerFactor");


// applying Nested Route
// @dec get filter object
// route GET /api/v1/products/:productId/reviews
const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = { product: req.params.productId };
  req.filterObj = filterObject;
  next();
};


// @desc Get all Reviews
// @route GET /api/v1/reviews
// @access Public
const getReviews = factory.getAll(Review);

// @desc Get specific Review
// @route GET /api/v1/reviews/:id
// @access Public
const getReview = factory.getOne(Review);



const setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.body.productId || req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};


// @desc Create Review
// @route POST /api/v1/reviews
// @access Private
const createReview = factory.createOne(Review);

// @desc Update Review
// @route PUT /api/v1/reviews/:id
// @access Private
const updateReview = factory.updateOne(Review);

// @desc Delete Review
// @route DELETE /api/v1/reviews/:id
// @access Private
const deleteReview = factory.deleteOne(Review);

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody
};
