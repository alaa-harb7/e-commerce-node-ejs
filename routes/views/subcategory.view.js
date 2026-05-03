const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const SubCategory = require("../../models/subCategory.model");
const Category = require("../../models/category.model");

router.get("/subcategories", async (req, res, next) => {
  try {
    const subCategories = await SubCategory.find().populate("category", "name");
    res.render("subcategories/list", {
      user: req.user || null,
      subcategories: subCategories,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/subcategories/create", protect, async (req, res, next) => {
  try {
    const categories = await Category.find(); // Need parents to select from
    res.render("subcategories/create", { 
      user: req.user || null, 
      categories 
    });
  } catch (error) {
    next(error);
  }
});

router.get("/subcategories/:id/edit", protect, async (req, res, next) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    const categories = await Category.find();
    if (!subCategory) {
      return res.status(404).render("error", { message: "SubCategory not found" });
    }
    res.render("subcategories/edit", {
      user: req.user || null,
      subCategory: subCategory,
      categories
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
