const express = require("express");
const router = express.Router();
const getUserForView = require("../../middlewares/viewMiddleware");

// Apply middleware to get user for all view routes
router.use(getUserForView);

// Import all view route modules
const homeRoutes = require("./home.view");
const authRoutes = require("./auth.view");
const productRoutes = require("./product.view");
const categoryRoutes = require("./category.view");
const subcategoryRoutes = require("./subcategory.view");
const brandRoutes = require("./brand.view");
const userRoutes = require("./user.view");
const cartRoutes = require("./cart.view");
const wishlistRoutes = require("./wishlist.view");
const orderRoutes = require("./order.view");
const chatRoutes = require("./chat.view");
const couponRoutes = require("./coupon.view");

// Use all view routes
router.use("/", homeRoutes);
router.use("/", authRoutes);
router.use("/", productRoutes);
router.use("/", categoryRoutes);
router.use("/", subcategoryRoutes);
router.use("/", brandRoutes);
router.use("/", userRoutes);
router.use("/", cartRoutes);
router.use("/", wishlistRoutes);
router.use("/", orderRoutes);
router.use("/", chatRoutes);
router.use("/", couponRoutes);

module.exports = router;
