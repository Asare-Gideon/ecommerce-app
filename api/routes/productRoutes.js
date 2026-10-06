const {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  addProductRating,
  togglePublishProduct,
  applyDiscountToProducts,
  getProductsTotals,
  getPopularProducts,
} = require("../controllers/productCtrl");
const { authorizeUser, isAdmin } = require("../middleware/authMiddleware");
const router = require("express").Router();

router.get("/query", getAllProduct);
router.get("/popular", getPopularProducts);
router.get("/get-one/:id", getSingleProduct);
router.get("/get-totals", authorizeUser, isAdmin, getProductsTotals);
router.get(
  "/toggle-published/:id",
  authorizeUser,
  isAdmin,
  togglePublishProduct
);
router.post("/create", authorizeUser, isAdmin, createProduct);
router.put("/apply-discount", authorizeUser, isAdmin, applyDiscountToProducts);
router.put("/update/:id", authorizeUser, isAdmin, updateProduct);
router.put("/rattings/:productId", addProductRating);

router.delete("/delete/:id", authorizeUser, isAdmin, deleteProduct);

module.exports = router;
