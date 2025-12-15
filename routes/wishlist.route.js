const express = require("express");
const {
  addToWishlistValidator,
  removeFromWishlistValidator,
} = require("../utils/validators/wishlistValidators");

const {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
} = require("../controllers/wishlist.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/",
  protect,
  allowedTo("user"),
  addToWishlistValidator,

  addToWishlist
);

router.get("/", protect, allowedTo("user"), getUserWishlist)

router.delete(
  "/:productId",
  protect,
  allowedTo("user"),
  removeFromWishlistValidator,

  removeFromWishlist
);

module.exports = router;
