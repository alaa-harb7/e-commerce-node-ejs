const express = require("express");

const {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObj,
} = require("../controllers/subCategory.controller");
const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidators");

const { protect, allowedTo } = require("../controllers/auth.controller");

// mergeParams: Allow us to access parameters on other routers
// ex: We need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router.post(
  "/",
  protect,
  allowedTo("admin"),
  setCategoryIdToBody,
  createSubCategoryValidator,
  createSubCategory
);
router.get("/", createFilterObj, getSubCategories);

router.get("/:id", getSubCategoryValidator, getSubCategory);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  updateSubCategoryValidator,
  updateSubCategory
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteSubCategoryValidator,
  deleteSubCategory
);

module.exports = router;
