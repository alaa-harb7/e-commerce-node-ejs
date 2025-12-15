const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required:[true,"Coupon name is required"],
    unique: true,
    trim: true,
  },
  expire:{
    type:Date,
    required:[true,"Coupon expire date is required"],
  },
  discount:{
    type:Number,
    required:[true,"Coupon discount is required"],
    validate:{
      validator:function(v){
        return v >= 0 && v <= 100
      },
      message:"Coupon discount must be between 0 and 100"
    }
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  usageLimit: {
    type: Number,
    default: 100
  },
  usedCount: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model("Coupon", couponSchema);