const asyncHandler = require("express-async-handler");
const ApiError = require('../utils/apiError');

const User = require('../models/user.model')

// @desc add product to wishlist
// @route POST /api/v1/wishlist
// @access Private

const addToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: req.body.productId } }, { new: true })

  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", message: "Product added to wishlist", data: user })
})


// @desc remove product to wishlist
// @route DELETE /api/v1/wishlist/:productId
// @access Private

const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } }, { new: true })

  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", message: "Product removed from wishlist", data: user })
})

// @desc get All wishlist Products
// @route GET /api/v1/wishlist
// @access Private

const getUserWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist")


  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", message: "User wishlist", data: user })
})



module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
}
