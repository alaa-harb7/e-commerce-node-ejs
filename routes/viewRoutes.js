const express = require("express");
const router = express.Router();
const getUserForView = require("../middlewares/viewMiddleware");
const { protect, logout } = require("../controllers/auth.controller");

// Apply middleware to get user for all view routes
router.use(getUserForView);

const Product = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const SubCategoryModel = require("../models/subCategory.model");
const Brand = require("../models/brand.model");

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

// Auth routes
router.get("/auth/login", (req, res) => {
  res.render("auth/login", { user: req.user || null });
});

router.get("/auth/signup", (req, res) => {
  res.render("auth/signup", { user: req.user || null });
});

router.get("/auth/forgotPassword", (req, res) => {
  res.render("auth/forgotPassword", { user: req.user || null });
});

router.get("/auth/verifyResetCode", (req, res) => {
  res.render("auth/verifyResetCode", {
    user: req.user || null,
    email: req.query.email || "",
  });
});

router.get("/auth/resetPassword", (req, res) => {
  res.render("auth/resetPassword", {
    user: req.user || null,
    email: req.query.email || "",
  });
});

router.get("/auth/logout", logout);

// Product routes

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

// Category routes
const Category = require("../models/category.model");

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

// SubCategory routes
const SubCategory = require("../models/subCategory.model");

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

// Brand routes
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

// User routes
const User = require("../models/user.model");

router.get("/users", protect, async (req, res, next) => {
  try {
    let filter = {};
    const apiFeatures = require("../utils/apiFeatures");
    const ApiFeatures = apiFeatures;
    const documentCounts = await User.estimatedDocumentCount();
    const apiFeaturesInstance = new ApiFeatures(User.find(filter), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .pagination(documentCounts);

    const { mongooseQuery, paginationResult } = apiFeaturesInstance;
    const users = await mongooseQuery;

    res.render("users/list", {
      user: req.user || null,
      data: users,
      paginationResult,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/profile", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Specific User Routes (MUST be before /users/:id)
router.get("/users/me/edit", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/edit", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/changeMyPassword", protect, (req, res) => {
  res.render("users/changePassword", {
    user: req.user || null,
  });
});

router.get("/users/create", protect, (req, res) => {
  res.render("users/create", { user: req.user || null });
});

router.get("/users/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("users/profile", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id/edit", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("users/edit", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Cart Route
const Cart = require("../models/cart.model");
const Coupon = require("../models/coupon.model");

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

// Wishlist Route
router.get("/wishlist", protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        res.render("wishlist", {
            user: req.user,
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
});

// Address Routes
router.get("/users/addresses", protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("users/addresses", {
            user: req.user,
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
});

// Order Routes
const Order = require("../models/order.model");

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



// Chat Routes
const Message = require("../models/message.model");

// Admin: List of conversations
router.get("/admin/chats", protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
             return res.status(403).render("error", { message: "Access denied" });
        }
        
        // Find distinct users who have sent messages + populate their info
        const messages = await Message.find({ role: 'user' }).sort("-createdAt");
        const uniqueSenders = [];
        const seenSenders = new Set();
        
        for (const msg of messages) {
            if (!seenSenders.has(msg.sender.toString())) {
                seenSenders.add(msg.sender.toString());
                const user = await User.findById(msg.sender);
                if(user) uniqueSenders.push({ user, lastMessage: msg });
            }
        }

        res.render("admin/chat/list", {
            user: req.user,
            conversations: uniqueSenders
        });
    } catch (error) {
        next(error);
    }
});

// Admin: Chat Detail
router.get("/admin/chats/:userId", protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
             return res.status(403).render("error", { message: "Access denied" });
        }
        
        const targetUser = await User.findById(req.params.userId);
        if(!targetUser) return res.status(404).render("error", {message: "User not found"});

        // Mark messages from this user as read
        await Message.updateMany({ sender: targetUser._id, read: false }, { read: true });

        const messages = await Message.find({
            $or: [
                { sender: targetUser._id },
                { receiver: targetUser._id } // Admin reply
            ]
        }).sort("createdAt");

        res.render("admin/chat/detail", {
            user: req.user,
            targetUser: targetUser,
            messages: messages
        });
    } catch (error) {
        next(error);
    }
});

// User: Chat Interface
router.get("/chat", protect, async (req, res, next) => {
    try {
        // Redirect Admin to Admin Chat List
        if (req.user.role === 'admin') {
            return res.redirect('/admin/chats');
        }

        // Fetch history
        const messages = await Message.find({
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        }).sort("createdAt");

        // Mark messages received by this user as read
        await Message.updateMany({ receiver: req.user._id, read: false }, { read: true });

        res.render("chat/index", {
            user: req.user,
            messages: messages
        });
    } catch (error) {
        next(error);
    }
});


// Coupon Routes
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


