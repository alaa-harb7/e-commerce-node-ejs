const asyncHandler = require("express-async-handler");
const ApiError = require('../utils/apiError');

const User = require('../models/user.model')

// @desc add product to Adresses
// @route POST /api/v1/addresses
// @access Private

const addToAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { addresses: req.body } }, { new: true })

  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", message: "Address added to addresses", data: user.addresses })
})


// @desc remove product to addresses
// @route DELETE /api/v1/addresses/:addressId
// @access Private

const removeFromAdresses = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { $pull: { addresses: {_id: req.params.addressId} } }, { new: true })

  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", message: "Address removed from addresses", data: user.addresses })
})

// @desc get All addresses
// @route GET /api/v1/addresses
// @access Private

const getUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    return next(new ApiError("User not found", 404))
  }

  res.status(200).json({status: "success", results: user.addresses.length, data: user.addresses })
})



module.exports = {
  addToAddresses,
  removeFromAdresses,
  getUserAddresses
}
