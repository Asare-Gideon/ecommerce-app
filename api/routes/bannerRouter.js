const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerCtrl");
const { isAdmin, authorizeUser } = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/get-all", getBanners);
router.post("/create", authorizeUser, isAdmin, createBanner);
router.put("/update/:id", authorizeUser, isAdmin, updateBanner);
router.delete("/delete/:id", authorizeUser, isAdmin, deleteBanner);

module.exports = router;
