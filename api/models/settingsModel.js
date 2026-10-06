const mongoose = require("mongoose");

const shippingMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    amount: { type: Number, default: 0, min: 0 },
    estimatedDays: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    gateway: {
      type: String,
      enum: ["paystack", "manual"],
      default: "manual",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "E-commerce" },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    currency: { type: String, default: "GHS" },
    shippingMethods: { type: [shippingMethodSchema], default: [] },
    paymentMethods: { type: [paymentMethodSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
