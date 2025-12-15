const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const asyncHandler = require("express-async-handler");
const factory = require("./handlerFactor");
const ApiError = require("../utils/apiError");
const Order = require("../models/order.model");
const Product = require("../models/product.model")
const Cart = require("../models/cart.model")

// @desc Create cash order
// @route POST /api/v1/orders/cartId
// @access Private

const createCashOrder = asyncHandler(async (req, res, next) => {
    const taxPrice = 0;
    const shippingPrice = 0;
    // 1- get Cart depend on cartId
    const cart = await Cart.findById(req.params.cartId)
    if (!cart) {
        return next(new ApiError("Cart not found", 404))
    }
    // 2- get order price depend on cart price (check if coupon aplly)
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
    // 3- create order with default type cash
    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        taxPrice: taxPrice,
        shoppingPrice: shippingPrice,
        totalOrderPrice: totalOrderPrice,
        shippingAddress: req.body.shippingAddress
    })
    // 4- Decrement Quantity & Increment sold
    if(order){
      const bulkOption = cart.cartItems.map(item => ({
          updateOne: {
              filter: { _id: item.product },
              update: { $inc: {quantity: -item.quantity, sold: +item.quantity} }
          }
      }))
      await Product.bulkWrite(bulkOption, {})
    }
    // 5- delete cart
    await Cart.findByIdAndDelete(req.params.cartId)
    res.status(201).json({
        status: "success",
        message: "Order created successfully",
        data: order
    })
})

// @desc Get All Orders
// @route GET /api/v1/orders
// @access Private

const filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
    if(req.user.role === "user") req.filterObj = {user: req.user._id}
    next();
})

const findAllOrders = factory.getAll(Order);


// @desc Get specific order
// @route GET /api/v1/orders/:id
// @access Private
const findSpecificOrder = factory.getOne(Order)

// @desc Update order to paid
// @route PUT /api/v1/orders/:id/pay
// @access Admin
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ApiError("There is no order with this id", 404))
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    const updatedOrder =  await order.save();
    res.status(200).json({
        status: "success",
        message: "Order paid successfully",
        data: updatedOrder
    })
})

// @desc Update order to paid
// @route PUT /api/v1/orders/:id/delivered
// @access Admin
const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if(!order){
        return next(new ApiError("There is no order with this id", 404))
    }
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder =  await order.save();
    res.status(200).json({
        status: "success",
        message: "Order delivered successfully",
        data: updatedOrder
    })
})


// @desc Get Checkout Session From stripe
// @route GET /api/v1/orders/checkout-session/cartId
// @access Private
const getCheckoutSession = asyncHandler(async (req, res, next) => {
    const taxPrice = 0;
    const shippingPrice = 0;
    // 1- get Cart depend on cartId
    const cart = await Cart.findById(req.params.cartId)
    if (!cart) {
        return next(new ApiError("Cart not found", 404))
    }
    // 2- get order price depend on cart price (check if coupon aplly)
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
    // 3- create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
            price_data: {
                currency: "egp",
                product_data: {
                    name: "Topico Order",
                    description: `Order by ${req.user.name}`
                },
                unit_amount: totalOrderPrice * 100,
            },
            quantity: 1,
        }],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/orders?success=true`, 
        cancel_url: `${req.protocol}://${req.get("host")}/cart?canceled=true`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        shipping_address_collection: {
            allowed_countries: ['EG', 'US', 'AE', 'SA'], 
        }
    })
    res.status(200).json({status: "success" ,session })
})

module.exports = {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  getCheckoutSession
}