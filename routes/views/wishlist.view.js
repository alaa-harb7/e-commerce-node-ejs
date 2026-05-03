const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const User = require("../../models/user.model");

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

module.exports = router;
