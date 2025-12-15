const mongoose = require("mongoose")

const cartShema = new mongoose.Schema({
  cartItems: [ {
    product:{
      type: mongoose.Schema.ObjectId,
      ref: "Product"
    },
    quantity: {
      type: Number,
      default: 1
    },
    color: String,
    price: Number
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  totalCartPrice: Number,
  totalPriceAfterDiscount: Number 
})

module.exports = mongoose.model("Cart", cartShema)