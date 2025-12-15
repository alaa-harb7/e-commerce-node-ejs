const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const SubCategory = require("../models/subCategory.model");
const ApiFeatures = require("../utils/apiFeatures");

const factory = require("./handlerFactor");

const setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @dec create subCategory
// @route POST /api/v1/subcategories
// @access Private
const createSubCategory = factory.createOne(SubCategory);

// applying Nested Route
// @dec get filter object
const createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @dec get subCategories
// @route GET /api/v1/subcategories
// @access Public
const getSubCategories = factory.getAll(SubCategory);

// @dec get subCategory
// @route GET /api/v1/subcategories/:id
// @access Public
const getSubCategory = factory.getOne(SubCategory);

// @dec update subCategory
// @route PUT /api/v1/subcategories/:id
// @access Private
const updateSubCategory = factory.updateOne(SubCategory);
// const updateSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const { name, category } = req.body;

//   const subCategory = await SubCategory.findOneAndUpdate(
//     { _id: id },
//     { name, slug: slugify(name), category },
//     { new: true }
//   );

//   if (!subCategory) {
//     return next(new ApiError(`No  subcategory for this id ${id}`, 404));
//   }
//   res.status(200).json({ data: subCategory });
// });

// @dec delete subCategory
// @route DELETE /api/v1/subcategories/:id
// @access Private
const deleteSubCategory = factory.deleteOne(SubCategory);
// const deleteSubCategory = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;
//   const subCategory = await SubCategory.findByIdAndDelete(id);

//   if (!subCategory) {
//     return next(new ApiError(`No subcategory for this id ${id}`, 404));
//   }
//   res.status(204).send();
// });

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
};
