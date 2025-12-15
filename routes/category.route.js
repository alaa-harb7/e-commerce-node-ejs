const express = require("express");

const router = express.Router();
const {
  getCategories,
  createCategory,
  getSpecificCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeCategoryImage,
} = require("../controllers/category.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoryValidators");

const subCategoryRoute = require("./subCategory.route");

router.use("/:categoryId/subcategories", subCategoryRoute);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  uploadCategoryImage,
  resizeCategoryImage,
  createCategoryValidator,
  createCategory
);
router.get("/", getCategories);
router.get("/:id", getCategoryValidator, getSpecificCategory);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  uploadCategoryImage,
  resizeCategoryImage,
  updateCategoryValidator,
  updateCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteCategoryValidator,
  deleteCategory
);

module.exports = router;
