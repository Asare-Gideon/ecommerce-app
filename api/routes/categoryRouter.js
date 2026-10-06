const {
  createCategory,
  getAllCategories,
  updateCategory,
  getSingleCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require("../controllers/categoryCtrl");
const { isAdmin, authorizeUser } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/get-all", getAllCategories);
router.get("/get-one/:id", getSingleCategory);
router.get("/toggle-active/:id", authorizeUser, isAdmin, toggleCategoryStatus);
router.post("/create", authorizeUser, isAdmin, createCategory);
router.put("/update/:id", authorizeUser, isAdmin, updateCategory);
router.delete("/delete/:id", authorizeUser, isAdmin, deleteCategory);

module.exports = router;
