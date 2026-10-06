const router = require("express").Router();
const {
  createUser,
  loginUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  handleLogout,
  forgotpassword,
  resetPassowrd,
  addToCarts,
  removeFromCarts,
  toggleWishlist,
  getWishlist,
  getUserTotals,
  verifyResetCode,
  changePassword,
  deleteOwnAccount,
} = require("../controllers/userCtl");
const { authorizeUser, isAdmin } = require("../middleware/authMiddleware");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/forgotpassword", forgotpassword);
router.post("/reset-password", resetPassowrd);
router.post("/verify-reset-code", verifyResetCode);
router.get("/get-all", getAllUser);
router.get("/get-totals", authorizeUser, isAdmin, getUserTotals);
router.get("/refresh/:refreshToken", handleRefreshToken);
router.get("/logout", handleLogout);
router.get("/get-one/:id", authorizeUser, getSingleUser);
router.get("/get-wishlist/:id", getWishlist);
router.put("/update/:id", authorizeUser, updateUser);
router.put("/change-password", authorizeUser, changePassword);
router.delete("/delete-account", authorizeUser, deleteOwnAccount);
router.delete("/delete/:id", deleteUser);
router.put("/block-user/:id", authorizeUser, isAdmin, blockUser);
router.put("/unblock-user/:id", authorizeUser, isAdmin, unblockUser);
router.put("/add-to-carts/:id", authorizeUser, addToCarts);
router.put("/remove-from-carts/:id", authorizeUser, removeFromCarts);
router.put("/wishlist/:id", toggleWishlist);

module.exports = router;
