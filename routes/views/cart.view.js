const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Cart = require("../../models/cart.model");

router.get("/cart", protect, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("cartItems.product");
    res.render("cart", {
      user: req.user,
      cart: cart
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
