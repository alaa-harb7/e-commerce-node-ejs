const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
  cart.cartItems.forEach((product) => {
    totalPrice += product.price * product.quantity;
  })

  return totalPrice;  
}

// @desc Add product to cart
// @route POST /api/v1/cart
// @access Private
const addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError("User not found", 404));
  } 
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  
  // check if product has this color (only if product has colors)
  if (product.colors && product.colors.length > 0 && !product.colors.includes(color)) {
    return next(new ApiError("Product does not have this color", 404));
  }
  
  let cart = await Cart.findOne({ user: user._id });
  if (!cart) {
    const newCart = await Cart.create({
      user: req.user._id,
      cartItems: [{
        product: product._id,
        color,
        price: product.price,
      }],
      totalCartPrice: product.price,
    });
    return res.status(200).json({
      status: "success",
      message: "Product added to cart successfully",
      data: newCart,
    });
  }
  
  const productIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === productId && 
    item.color === color
  );
  if (productIndex > -1) {
    const cartItem = cart.cartItems[productIndex];
    cartItem.quantity += 1;
    cart.cartItems[productIndex] = cartItem;
  } else {
    cart.cartItems.push({
      product: product._id,
      color,
      price: product.price,
    });
  }

  const totalPrice = calcTotalCartPrice(cart)
  cart.totalCartPrice = totalPrice;

  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    data: cart,
  });
});


// @desc Get logged user cart
// @route GET /api/v1/cart
// @access Private
const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  res.status(200).json({
    status: "success", 
    count: cart.cartItems.length,
    data: cart,
  });
}); 

// @desc Remove product from cart
// @route DELETE /api/v1/cart/:productId
// @access Private
const removeLoggedUserFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate({user: req.user._id}, {
    $pull: {
      cartItems: {
        product: req.params.productId,
      },
    }
  }, {
    new: true,
  });

  const totalPrice = calcTotalCartPrice(cart)
  cart.totalCartPrice = totalPrice;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
    data: cart,
  });
})


// @desc Clear logged user cart
// @route DELETE /api/v1/cart
// @access Private
const clearLoggedUserCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({user: req.user._id});
 
  res.status(204).json({
    status: "success",
    message: "Cart cleared successfully",
  });
})

// @desc Update cart item quantity
// @route PUT /api/v1/cart/:productId
// @access Private
const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const {quantity} = req.body;
  const cart = await Cart.findOne({user: req.user._id})
  if(!cart){
    return next(new ApiError("Cart not found", 404));
  }

  const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === req.params.productId)

  if(itemIndex === -1){
    return next(new ApiError("Product not found in cart", 404));
  }

  cart.cartItems[itemIndex].quantity = quantity;

  const totalPrice = calcTotalCartPrice(cart)
  cart.totalCartPrice = totalPrice;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart item quantity updated successfully",
    data: cart,
  });
})

// @desc Apply Coupon
// @route PUT /api/v1/cart/apply-coupon
// @access Private
const applyCouponToCart = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findOne({name: req.body.coupon, expire: {$gte: Date.now()}})

  if(!coupon){
    return next(new ApiError("Invalid coupon", 404));
  }

  const cart = await Cart.findOne({user: req.user._id})

  if(!cart){
    return next(new ApiError("Cart not found", 404));
  }

  const totalPrice = calcTotalCartPrice(cart)

  let totalPriceAfterDiscount = 0;
  if(coupon.discountType === 'percentage') {
      totalPriceAfterDiscount = (totalPrice - (totalPrice * coupon.discount / 100)).toFixed(2)
  } else if (coupon.discountType === 'fixed') {
       totalPriceAfterDiscount = (totalPrice - coupon.discount).toFixed(2)
  }

  // Ensure price doesn't go below 0
  if (totalPriceAfterDiscount < 0) totalPriceAfterDiscount = 0;

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    data: cart,
  });
})


module.exports = {
  addProductToCart,
  getLoggedUserCart,
  removeLoggedUserFromCart,
  clearLoggedUserCart,
  updateCartItemQuantity,
  applyCouponToCart,

};