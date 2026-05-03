const express = require("express");
const router = express.Router();
const { logout } = require("../../controllers/auth.controller");

// Auth routes
router.get("/auth/login", (req, res) => {
  res.render("auth/login", { user: req.user || null });
});

router.get("/auth/signup", (req, res) => {
  res.render("auth/signup", { user: req.user || null });
});

router.get("/auth/forgotPassword", (req, res) => {
  res.render("auth/forgotPassword", { user: req.user || null });
});

router.get("/auth/verifyResetCode", (req, res) => {
  res.render("auth/verifyResetCode", {
    user: req.user || null,
    email: req.query.email || "",
  });
});

router.get("/auth/resetPassword", (req, res) => {
  res.render("auth/resetPassword", {
    user: req.user || null,
    email: req.query.email || "",
  });
});

router.get("/auth/logout", logout);

module.exports = router;
