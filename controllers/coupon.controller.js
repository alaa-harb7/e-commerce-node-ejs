const asyncHandler = require("express-async-handler");

const Coupon = require("../models/coupon.model");

const factory = require("./handlerFactor");


// @desc Get all coupons
// @route GET /api/v1/coupons
// @access Private
const getCoupons = factory.getAll(Coupon);

// @desc Get specific coupon
// @route GET /api/v1/coupons/:id
// @access Private
const getCoupon = factory.getOne(Coupon);

// @desc Create coupon
// @route POST /api/v1/coupons
// @access Private
const createCoupon = factory.createOne(Coupon);

// @desc Update coupon
// @route PUT /api/v1/coupons/:id
// @access Private
const updateCoupon = factory.updateOne(Coupon);

// @desc Delete coupon
// @route DELETE /api/v1/coupons/:id
// @access Private
const deleteCoupon = factory.deleteOne(Coupon);

module.exports = {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
