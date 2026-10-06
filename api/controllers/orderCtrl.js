const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const Sales = require("../models/salesModel");
const User = require("../models/userModels");
const axios = require("axios");
const crypto = require("crypto");
const { createNotification } = require("../utils/notification");


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

// Helper function to create sales record
const createSalesRecord = async (order, session) => {
  // First populate the product details to get prices
  const populatedOrder = await Order.findById(order._id)
    .populate('products.product')
    .populate('user')
    .session(session);

  if (!populatedOrder) {
    throw new Error("Order not found");
  }

  // Transform products to match sales model structure
  const transformedProducts = populatedOrder.products.map(item => ({
    product: item.product._id,
    title: item.product.title,
    quantity: item.quantity,
    price: item.price ?? item.product.getEffectivePrice()
  }));

  const salesData = {
    orderId: populatedOrder._id,
    user: populatedOrder.user._id,
    products: transformedProducts,
    totalAmount: populatedOrder.totalAmount,
    paymentMethod: populatedOrder.paymentMethod,
    paymentStatus: populatedOrder.paymentStatus,
    deliveredAt: new Date(),
  };

  await Sales.create([salesData], { session });

  // Update product sold counts
  await Promise.all(populatedOrder.products.map(async (item) => {
    await Product.findByIdAndUpdate(
      item.product._id,
      { $inc: { sold: item.quantity } },
      { session }
    );
  }));
};

const normalizeOption = (value) => String(value || "").trim().toLowerCase();

const getRequestedVariant = (item) => {
  const chosenColor = Array.isArray(item.chosenColors)
    ? item.chosenColors[0]
    : item.chosenColors;

  return {
    size: item.chosenSize || item.size,
    color: item.chosenColor || item.color || chosenColor,
  };
};

const getVariantLabel = ({ size, color }) =>
  [size, color].filter(Boolean).join(" / ");

const getPaystackSecretKey = () =>
  process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET || process.env.PAYSTACK_SECRET_KEY_TEST;

const getPaystackCurrency = () => process.env.PAYSTACK_CURRENCY || "GHS";

const isPaystackConfigured = () => Boolean(getPaystackSecretKey());

const paystackHeaders = () => {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) {
    throw new Error("Paystack secret key is not configured.");
  }

  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
};

const generatePaymentReference = (orderId) =>
  `order-${orderId}-${crypto.randomBytes(8).toString("hex")}`;

const normalizeMoney = (value) => Math.max(Number(value) || 0, 0);
const paystackPaymentCodes = ["credit-card", "mobile-money", "paystack"];

const normalizePaymentMethodCode = (value) => {
  const code = String(value || "").trim().toLowerCase();
  if (code === "card") return "credit-card";
  if (code === "cash" || code === "cod") return "payment-on-delivery";
  return code;
};

const isPaystackPaymentMethod = (paymentMethod) =>
  paystackPaymentCodes.includes(normalizePaymentMethodCode(paymentMethod));

const getPaystackChannels = (paymentMethod) => {
  const code = normalizePaymentMethodCode(paymentMethod);
  if (code === "mobile-money") return ["mobile_money"];
  if (code === "credit-card") return ["card"];
  return undefined;
};

// CREATE NEW ORDER
const createOrder = asyncHandler(async (req, res) => {
  const {
    user,
    products,
    paymentMethod,
    shippingAddress,
    paymentStatus,
    transactionId,
    shippingMethod,
    shippingAmount,
    taxAmount,
    discountAmount,
  } = req.body;

  // Input validation
  const normalizedPaymentMethod = normalizePaymentMethodCode(paymentMethod);

  if (!user || !products || !normalizedPaymentMethod || !shippingAddress) {
    throw new Error("All fields are required.");
  }

  const findUser = await User.findById(user);

  if (!findUser) {
    throw new Error("User not found");
  }
  let totalAmount = 0;
  let subtotalAmount = 0;
  const normalizedShippingAmount = normalizeMoney(shippingAmount);
  const normalizedTaxAmount = normalizeMoney(taxAmount);
  const normalizedDiscountAmount = normalizeMoney(discountAmount);
  const lowStockNotifications = [];
  let createdOrder;
  const session = await Order.startSession();

  try {
    await session.withTransaction(async () => {
      const orderProducts = [];

      // Calculate total amount and validate stock
      for (const item of products) {
        const product = await Product.findById(item.product).session(session);

        if (!product) {
          throw new Error(`Product not found with ID: ${item.product}`);
        }

        const requestedQuantity = Math.max(Number(item.quantity) || 0, 0);
        if (requestedQuantity <= 0) {
          throw new Error(`Invalid quantity for product: ${product.title || item.product}`);
        }

        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
        const requestedVariant = getRequestedVariant(item);

        if (hasVariants) {
          const requestedSize = normalizeOption(requestedVariant.size);
          const requestedColor = normalizeOption(requestedVariant.color);

          if (!requestedSize || !requestedColor) {
            throw new Error(`Select size and color for product: ${product.title}`);
          }

          const variant = product.variants.find(
            (variantItem) =>
              normalizeOption(variantItem.size) === requestedSize &&
              normalizeOption(variantItem.color) === requestedColor
          );

          if (!variant) {
            throw new Error(
              `Variant not found for ${product.title}: ${getVariantLabel(requestedVariant)}`
            );
          }

          if (variant.quantity < requestedQuantity) {
            throw new Error(
              `Insufficient stock for ${product.title}: ${getVariantLabel(requestedVariant)}`
            );
          }

          variant.quantity -= requestedQuantity;
          product.quantity = product.variants.reduce(
            (total, variantItem) => total + (Number(variantItem.quantity) || 0),
            0
          );
        } else {
          if (product.quantity < requestedQuantity) {
            throw new Error(`Insufficient stock for product: ${product.title || item.product}`);
          }

          product.quantity -= requestedQuantity;
        }

        const unitPrice = product.getEffectivePrice();
        subtotalAmount += unitPrice * requestedQuantity;

        orderProducts.push({
          ...item,
          quantity: requestedQuantity,
          chosenSize: requestedVariant.size || item.chosenSize,
          chosenColor: requestedVariant.color || item.chosenColor,
          price: unitPrice,
        });

        await product.save({ session });

        if (product.quantity <= 5) {
          lowStockNotifications.push({
            title: "Low stock alert",
            message: `${product.title} has ${product.quantity} item${product.quantity === 1 ? "" : "s"} left in stock.`,
            type: "stock",
            severity: product.quantity === 0 ? "error" : "warning",
            entityType: "product",
            entityId: product._id,
            link: `/products/edit?id=${product._id}`,
          });
        }
      }

      totalAmount = Math.max(
        subtotalAmount + normalizedShippingAmount + normalizedTaxAmount - normalizedDiscountAmount,
        0
      );

      findUser.totalOrders = findUser.totalOrders + 1;
      findUser.totalSpent = findUser.totalSpent + totalAmount;
      await findUser.save({ session });

      const newOrder = await Order.create([{
        user,
        products: orderProducts,
        totalAmount,
        subtotalAmount,
        shippingAmount: normalizedShippingAmount,
        taxAmount: normalizedTaxAmount,
        discountAmount: normalizedDiscountAmount,
        shippingMethod: String(shippingMethod || "").trim(),
        paymentMethod: normalizedPaymentMethod,
        paymentGateway: isPaystackPaymentMethod(normalizedPaymentMethod) ? "paystack" : "manual",
        paymentStatus: paymentStatus || "pending",
        shippingAddress,
        transactionId,
      }], { session });

      createdOrder = newOrder[0];
    });

    try {
      const customerName = `${findUser.firstName || ""} ${findUser.lastName || ""}`.trim() || "A customer";
      await createNotification({
        title: "New order received",
        message: `${customerName} placed an order worth ${totalAmount.toFixed(2)}.`,
        type: "order",
        severity: "success",
        entityType: "order",
        entityId: createdOrder._id,
        link: `/order/details?id=${createdOrder._id}`,
      });
      await createNotification({
        title: "Order placed",
        message: `Your order ${createdOrder._id} has been received.`,
        type: "order",
        severity: "success",
        entityType: "order",
        entityId: createdOrder._id,
        recipient: findUser._id,
        audience: "user",
        link: `/pages/orders/details?id=${createdOrder._id}`,
      });

      await Promise.all(lowStockNotifications.map((notification) => createNotification(notification)));
    } catch (notificationError) {
      console.error("Failed to create order notification:", notificationError.message);
    }

    res.json(createdOrder);
  } catch (err) {
    console.log(err);
    throw new Error(err.message || "Error creating order");
  } finally {
    session.endSession();
  }
});

const initializePaystackPayment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { callbackUrl } = req.body;
    validateMongoDb(id);

    const order = await Order.findById(id).populate("user", "email firstName lastName phone");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.user?.email) {
      return res.status(400).json({ message: "Customer email is required for Paystack payment." });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order has already been paid." });
    }
    if (!isPaystackPaymentMethod(order.paymentMethod)) {
      return res.status(400).json({ message: "This order does not use a Paystack payment method." });
    }
    if (!isPaystackConfigured()) {
      return res.status(500).json({ message: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to the backend environment." });
    }

    const reference = generatePaymentReference(order._id);
    const channels = getPaystackChannels(order.paymentMethod);
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        amount: Math.round(Number(order.totalAmount) * 100),
        email: order.user.email,
        currency: getPaystackCurrency(),
        reference,
        callback_url: callbackUrl,
        metadata: {
          orderId: order._id.toString(),
          paymentMethod: order.paymentMethod,
          customerName: `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim(),
          customerPhone: order.user.phone,
        },
        ...(channels ? { channels } : {}),
      },
      { headers: paystackHeaders() }
    );

    if (!response.data?.status || !response.data?.data?.authorization_url) {
      return res.status(400).json({ message: response.data?.message || "Paystack did not return a checkout URL." });
    }

    order.paymentGateway = "paystack";
    order.paymentStatus = "pending";
    order.transactionId = reference;
    order.paymentAuthorizationUrl = response.data?.data?.authorization_url;
    await order.save();

    res.json({
      order,
      paystack: response.data?.data,
    });
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Failed to initialize Paystack payment");
  }
});

const verifyPaystackPayment = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) return res.status(400).json({ message: "Payment reference is required." });
    if (!isPaystackConfigured()) {
      return res.status(500).json({ message: "Paystack is not configured. Add PAYSTACK_SECRET_KEY to the backend environment." });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: paystackHeaders() }
    );

    const data = response.data?.data;
    const orderId = data?.metadata?.orderId;
    const order = orderId ? await Order.findById(orderId) : await Order.findOne({ transactionId: reference });
    if (!order) return res.status(404).json({ message: "Order not found for this payment." });

    const expectedAmount = Math.round(Number(order.totalAmount) * 100);
    const expectedCurrency = getPaystackCurrency();
    let paymentNotification = null;
    const wasPaid = order.paymentStatus === "paid";

    if (data?.status === "success") {
      if (
        Number(data.amount) !== expectedAmount ||
        String(data.currency || "").toUpperCase() !== expectedCurrency.toUpperCase()
      ) {
        return res.status(400).json({
          message: "Paystack payment amount or currency does not match this order.",
          order,
          paystack: data,
        });
      }

      order.paymentGateway = "paystack";
      order.paymentStatus = "paid";
      order.transactionId = reference;
      order.paidAt = new Date(data.paid_at || Date.now());
      if (!wasPaid) {
        paymentNotification = {
          title: "Payment verified",
          message: `Paystack payment for order ${order._id} was verified successfully.`,
          type: "payment",
          severity: "success",
          entityType: "order",
          entityId: order._id,
          recipient: order.user,
          audience: "user",
          link: `/order/details?id=${order._id}`,
        };
      }
    } else if (data?.status === "failed" || data?.status === "abandoned") {
      order.paymentStatus = "failed";
      paymentNotification = {
        title: "Payment failed",
        message: `Paystack payment for order ${order._id} was ${data.status}.`,
        type: "payment",
        severity: "error",
        entityType: "order",
        entityId: order._id,
        recipient: order.user,
        audience: "user",
        link: `/order/details?id=${order._id}`,
      };
    }

    await order.save();
    if (paymentNotification) {
      try {
        await createNotification(paymentNotification);
      } catch (notificationError) {
        console.error("Failed to create payment notification:", notificationError.message);
      }
    }
    res.json({ order, paystack: data, status: response.data?.status, message: response.data?.message });
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || "Failed to verify Paystack payment");
  }
});

// QUERY ORDERS

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      paymentStatus,
      date,
      category,
      dateRange,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    if (status && status !== "all") filter.status = status;
    if (paymentMethod && paymentMethod !== "all") filter.paymentMethod = paymentMethod;
    if (paymentStatus && paymentStatus !== "all") filter.paymentStatus = paymentStatus;

    // Handle dateRange from query parameters
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
    } else if (date) {
      const dateFilter = getDateFilter(date);
      if (dateFilter) {
        filter.createdAt = dateFilter;
      }
    }

    let totalOrders;
    let orders;

    // Handle both category and search filters
    if (category !== "" || search !== "") {
      let productQuery = {};
      let shouldFilterByProducts = false;

      if (category && category !== "all") {
        productQuery.category = category;
        shouldFilterByProducts = true;
      }

      if (search && search !== "all") {
        productQuery.title = {
          $regex: search,
          $options: 'i'  // case-insensitive search
        };
        shouldFilterByProducts = true;
      }

      // Only apply product filter if we have category or search
      if (Object.keys(productQuery).length > 0) {
        const products = await Product.find(productQuery);

        // If we're filtering by products but found none, return empty result
        if (shouldFilterByProducts && products.length === 0) {
          totalOrders = 0;
          orders = [];
          return res.status(200).json({
            totalOrders,
            totalPages: Math.ceil(totalOrders / limitNumber),
            currentPage: pageNumber,
            statusTotals: {
              pending: 0,
              completed: 0,
              canceled: 0,
              processing: 0,
            },
            orders,
          });
        }

        if (products.length > 0) {
          filter['products.product'] = { $in: products.map(p => p._id) };
        }
      }
    }


    totalOrders = await Order.countDocuments(filter);
    orders = await Order.find(filter)
      .populate([
        { path: "user", select: "firstName lastName email phone" },
        {
          path: "products.product",
          populate: {
            path: 'category',
            select: 'name'
          }
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalOrders / limitNumber);

    // Calculate status totals
    const statusCounts = await Order.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusTotals = {
      pending: 0,
      completed: 0,
      canceled: 0,
      processing: 0,
    };

    statusCounts.forEach(({ _id, count }) => {
      statusTotals[_id] = count;
    });

    // Response with paginated data and status totals
    res.json({
      totalOrders,
      totalPages,
      currentPage: pageNumber,
      statusTotals,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET SINGLE ORDER
const getSingleOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);

    const order = await Order.findById(id).populate([
      { path: "user", select: "firstName lastName email phone totalOrders totalSpent" },
      { path: "products.product", select: "" },
      { path: "shippingAddress" },
    ]);

    if (!order) throw new Error("Order not found.");
    res.json(order);
  } catch (err) {
    throw new Error(err);
  }
});

// UPDATE ORDER STATUS
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    validateMongoDb(id);

    const session = await Order.startSession();

    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(id);

        if (!order) {
          throw new Error("Order not found");
        }

        order.status = status;

        // If order is delivered/completed, create sales record
        if (status === "delivered" || status === "completed") {
          let findeSales = await Sales.findOne({ orderId: order._id });
          if (!findeSales) {
            await createSalesRecord(order, session);
          }
        }

        if (status === "canceled") {
          let findUser = await User.findById(order.user);
          findUser.totalSpent = findUser.totalSpent - order.totalAmount;
          await findUser.save({ session });
        }

        await order.save({ session });
      });


      const updatedOrder = await Order.findById(id);
      try {
        await createNotification({
          title: "Order status updated",
          message: `Order ${updatedOrder._id} is now ${updatedOrder.status}.`,
          type: "order",
          severity: updatedOrder.status === "canceled" ? "warning" : "info",
          entityType: "order",
          entityId: updatedOrder._id,
          link: `/order/details?id=${updatedOrder._id}`,
        });
        await createNotification({
          title: "Order status updated",
          message: `Your order ${updatedOrder._id} is now ${updatedOrder.status}.`,
          type: "order",
          severity: updatedOrder.status === "canceled" ? "warning" : "info",
          entityType: "order",
          entityId: updatedOrder._id,
          recipient: updatedOrder.user,
          audience: "user",
          link: `/pages/orders/details?id=${updatedOrder._id}`,
        });
      } catch (notificationError) {
        console.error("Failed to create order status notification:", notificationError.message);
      }
      res.json(updatedOrder);
    } catch (error) {
      throw new Error(error.message || "Error updating order status");
    } finally {
      session.endSession();
    }
  } catch (error) {
    throw new Error(error.message);
  }
});

// DELETE ORDER
const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);

    const deletedOrder = await Order.findByIdAndDelete(id);
    res.json(deletedOrder);
  } catch (err) {
    throw new Error(err);
  }
});

// GET TOTALS FOR ORDER STATUS
const getOrderStatusTotals = asyncHandler(async (req, res) => {
  try {
    const { filter } = req.query;

    let startDate = null;

    switch (filter) {
      case "today":
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "yearly":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 3);
        break;
      case "all":
      default:
        startDate = null; // No filter, fetch all orders
        break;
    }

    // Match orders based on date range
    const matchStage = startDate ? { createdAt: { $gte: startDate } } : {};

    // Aggregation query
    const totals = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ]);

    // Calculate total orders
    const totalOrders = await Order.countDocuments(matchStage);

    // Convert results into an object
    const formattedTotals = totals.reduce((acc, { _id, total }) => {
      acc[_id] = total;
      return acc;
    }, {});

    // Add total orders to the response
    res.json({ totalOrders, ...formattedTotals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// QUERY ORDERS BY USER ID
const getOrdersByUserId = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    validateMongoDb(userId);

    const orders = await Order.find({ user: userId }).populate([
      { path: "user", select: "firstName lastName email" },
      { path: "products.product" },
      { path: "shippingAddress" },
    ]);

    res.json(orders);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStatusTotals,
  getOrdersByUserId,
  initializePaystackPayment,
  verifyPaystackPayment,
};
