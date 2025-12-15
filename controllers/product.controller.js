const sharp = require("sharp");

// eslint-disable-next-line import/no-unresolved, node/no-missing-require
const { v4: uuidv4 } = require("uuid");

const asyncHandler = require("express-async-handler");

const productModel = require("../models/product.model");

const factory = require("./handlerFactor");
const {
  uploadSingleAndMultiImage,
} = require("../middlewares/uploadImageMiddleware");

const uploadProductImage = uploadSingleAndMultiImage("imageCover", "images");

const resizeProductImage = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const filename = `product-${uuidv4()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(3000, 2000)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/products/${filename}`);
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, index) => {
        const filename = `product-${uuidv4()}-${index + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(3000, 2000)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/products/${filename}`);
        req.body.images.push(filename);
      })
    );
  }
  next();
});

// Middleware to sanitize brand field (remove empty strings)
const sanitizeBrandField = (req, res, next) => {
  // Remove brand field if it's an empty string, null, or undefined
  if (req.body.brand === '' || req.body.brand === null || req.body.brand === undefined) {
    delete req.body.brand;
  }
  next();
};

// @desc Create product
// @route POST /api/v1/products
// @access Private
const createProduct = factory.createOne(productModel);

// @desc Get all products
// @route GET /api/v1/products
// @access Public
const getProducts = factory.getAll(productModel, "Products");

// @desc Get specific product
// @route GET /api/v1/products/:id
// @access Public
const getProduct = factory.getOne(productModel, "Reviews");

// @desc Update specific product
// @route PUT /api/v1/products/:id
// @access Private
const updateProduct = factory.updateOne(productModel);

// @desc Delete specific product
// @route DELETE /api/v1/products/:id
// @access Private
const deleteProduct = factory.deleteOne(productModel);

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  resizeProductImage,
  sanitizeBrandField,
};
