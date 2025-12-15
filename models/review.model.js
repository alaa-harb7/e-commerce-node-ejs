const mongoose = require("mongoose");
const ProductModel = require("./product.model")

const reviewSchema = new mongoose.Schema(
  {
    ratings: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      required: [true, "Rating is required"],
    },
    title: {
      type: String,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minlength: [10, "Review comment must be at least 10 characters"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "ProductModel",
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next;
});

// Create Method to calc the average and count of ratings
reviewSchema.statics.calcAverageRatingsAndQuantity = async function(productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRating,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  }else {
    await ProductModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
}

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post("remove", function () {
  this.constructor.calcAverageRatingsAndQuantity(this.product);
});

module.exports = mongoose.model("ReviewModel", reviewSchema);
