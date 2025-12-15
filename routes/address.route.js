const express = require("express");

const {
  addToAddresses,
  removeFromAdresses,
  getUserAddresses
} = require("../controllers/addresses.controller");

const { protect, allowedTo } =  require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/",
  protect,
  allowedTo("user"),

  addToAddresses
);

router.get("/", protect, allowedTo("user"), getUserAddresses)

router.delete(
  "/:addressId",
  protect,
  allowedTo("user"),

  removeFromAdresses
);

module.exports = router;
