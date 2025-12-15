const express = require("express");
// const {
//   getCartValidator,
//   createCartValidator,
//   updateCartValidator,
//   deleteCartValidator,
// } = require("../utils/validators/cartValidators");

const {
  addProductToCart,
  getLoggedUserCart,
  removeLoggedUserFromCart,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCouponToCart
} = require("../controllers/cart.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");
 
const router = express.Router();

router.post(
  "/",
  protect,
  allowedTo("user"),
  addProductToCart
);

router.get("/", protect, allowedTo("user"), getLoggedUserCart);

router.put("/apply-coupon", protect, allowedTo("user"), applyCouponToCart);

router.put("/:productId", protect, allowedTo("user"), updateCartItemQuantity);

router.delete("/:productId", protect, allowedTo("user"), removeLoggedUserFromCart);

router.delete("/", protect, allowedTo("user"), clearLoggedUserCart);

module.exports = router;
