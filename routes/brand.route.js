const express = require("express");
const {
  getBrandValidator,
  createBrandValidator,
  updateBrandValidator,
  deleteBrandValidator,
} = require("../utils/validators/brandValidatos");

const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeBrandImage,
} = require("../controllers/brand.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/", getBrands);
router.post(
  "/",
  protect,
  allowedTo("admin"),
  uploadBrandImage,
  resizeBrandImage,
  createBrandValidator,
  createBrand
);

router.get("/:id", getBrandValidator, getBrand);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  uploadBrandImage,
  resizeBrandImage,
  updateBrandValidator,
  updateBrand
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteBrandValidator,
  deleteBrand
);

module.exports = router;
