const express = require("express");
const {
  recordSale,
  getAllSales,
  getSingleSale,
  getTotalSalesAmount,
  getConversionMetrics,
  getSalesPerformance,
  generateSalesReport,
  getYearlyMonthlyStats,
} = require("../controllers/salesCtrl");

const router = express.Router();

router.post("/create", recordSale);
router.get("/get-all", getAllSales);
router.get("/get-one/:id", getSingleSale);
router.get("/total-amount", getTotalSalesAmount);
router.get("/conversion-metrics", getConversionMetrics);
router.get("/sales-performance", getSalesPerformance);
router.get("/generate-report", generateSalesReport);
router.get("/yearly-monthly-stats", getYearlyMonthlyStats);


module.exports = router;
