const express = require("express");
const router = express.Router();
const { protect } = require("../../controllers/auth.controller");

const User = require("../../models/user.model");

router.get("/users", protect, async (req, res, next) => {
  try {
    let filter = {};
    const apiFeatures = require("../../utils/apiFeatures");
    const ApiFeatures = apiFeatures;
    const documentCounts = await User.estimatedDocumentCount();
    const apiFeaturesInstance = new ApiFeatures(User.find(filter), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .pagination(documentCounts);

    const { mongooseQuery, paginationResult } = apiFeaturesInstance;
    const users = await mongooseQuery;

    res.render("users/list", {
      user: req.user || null,
      data: users,
      paginationResult,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/create", protect, (req, res) => {
  res.render("users/create", { user: req.user || null });
});

router.get("/users/me", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/profile", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/me/edit", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/edit", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/changeMyPassword", protect, (req, res) => {
  res.render("users/changePassword", {
    user: req.user || null,
  });
});

// FIXED: Moved /users/addresses BEFORE /users/:id to prevent route conflicts
router.get("/users/addresses", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/addresses", {
      user: req.user,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("users/profile", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id/edit", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("error", { message: "User not found" });
    }
    res.render("users/edit", {
      user: req.user || null,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
