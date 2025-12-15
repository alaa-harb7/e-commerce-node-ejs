const express = require("express");

const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  getCheckoutSession


} = require("../controllers/order.contorller");

const { protect, allowedTo } = require("../controllers/auth.controller");

const router = express.Router();

router.get("/checkout-session/:cartId", protect, allowedTo("user"), getCheckoutSession)

router.post(
  "/:cartId",
  protect,
  allowedTo("user"),
  createCashOrder
);

router.get("/", allowedTo("user", "admin"), 
filterOrderForLoggedUser,
findAllOrders);
router.get("/:id", allowedTo("user", "admin"), findSpecificOrder);

router.put("/:id/pay", allowedTo("admin"), updateOrderToPaid)
router.put("/:id/delivered", allowedTo("admin"), updateOrderToDelivered)

module.exports = router;
