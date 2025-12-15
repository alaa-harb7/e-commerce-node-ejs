const express = require("express");

const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/", getCoupons);
router.post(
  "/",
  protect,
  allowedTo("admin"),
  createCoupon
);

router.get("/:id", getCoupon);
router.put(
  "/:id",
  protect,
  allowedTo("admin"),
  updateCoupon
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin"),
  deleteCoupon
);

module.exports = router;
