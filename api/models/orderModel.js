const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          min: 0,
        },
        chosenSize: {
          type: String,
          default: "",
        },
        chosenColor: {
          type: String,
          default: "",
        },
        chosenColors: {
          type: [String],
          default: [],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    subtotalAmount: {
      type: Number,
      default: 0,
    },
    shippingAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shippingMethod: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "delivered", "canceled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      // required: true,
      default: "card",
    },
    paymentGateway: {
      type: String,
      enum: ["paystack", "manual"],
      default: "manual",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    canceledReason: {
      type: String,
    },
    deliveredAt: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
    paymentAuthorizationUrl: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
