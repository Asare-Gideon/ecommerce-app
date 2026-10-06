const router = require("express").Router();
const {
  getSettings,
  updateStoreSettings,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updateActivePaymentMethods,
} = require("../controllers/settingsCtrl");
const { authorizeUser, isAdmin } = require("../middleware/authMiddleware");

router.get("/", getSettings);
router.put("/", authorizeUser, isAdmin, updateStoreSettings);

router.post("/shipping-methods", authorizeUser, isAdmin, createShippingMethod);
router.put("/shipping-methods/:id", authorizeUser, isAdmin, updateShippingMethod);
router.delete("/shipping-methods/:id", authorizeUser, isAdmin, deleteShippingMethod);

router.post("/payment-methods", authorizeUser, isAdmin, createPaymentMethod);
router.put("/payment-methods/active", authorizeUser, isAdmin, updateActivePaymentMethods);
router.put("/payment-methods/:id", authorizeUser, isAdmin, updatePaymentMethod);
router.delete("/payment-methods/:id", authorizeUser, isAdmin, deletePaymentMethod);

module.exports = router;
