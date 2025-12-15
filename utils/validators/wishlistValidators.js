const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Product = require("../../models/product.model");




exports.addToWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid Product id format").notEmpty().withMessage("Product id is required")
  // check if this product in a database 
  .custom((value, { req }) => {
    return Product.findById(value).then((product) => {
      if (!product) {
        throw new Error("Product not found");
      }
      return true;
    });
  }),
  validatorMiddleware,
];


exports.removeFromWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid Product id format").notEmpty().withMessage("Product id is required")
  .custom((value, { req }) => {
    return Product.findById(value).then((product) => {
      if (!product) {
        throw new Error("Product not found");
      }
      return true;
    });
  }),
  validatorMiddleware,
];
