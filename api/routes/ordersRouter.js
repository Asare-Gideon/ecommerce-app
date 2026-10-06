const express = require("express");
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  getOrderStatusTotals,
  getOrdersByUserId,
  deleteOrder,
  initializePaystackPayment,
  verifyPaystackPayment,
} = require("../controllers/orderCtrl");
const { authorizeUser, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authorizeUser, createOrder);
router.post("/paystack/initialize/:id", authorizeUser, initializePaystackPayment);
router.get("/paystack/verify/:reference", authorizeUser, verifyPaystackPayment);
router.get("/get-all", authorizeUser, isAdmin, getAllOrders);
router.get("/get-one/:id", getSingleOrder);
router.get("/get-by-user/:userId", getOrdersByUserId);
router.get("/totals", authorizeUser, isAdmin, getOrderStatusTotals);
router.put("/status/update/:id", authorizeUser, isAdmin, updateOrderStatus);
router.delete("/delete/:id", authorizeUser, isAdmin, deleteOrder);

module.exports = router;
