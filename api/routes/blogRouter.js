const {
  getBlogs,
  getSingleBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  togglePublish,
} = require("../controllers/blogCtrl");
const { isAdmin, authorizeUser } = require("../middleware/authMiddleware");
const router = require("express").Router();

router.get("/query", getBlogs);
router.get("/get-one/:id", getSingleBlog);
router.post("/create", authorizeUser, isAdmin, createBlog);
router.put("/update/:id", authorizeUser, isAdmin, updateBlog);
router.put("/like/:id", authorizeUser, likeBlog);
router.put("/comment/:id", authorizeUser, addComment);
router.put("/publish/:id", authorizeUser, isAdmin, togglePublish);
router.delete("/delete/:id", authorizeUser, isAdmin, deleteBlog);

module.exports = router;
