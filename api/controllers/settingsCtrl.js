const asyncHandler = require("express-async-handler");
const Settings = require("../models/settingsModel");

const fixedPaymentMethods = [
  {
    name: "Credit Card",
    code: "credit-card",
    description: "Accept debit and credit card payments securely through Paystack.",
    instructions: "Customer is redirected to Paystack to complete card payment.",
    gateway: "paystack",
    isActive: true,
  },
  {
    name: "Mobile Money",
    code: "mobile-money",
    description: "Accept MTN, Telecel, and AirtelTigo mobile money through Paystack.",
    instructions: "Customer is redirected to Paystack to complete mobile money payment.",
    gateway: "paystack",
    isActive: true,
  },
  {
    name: "Payment on Delivery",
    code: "payment-on-delivery",
    description: "Customer pays when the order is delivered.",
    instructions: "Collect and confirm payment during delivery before marking the order as paid.",
    gateway: "manual",
    isActive: true,
  },
];

const defaultSettings = {
  storeName: "E-commerce",
  supportEmail: "",
  supportPhone: "",
  currency: "GHS",
  shippingMethods: [
    {
      name: "Standard Shipping",
      description: "Delivers within 3-5 business days.",
      amount: 5.99,
      estimatedDays: "3-5 business days",
      isActive: true,
    },
    {
      name: "Express Shipping",
      description: "Delivers within 1-2 business days.",
      amount: 12.99,
      estimatedDays: "1-2 business days",
      isActive: true,
    },
  ],
  paymentMethods: fixedPaymentMethods,
};

const paymentAliases = {
  "credit-card": ["credit-card", "card", "paystack"],
  "mobile-money": ["mobile-money"],
  "payment-on-delivery": ["payment-on-delivery", "cash", "cod"],
};

const findExistingPaymentMethod = (methods, code) =>
  (paymentAliases[code] || [code])
    .map((alias) => methods.find((method) => method.code === alias))
    .find(Boolean);

const buildFixedPaymentMethods = (existingMethods = []) =>
  fixedPaymentMethods.map((method) => {
    const existing = findExistingPaymentMethod(existingMethods, method.code);
    return {
      ...method,
      isActive: existing?.isActive ?? method.isActive,
    };
  });

const isFixedPaymentList = (methods = []) =>
  methods.length === fixedPaymentMethods.length &&
  fixedPaymentMethods.every((method, index) => {
    const current = methods[index];
    return current?.code === method.code && current?.gateway === method.gateway && current?.name === method.name;
  });

const getSettingsDocument = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(defaultSettings);
  }

  if (!isFixedPaymentList(settings.paymentMethods)) {
    settings.paymentMethods = buildFixedPaymentMethods(settings.paymentMethods);
    await settings.save();
  }

  return settings;
};

const normalizeShippingMethod = (body) => ({
  name: String(body.name || "").trim(),
  description: String(body.description || "").trim(),
  amount: Math.max(Number(body.amount) || 0, 0),
  estimatedDays: String(body.estimatedDays || "").trim(),
  isActive: body.isActive === undefined ? true : Boolean(body.isActive),
});

const normalizePaymentMethod = (body) => ({
  name: String(body.name || "").trim(),
  code: String(body.code || body.name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-"),
  description: String(body.description || "").trim(),
  instructions: String(body.instructions || "").trim(),
  gateway: body.gateway === "paystack" ? "paystack" : "manual",
  isActive: body.isActive === undefined ? true : Boolean(body.isActive),
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  res.json(settings);
});

const updateStoreSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const allowedFields = ["storeName", "supportEmail", "supportPhone", "currency"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  await settings.save();
  res.json(settings);
});

const createShippingMethod = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const method = normalizeShippingMethod(req.body);
  if (!method.name) return res.status(400).json({ message: "Shipping name is required." });

  settings.shippingMethods.push(method);
  await settings.save();
  res.status(201).json(settings);
});

const updateShippingMethod = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const method = settings.shippingMethods.id(req.params.id);
  if (!method) return res.status(404).json({ message: "Shipping method not found." });

  const updates = normalizeShippingMethod({ ...method.toObject(), ...req.body });
  Object.assign(method, updates);
  await settings.save();
  res.json(settings);
});

const deleteShippingMethod = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const method = settings.shippingMethods.id(req.params.id);
  if (!method) return res.status(404).json({ message: "Shipping method not found." });

  method.deleteOne();
  await settings.save();
  res.json(settings);
});

const createPaymentMethod = asyncHandler(async (req, res) => {
  res.status(405).json({ message: "Payment methods are fixed. Select the methods you want to use instead." });
});

const updatePaymentMethod = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const method = settings.paymentMethods.id(req.params.id);
  if (!method) return res.status(404).json({ message: "Payment method not found." });

  method.isActive = req.body.isActive === undefined ? method.isActive : Boolean(req.body.isActive);
  await settings.save();
  res.json(settings);
});

const deletePaymentMethod = asyncHandler(async (req, res) => {
  res.status(405).json({ message: "Payment methods are fixed and cannot be deleted." });
});

const updateActivePaymentMethods = asyncHandler(async (req, res) => {
  const settings = await getSettingsDocument();
  const activeCodes = Array.isArray(req.body.activeCodes) ? req.body.activeCodes : [];
  const validCodes = fixedPaymentMethods.map((method) => method.code);

  if (!activeCodes.every((code) => validCodes.includes(code))) {
    return res.status(400).json({ message: "One or more payment methods are invalid." });
  }

  if (activeCodes.length === 0) {
    return res.status(400).json({ message: "Select at least one payment method." });
  }

  settings.paymentMethods.forEach((method) => {
    method.isActive = activeCodes.includes(method.code);
  });
  await settings.save();
  res.json(settings);
});

module.exports = {
  getSettings,
  updateStoreSettings,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  updateActivePaymentMethods,
};
