const express = require("express");
const { signupValidator, loginValidator } = require("../utils/validators/authValidators");

const { signup, login, forgotPassword, verifyResetCode, resetPassword } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);



module.exports = router;
