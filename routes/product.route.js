const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  resizeProductImage,
  sanitizeBrandField,
} = require("../controllers/product.controller");

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidators");

const reviewRoute = require("./review.route");

const { protect, allowedTo } = require("../controllers/auth.controller");

router.use("/:productId/reviews", reviewRoute);

router.post(
  "/",
  protect,
  allowedTo("admin"),
  uploadProductImage,
  resizeProductImage,
  sanitizeBrandField,
  createProductValidator,
  createProduct
);
router.get("/", getProducts);
router.get("/:id", getProductValidator, getProduct);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  uploadProductImage,
  resizeProductImage,
  sanitizeBrandField,
  updateProductValidator,
  updateProduct
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteProductValidator,
  deleteProduct
);

module.exports = router;
