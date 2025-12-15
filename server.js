const path = require("path");

const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression")

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddlleware");
const getUserForView = require("./middlewares/viewMiddleware");

// Routes
const categoryRoute = require("./routes/category.route");
const subCategoryRoute = require("./routes/subCategory.route");
const brandRoute = require("./routes/brand.route");
const productRoute = require("./routes/product.route");
const userRoute = require("./routes/user.route");
const authRoute = require("./routes/auth.route");
const reviewRoute = require("./routes/review.route");
const wishlistRoute = require("./routes/wishlist.route");
const addressRoute = require("./routes/address.route");
const couponRoute = require("./routes/coupon.route");
const cartRoute = require("./routes/cart.route");
const orderRoute = require("./routes/order.route");

// Connect to DB
const connectDB = require("./config/db");

connectDB();

// Express app
const app = express();

// CROS 
app.use(cors())
app.options(/.*/, cors())

// Compression all response
app.use(compression())

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));
app.use(getUserForView);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// View Routes (must be before API routes to avoid conflicts)
const viewRoutes = require("./routes/viewRoutes");

app.use("/", viewRoutes);

// API Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/wishlist", wishlistRoute);
app.use("/api/v1/addresses", addressRoute);
app.use("/api/v1/coupons", couponRoute);
app.use("/api/v1/cart", cartRoute);
app.use("/api/v1/orders", orderRoute);

app.all(/.*/, (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

// const port = process.env.PORT || 8000;
// const server = app.listen(port, () =>
//   console.log(`The Server is Running on http://localhost:${port}`)
// );

module.exports = app;

// Initialize Socket.IO
require("./utils/socketHandler")(app);

// Handle Rejections outside Express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandleRejection Error: ${err.name} ${err.message}`);

  app.close(() => process.exit(1));
});
