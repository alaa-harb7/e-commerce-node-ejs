const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const Product = require("../../models/product.model");
const CategoryModel = require("../../models/category.model");
const Brand = require("../../models/brand.model");

router.get("/products", async (req, res, next) => {
  try {
    // Build filter object
    let filter = {};
    
    // Build search filter if keyword exists
    if (req.query.keyword) {
      filter.$or = [
        { title: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    }
    
    // Filter by Category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by SubCategory (check if ID exists in subcategories array)
    if (req.query.subCategory) {
      filter.subcategories = { $in: [req.query.subCategory] };
    }

    // Filter by Brand
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }
    
    // Filter by Price Range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }
    
    // Filter by Quantity (In Stock / Out of Stock)
    if (req.query.inStock === 'true') {
      filter.quantity = { $gt: 0 };
    } else if (req.query.inStock === 'false') {
      filter.quantity = 0;
    }
    
    // Filter by Colors
    if (req.query.colors) {
      const colorsArray = Array.isArray(req.query.colors) ? req.query.colors : [req.query.colors];
      filter.colors = { $in: colorsArray };
    }
    
    // Check if user wants to see all products (no pagination)
    const showAll = req.query.showAll === "true" || req.query.limit === "all";
    
    let products;
    let paginationResult = null;
    
    if (showAll) {
      // Show ALL products without pagination
      products = await Product.find(filter)
        .populate("category", "name")
        .sort("-createdAt");
    } else {
      // Paginated view
      // Get total count for pagination (after filters)
      const totalCount = await Product.countDocuments(filter);
      
      // Pagination settings
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;
      
      // Execute query with pagination
      products = await Product.find(filter)
        .populate("category", "name")
        .sort(req.query.sort || "-createdAt")
        .skip(skip)
        .limit(limit);
      
      // Build pagination result
      paginationResult = {
        page,
        limit,
        totalCount,
        numberOfPages: Math.ceil(totalCount / limit),
      };
      
      if (skip > 0) {
        paginationResult.prev = page - 1;
      }
      
      if (page * limit < totalCount) {
        paginationResult.next = page + 1;
      }
    }
    
    // Fetch all categories for filter
    const categories = await CategoryModel.find();
    
    // Get unique colors from all products
    const allProducts = await Product.find({}, 'colors');
    const uniqueColors = [...new Set(allProducts.flatMap(p => p.colors || []))].filter(Boolean);

    res.render("products/list", {
      user: req.user || null,
      data: products || [],
      paginationResult,
      query: req.query,
      showAll: showAll,
      categories: categories || [],
      availableColors: uniqueColors || [],
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
});

router.get("/products/create", protect, async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    const brands = await Brand.find();
    res.render("products/create", {
      user: req.user || null,
      categories,
      brands,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).render("error", { message: "Product not found" });
    }
    res.render("products/detail", {
      user: req.user || null,
      data: product,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id/edit", protect, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    const categories = await CategoryModel.find();
    const brands = await Brand.find();
    if (!product) {
      return res.status(404).render("error", { message: "Product not found" });
    }
    res.render("products/edit", {
      user: req.user || null,
      data: product,
      categories,
      brands,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
