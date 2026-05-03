const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Category = require("../../models/category.model");

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.render("categories/list", {
      user: req.user || null,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/categories/create", protect, (req, res) => {
  res.render("categories/create", { user: req.user || null });
});

router.get("/categories/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).render("error", { message: "Category not found" });
    }
    res.render("categories/detail", {
      user: req.user || null,
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/categories/:id/edit", protect, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).render("error", { message: "Category not found" });
    }
    res.render("categories/edit", {
      user: req.user || null,
      category: category,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
