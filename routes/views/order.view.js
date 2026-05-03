const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Order = require("../../models/order.model");

router.get("/orders", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.render("orders/list", {
      user: req.user,
      orders: orders,
      success: req.query.success
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
