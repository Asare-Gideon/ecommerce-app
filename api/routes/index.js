const router = require("express").Router();
const authRoute = require("./auth");
const productRoute = require("./productRoutes");
const categoryRoute = require("./categoryRouter");
const blogRouter = require("./blogRouter");
const blogCategoryRouter = require("./blogCategoryRouter");
const bannerRouter = require("./bannerRouter");
const salesRouter = require("./salesRouter");
const orderRouter = require("./ordersRouter");
const addressRoute = require("./addressRoute");
const settingsRouter = require("./settingsRouter");
const notificationRouter = require("./notificationRouter");

router.use("/product", productRoute);
router.use("/user", authRoute);
router.use("/category", categoryRoute);
router.use("/blog", blogRouter);
router.use("/blog-category", blogCategoryRouter);
router.use("/banner", bannerRouter);
router.use("/sales", salesRouter);
router.use("/order", orderRouter);
router.use("/address", addressRoute);
router.use("/settings", settingsRouter);
router.use("/notifications", notificationRouter);

module.exports = router;
