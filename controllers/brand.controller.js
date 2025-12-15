const asyncHandler = require("express-async-handler");
// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line import/no-extraneous-dependencies
const sharp = require("sharp");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const Brand = require("../models/brand.model");

const factory = require("./handlerFactor");

const uploadBrandImage = uploadSingleImage("image");

const resizeBrandImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const filename = `brand-${uuidv4()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);
  req.body.image = filename;
  next();
});

// @desc Get all brands
// @route GET /api/v1/brands
// @access Public
const getBrands = factory.getAll(Brand);

// @desc Get specific brand
// @route GET /api/v1/brands/:id
// @access Public
const getBrand = factory.getOne(Brand);

// @desc Create brand
// @route POST /api/v1/brands
// @access Private
const createBrand = factory.createOne(Brand);

// @desc Update brand
// @route PUT /api/v1/brands/:id
// @access Private
const updateBrand = factory.updateOne(Brand);

// @desc Delete brand
// @route DELETE /api/v1/brands/:id
// @access Private
const deleteBrand = factory.deleteOne(Brand);

module.exports = {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeBrandImage,
};
