const Sales = require("../models/salesModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const moment = require('moment');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const { salesLogger } = require('../utils/logger');

// Helper function for date filtering
const getDateFilter = (dateType) => {
  const startDate = new Date();
  switch (dateType) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "monthly":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "yearly":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      return null;
  }
  return { $gte: startDate };
};

// RECORD A SALE
const recordSale = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  validateMongoDb(orderId);
  salesLogger.info('Starting sale record process', { orderId });

  try {
    const order = await Order.findById(orderId)
      .populate('products.product')
      .populate('user');

    if (!order || order.status !== "completed") {
      salesLogger.warn('Invalid order or incomplete status', {
        orderId,
        status: order?.status,
        exists: !!order
      });
      throw new Error("Order not found or not completed.");
    }

    // Format products data
    const products = order.products.map(item => ({
      product: item.product._id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.price ?? item.product.getEffectivePrice()
    }));

    salesLogger.debug('Prepared products data for sale', {
      orderId,
      productCount: products.length,
      totalAmount: order.totalAmount
    });

    const sale = await Sales.create({
      orderId: order._id,
      user: order.user._id,
      products,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveredAt: new Date()
    });

    salesLogger.info('Sale record created successfully', {
      saleId: sale._id,
      orderId: order._id,
      totalAmount: order.totalAmount
    });

    // Update product sold counts
    for (const item of order.products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.sold += item.quantity;
        await product.save();
        salesLogger.debug('Updated product sold count', {
          productId: product._id,
          quantity: item.quantity,
          newSoldCount: product.sold
        });
      }
    }

    res.json(sale);
  } catch (err) {
    salesLogger.error('Error in recordSale', {
      orderId,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error recording sale");
  }
});

// GET ALL SALES
const getAllSales = asyncHandler(async (req, res) => {
  try {
    salesLogger.info('Fetching all sales', { query: req.query });

    const sales = await Sales.find().populate([
      { path: "user", select: "firstName lastName email phone" },

    ])

    salesLogger.info('Sales fetched successfully', {
      count: sales.length
    });

    res.json(sales);
  } catch (err) {
    salesLogger.error('Error fetching sales', {
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching sales");
  }
});

// GET SINGLE SALE
const getSingleSale = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    salesLogger.info('Fetching single sale', { id });

    const sale = await Sales.findById(id)
      .populate('orderId')
      .populate('user')
      .populate('products.product');

    if (!sale) {
      salesLogger.warn('Sale not found', { id });
      throw new Error("Sale not found.");
    }

    salesLogger.info('Sale fetched successfully', { id });

    res.json(sale);
  } catch (err) {
    salesLogger.error('Error fetching sale', {
      id: req.params.id,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching sale");
  }
});

// GET TOTAL SALES AMOUNT
const getTotalSalesAmount = asyncHandler(async (req, res) => {
  try {
    const { timeframe } = req.query;
    salesLogger.info('Fetching total sales amount', { timeframe });

    const dateFilter = timeframe ? getDateFilter(timeframe) : null;

    const pipeline = [
      dateFilter ? { $match: { createdAt: dateFilter } } : {},
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ];

    const result = await Sales.aggregate(pipeline);

    salesLogger.info('Total sales amount fetched successfully', {
      timeframe,
      totalAmount: result[0]?.totalAmount || 0
    });

    res.json({
      success: true,
      data: result[0] || {
        totalAmount: 0,
        totalOrders: 0,
        averageOrderValue: 0
      }
    });
  } catch (err) {
    salesLogger.error('Error calculating total sales', {
      timeframe: req.query.timeframe,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error calculating total sales");
  }
});

// SALES STATISTICS AND ANALYTICS
const getSalesStatistics = asyncHandler(async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;
    salesLogger.info('Fetching sales statistics', { timeframe });

    const dateFilter = getDateFilter(timeframe);

    const pipeline = [
      dateFilter ? { $match: { createdAt: dateFilter } } : {},
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          totalOrders: { $sum: 1 },
          paymentMethods: {
            $push: {
              method: "$paymentMethod",
              amount: "$totalAmount"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          averageOrderValue: 1,
          totalOrders: 1,
          paymentMethods: {
            $reduce: {
              input: "$paymentMethods",
              initialValue: {
                card: 0,
                cash: 0,
                "bank transfer": 0
              },
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$$this.method", "card"] }, then: { card: { $add: ["$$value.card", "$$this.amount"] } } },
                        { case: { $eq: ["$$this.method", "cash"] }, then: { cash: { $add: ["$$value.cash", "$$this.amount"] } } },
                        { case: { $eq: ["$$this.method", "bank transfer"] }, then: { "bank transfer": { $add: ["$$value.bank transfer", "$$this.amount"] } } }
                      ],
                      default: "$$value"
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ];

    const statistics = await Sales.aggregate(pipeline);

    salesLogger.info('Sales statistics fetched successfully', {
      timeframe,
      totalRevenue: statistics[0]?.totalRevenue || 0
    });

    res.json({
      timeframe,
      statistics: statistics[0] || {
        totalRevenue: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        paymentMethods: {
          card: 0,
          cash: 0,
          "bank transfer": 0
        }
      }
    });
  } catch (err) {
    salesLogger.error('Error fetching sales statistics', {
      timeframe: req.query.timeframe,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching sales statistics");
  }
});

// ORDER TO SALES CONVERSION TRACKING
const getConversionMetrics = asyncHandler(async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;
    salesLogger.info('Fetching conversion metrics', { timeframe });

    const dateFilter = getDateFilter(timeframe);

    // Get total orders (excluding canceled orders for accuracy)
    const totalOrders = await Order.countDocuments(
      dateFilter ? { createdAt: dateFilter, status: { $ne: "canceled" } } : { status: { $ne: "canceled" } }
    );

    // Get completed sales (orders marked as completed or delivered)
    const completedSales = await Order.countDocuments(
      dateFilter ? { createdAt: dateFilter, status: { $in: ["completed", "delivered"] } } : { status: { $in: ["completed", "delivered"] } }
    );

    // Get cancelled orders
    const cancelledOrders = await Order.countDocuments({
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      status: "canceled"
    });

    const paymentMethodRows = await Order.aggregate([
      {
        $match: dateFilter
          ? { createdAt: dateFilter, status: { $ne: "canceled" } }
          : { status: { $ne: "canceled" } }
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const paymentMethods = paymentMethodRows.reduce((totals, item) => {
      const key = item._id || "unknown";
      totals[key] = item.totalAmount;
      return totals;
    }, {});

    // Calculate conversion rate
    const conversionRate = totalOrders > 0
      ? ((completedSales / totalOrders) * 100).toFixed(2)
      : 0;

    // Calculate abandonment rate
    const abandonmentRate = (cancelledOrders + totalOrders) > 0
      ? ((cancelledOrders / (cancelledOrders + totalOrders)) * 100).toFixed(2)
      : 0;

    salesLogger.info('Conversion metrics fetched successfully', {
      timeframe,
      conversionRate,
      abandonmentRate
    });

    res.json({
      timeframe,
      metrics: {
        totalOrders,
        completedSales,
        cancelledOrders,
        conversionRate: `${conversionRate}%`,
        abandonmentRate: `${abandonmentRate}%`
      },
      paymentMethods
    });
  } catch (err) {
    salesLogger.error('Error fetching conversion metrics', {
      timeframe: req.query.timeframe,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching conversion metrics");
  }
});


// SALES PERFORMANCE METRICS
const getSalesPerformance = asyncHandler(async (req, res) => {
  try {
    const { timeframe = "monthly" } = req.query;
    salesLogger.info('Fetching sales performance', { timeframe });

    const dateFilter = getDateFilter(timeframe);

    const pipeline = [
      dateFilter ? { $match: { createdAt: dateFilter } } : {},
      // Group by product and calculate metrics
      {
        $unwind: "$products"
      },
      {
        $group: {
          _id: "$products.product",
          totalQuantitySold: { $sum: "$products.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$products.price", "$products.quantity"]
            }
          },
          averageOrderValue: {
            $avg: {
              $multiply: ["$products.price", "$products.quantity"]
            }
          },
          orderCount: { $sum: 1 }
        }
      },
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $project: {
          _id: 0,
          productId: "$productDetails_id",
          productName: "$productDetails.title",
          productCategory: "$productDetails.category",
          productPrice: "$productDetails.price",
          productDescription: "$productDetails.description",
          productSlug: "$productDetails.slug",
          images: "$productDetails.images",
          totalQuantitySold: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          orderCount: 1
        }
      },
      // Sort by revenue in descending order
      { $sort: { totalRevenue: -1 } }
    ];

    const performance = await Sales.aggregate(pipeline);

    salesLogger.info('Sales performance fetched successfully', {
      timeframe,
      performanceCount: performance.length
    });

    res.json({
      timeframe,
      performance
    });
  } catch (err) {
    salesLogger.error('Error fetching sales performance', {
      timeframe: req.query.timeframe,
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching sales performance");
  }
});

// GENERATE SALES REPORT PDF
const generateSalesReport = asyncHandler(async (req, res) => {
  try {
    const { timeframe = "monthly", status, category, dateRange } = req.query;
    salesLogger.info("Generating sales report", { timeframe, status, category, dateRange });

    let filter = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") {
      const products = await Product.find({ category }).select("_id");
      filter["products.product"] = { $in: products.map((p) => p._id) };
    }

    // Add date range to filter
    if (dateRange) {
      try {
        // Parse the stringified dateRange
        const parsedDateRange = typeof dateRange === 'string' ? JSON.parse(dateRange) : dateRange;

        if (parsedDateRange.from && parsedDateRange.to) {
          const fromDate = new Date(parsedDateRange.from);
          const toDate = new Date(parsedDateRange.to);


          filter.createdAt = {
            $gte: fromDate,
            $lte: toDate
          };
        }
      } catch (error) {
        console.error('Error processing dateRange:', error);
      }
    }

    const fileName = `sales-report-${timeframe}-${Date.now()}.pdf`;
    const reportsDir = path.join(__dirname, "..", "public", "reports");
    const filePath = path.join(reportsDir, fileName);

    // Ensure the reports directory exists
    try {
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
    } catch (mkdirErr) {
      salesLogger.error("Failed to create reports directory", { error: mkdirErr.message });
      throw new Error("Error creating reports directory");
    }

    // Fetch order statistics in a single aggregation
    const [orderStats, orders] = await Promise.all([
      Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: { $cond: [{ $in: ["$status", ["completed", "delivered"]] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] } },
            revenue: { $sum: "$totalAmount" }
          }
        }
      ]),
      Order.find(filter).populate({
        path: "products.product",
        select: "title category",
        populate: { path: "category", select: "name" }
      })
    ]);

    const stats = orderStats.length ? orderStats[0] : {
      totalOrders: 0, completedOrders: 0, cancelledOrders: 0, revenue: 0
    };

    // Define PDF content
    const printer = new PdfPrinter({
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique"
      }
    });
    const docDefinition = {
      content: [
        { text: "Sales Report", style: "header" },
        { text: `Generated on: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`, style: "subheader1" },
        { text: "\nSummary", style: "subheader" },
        { text: `Total Revenue: $${stats.revenue.toFixed(2)}` },
        { text: `Total Orders: ${stats.totalOrders}` },
        { text: `Completed Orders: ${stats.completedOrders}` },
        { text: `Cancelled Orders: ${stats.cancelledOrders}` },
        { text: `Report for: ${!status ? "All Orders" : status.charAt(0).toUpperCase() + status.slice(1)}`, style: "subheader" },
        { text: `Date Range: ${dateRange ? moment(dateRange.from).format("MMMM Do YYYY") : "N/A"} to ${dateRange ? moment(dateRange.to).format("MMMM Do YYYY") : "N/A"}`, style: "subheader" },
        { text: "\nOrder List", style: "subheader" },
        {
          table: {
            widths: ["20%", "20%", "20%", "20%", "20%"],
            body: [
              ["Order ID", "Category", "Quantity", "Status", "Total Amount"],
              ...orders.map(order => [
                order._id.toString().slice(0, 7),
                order.products.length > 0 && order.products[0].product.category ? order.products[0].product.category.name : "N/A",
                order.products.reduce((sum, item) => sum + item.quantity, 0).toString(),
                order.status,
                `$${order.totalAmount.toFixed(2)}`
              ])
            ]
          }
        },
        { text: "\nThis report is auto-generated and confidential.", style: "footer" }
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: "center" },
        subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
        subheader1: { fontSize: 12, bold: true, margin: [0, 10, 0, 5], alignment: "center" },
        footer: { fontSize: 8, alignment: "center", margin: [0, 20, 0, 0] }
      }
    };

    // Generate PDF asynchronously
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.end();

    salesLogger.info("Sales report generated successfully", {
      timeframe,
      ...stats,
      downloadUrl: `/reports/${fileName}`
    });

    res.json({
      success: true,
      message: "Report generated successfully",
      downloadUrl: `/reports/${fileName}`,
      reportName: fileName
    });

  } catch (err) {
    salesLogger.error("Error generating sales report", {
      timeframe: req.query.timeframe,
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ success: false, message: err.message || "Error generating sales report" });
  }
});


// GET YEARLY MONTHLY STATISTICS
const getYearlyMonthlyStats = asyncHandler(async (req, res) => {
  try {
    salesLogger.info('Fetching yearly monthly statistics');

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    salesLogger.debug('Year range for statistics', {
      year: currentYear,
      startDate: startOfYear,
      endDate: endOfYear
    });

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          status: { $ne: "canceled" } // Exclude canceled orders
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          totalOrders: { $sum: 1 },
          paymentMethods: {
            $push: {
              method: "$paymentMethod",
              amount: "$totalAmount"
            }
          },
          uniqueCustomers: { $addToSet: "$user" },
          totalProducts: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalRevenue: 1,
          averageOrderValue: 1,
          totalOrders: 1,
          totalProducts: 1,
          uniqueCustomers: { $size: "$uniqueCustomers" },
          paymentMethods: {
            $reduce: {
              input: "$paymentMethods",
              initialValue: { card: 0, cash: 0, "bank transfer": 0 },
              in: {
                $mergeObjects: [
                  "$$value",
                  {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$$this.method", "card"] }, then: { card: { $add: ["$$value.card", "$$this.amount"] } } },
                        { case: { $eq: ["$$this.method", "cash"] }, then: { cash: { $add: ["$$value.cash", "$$this.amount"] } } },
                        { case: { $eq: ["$$this.method", "bank transfer"] }, then: { "bank transfer": { $add: ["$$value.bank transfer", "$$this.amount"] } } }
                      ],
                      default: "$$value"
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $sort: { month: 1 } }
    ];

    const monthlyStats = await Order.aggregate(pipeline);

    const completeMonthlyStats = Array.from({ length: 12 }, (_, i) => {
      const existingStats = monthlyStats.find(stat => stat.month === i + 1);
      return existingStats || {
        month: i + 1,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalOrders: 0,
        totalProducts: 0,
        uniqueCustomers: 0,
        paymentMethods: { card: 0, cash: 0, "bank transfer": 0 }
      };
    });

    const monthlyStatsWithNames = completeMonthlyStats.map(stat => ({
      ...stat,
      monthName: new Date(currentYear, stat.month - 1).toLocaleString('default', { month: 'long' })
    }));

    salesLogger.info('Yearly monthly statistics fetched successfully', {
      year: currentYear,
      monthsWithData: monthlyStats.length
    });

    res.json({
      year: currentYear,
      months: monthlyStatsWithNames,
      summary: {
        totalRevenue: monthlyStatsWithNames.reduce((sum, month) => sum + month.totalRevenue, 0),
        totalOrders: monthlyStatsWithNames.reduce((sum, month) => sum + month.totalOrders, 0),
        averageMonthlyRevenue: monthlyStatsWithNames.reduce((sum, month) => sum + month.totalRevenue, 0) / 12,
        bestPerformingMonth: monthlyStatsWithNames.reduce((best, current) =>
          current.totalRevenue > (best?.totalRevenue || 0) ? current : best, null)?.monthName
      }
    });

  } catch (err) {
    salesLogger.error('Error fetching yearly monthly statistics', {
      error: err.message,
      stack: err.stack
    });
    throw new Error(err.message || "Error fetching yearly monthly statistics");
  }
});


module.exports = {
  recordSale,
  getAllSales,
  getSingleSale,
  getTotalSalesAmount,
  getSalesStatistics,
  getConversionMetrics,
  getSalesPerformance,
  generateSalesReport,
  getYearlyMonthlyStats
};
