const express = require("express");
const router = express.Router();

const Product = require("../../models/product.model");
const CategoryModel = require("../../models/category.model");
const Brand = require("../../models/brand.model");

// Home route - TOPICO Design
router.get("/", async (req, res, next) => {
  try {
    // 1. Fetch limited products for homepage
    const products = await Product.find({})
      .populate("category", "name")
      .limit(8)
      .sort("-createdAt");

    // 2. Fetch Categories that have Subcategories for Sidebar
    // Aggregation: Lookup subcategories for each category, filter where subcategories array is not empty
    const categoriesWithSubcats = await CategoryModel.aggregate([
      {
        $lookup: {
          from: "subcategories", // Determine collection name based on model
          localField: "_id",
          foreignField: "category",
          as: "subcategories"
        }
      },
      {
        $match: {
          "subcategories.0": { $exists: true } // Only keep categories with at least 1 subcategory
        }
      }
    ]);

    // 3. Fetch all categories for the new Home Page section
    const allCategories = await CategoryModel.find().limit(10); 

    // 4. Fetch Brands for Home Page
    const brands = await Brand.find().limit(10);

    res.render("index", { 
      user: req.user || null,
      products: products || [],
      sidebarCategories: categoriesWithSubcats,
      featuredCategories: allCategories,
      brands: brands 
    });
  } catch (error) {
    next(error);
  }
});

// About route
router.get("/about", (req, res) => {
  res.render("about", { user: req.user || null });
});

// Contact route
router.get("/contact", (req, res) => {
  res.render("contact", { user: req.user || null });
});

module.exports = router;
