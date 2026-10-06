const {
  createCategory,
  getAllCategories,
  updateCategory,
  getSingleCategory,
  deleteCategory,
} = require("../controllers/blogCategoryCtrl");
const { isAdmin, authorizeUser } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/get-all", getAllCategories);
router.get("/get-one/:id", getSingleCategory);
router.post("/create", authorizeUser, isAdmin, createCategory);
router.put("/update/:id", authorizeUser, isAdmin, updateCategory);
router.delete("/delete/:id", authorizeUser, isAdmin, deleteCategory);

module.exports = router;
