const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Coupon = require("../../models/coupon.model");

router.get("/admin/coupons", protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).render("error", { message: "Access denied" });
    }
    
    const coupons = await Coupon.find().sort("-createdAt");
    res.render("coupons/list", {
      user: req.user,
      coupons: coupons
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/coupons/create", protect, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).render("error", { message: "Access denied" });
  }
  res.render("coupons/create", { user: req.user });
});

router.get("/admin/coupons/:id/edit", protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).render("error", { message: "Access denied" });
    }
    
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).render("error", { message: "Coupon not found" });
    }

    res.render("coupons/edit", { 
      user: req.user,
      coupon: coupon 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
