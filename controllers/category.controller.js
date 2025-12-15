const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const factory = require("./handlerFactor");
const CategoryModel = require("../models/category.model");

// @desc Upload category image
const uploadCategoryImage = uploadSingleImage("image");

const resizeCategoryImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();
  const filename = `category-${uuidv4()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/categories/${filename}`);
  req.body.image = filename;
  next();
});

// @desc Create category
// @route POST /api/v1/categories
// @access Private
const createCategory = factory.createOne(CategoryModel);

const getCategories = factory.getAll(CategoryModel);

// @desc Get specific category
// @route GET /api/v1/categories/:id
// @access Public
const getSpecificCategory = factory.getOne(CategoryModel);

// @desc Update specific category
// @route PUT /api/v1/categories/:id
// @access Private
const updateCategory = factory.updateOne(CategoryModel);

// @desc Delete specific category
// @route DELETE /api/v1/categories/:id
// @access Private
const deleteCategory = factory.deleteOne(CategoryModel);

module.exports = {
  getCategories,
  createCategory,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeCategoryImage,
};
