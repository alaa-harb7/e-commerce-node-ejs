const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Brand = require("../../models/brand.model");

router.get("/brands", async (req, res, next) => {
  try {
    const brands = await Brand.find();
    res.render("brands/list", {
      user: req.user || null,
      data: brands,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/brands/create", protect, (req, res) => {
  res.render("brands/create", { user: req.user || null });
});

router.get("/brands/:id", async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).render("error", { message: "Brand not found" });
    }
    res.render("brands/detail", {
      user: req.user || null,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/brands/:id/edit", protect, async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).render("error", { message: "Brand not found" });
    }
    res.render("brands/edit", {
      user: req.user || null,
      data: brand,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
