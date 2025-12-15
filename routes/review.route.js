const express = require("express");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidators");

const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  createFilterObj,
  setProductIdAndUserIdToBody
} = require("../controllers/review.controller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router({ mergeParams: true });

router.get("/", createFilterObj, getReviews);
router.post(
  "/",
  protect,
  allowedTo("user"),
  setProductIdAndUserIdToBody,
  createReviewValidator,
  createReview
);

router.get("/:id", getReviewValidator ,getReview);
router.put(
  "/:id",
  protect,
  allowedTo("user"),
  updateReviewValidator,
  updateReview
);
router.delete(
  "/:id",
  protect,
  allowedTo("admin", "user"),
  deleteReviewValidator,
  deleteReview
);

module.exports = router;
