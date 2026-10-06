const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const slugify = require("slugify");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/awsConfig");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { deleteMultipleImages } = require("../utils/deleteMultipleImages");

const normalizeStringArray = (value) => {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return values
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const uniqueStrings = (items) => [...new Set(items.filter(Boolean))];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isTruthyQuery = (value) => value === true || value === "true" || value === "1";

const normalizeQuantity = (value) => Math.max(Number(value) || 0, 0);

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants)) return [];

  const rows = variants.flatMap((variant) => {
    const size = String(variant?.size || "").trim();
    const quantity = normalizeQuantity(variant?.quantity);

    if (variant?.color !== undefined) {
      const color = String(variant.color || "").trim();
      return size && color ? [{ size, color, quantity }] : [];
    }

    return normalizeStringArray(variant?.colors).map((color) => ({
      size,
      color,
      quantity: 0,
    }));
  });

  const merged = new Map();
  rows.forEach((variant) => {
    if (!variant.size || !variant.color) return;
    const key = `${variant.size.toLowerCase()}::${variant.color.toLowerCase()}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += variant.quantity;
      return;
    }
    merged.set(key, { ...variant });
  });

  return [...merged.values()];
};

const normalizeDiscount = (discount = {}) => {
  const type = discount.type === "fixed" ? "fixed" : "percentage";
  const value = Math.max(Number(discount.value) || 0, 0);

  return {
    type,
    value: type === "percentage" ? Math.min(value, 100) : value,
    startsAt: discount.startsAt ? new Date(discount.startsAt) : null,
    endsAt: discount.endsAt ? new Date(discount.endsAt) : null,
    isActive: Boolean(discount.isActive && value > 0),
  };
};

const normalizeProductPayload = (body) => {
  const payload = { ...body };

  if (payload.stock !== undefined && payload.quantity === undefined) {
    payload.quantity = payload.stock;
  }
  delete payload.stock;

  if (payload.status) {
    payload.isPublished = payload.status === "published";
    payload.publishedAt = payload.isPublished ? new Date() : null;
    delete payload.status;
  }

  if (payload.colors !== undefined) {
    payload.colors = normalizeStringArray(payload.colors);
  }

  if (payload.sizes !== undefined) {
    payload.sizes = normalizeStringArray(payload.sizes);
  }

  if (payload.variants !== undefined) {
    payload.variants = normalizeVariants(payload.variants);

    if (payload.variants.length > 0) {
      payload.sizes = uniqueStrings(payload.variants.map((variant) => variant.size));
      payload.colors = uniqueStrings(payload.variants.map((variant) => variant.color));
      payload.quantity = payload.variants.reduce(
        (total, variant) => total + variant.quantity,
        0
      );
    }
  }

  if (payload.quantity !== undefined) {
    payload.quantity = normalizeQuantity(payload.quantity);
  }

  if (payload.discount !== undefined) {
    payload.discount = normalizeDiscount(payload.discount);
  }

  if (payload.title) {
    payload.slug = slugify(payload.title, { lower: true, strict: true });
  } else if (payload.slug) {
    payload.slug = slugify(payload.slug, { lower: true, strict: true });
  }

  return payload;
};

// CREATE NEW PRODUCT
const createProduct = asyncHandler(async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const { images = [] } = payload;

    const uploadedFiles = [];
    for (const base64Image of images) {
      const ramdonText = crypto.randomBytes(20).toString("hex");
      const buffer = Buffer.from(base64Image.split(",")[1], "base64");
      const fileKey = `images/${ramdonText}_${Math.random()
        .toString(36)
        .substring(7)}.jpg`;

      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: buffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      await s3.send(new PutObjectCommand(uploadParams));

      uploadedFiles.push({
        name: fileKey,
        url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      });
    }
    payload.images = uploadedFiles;
    const newProduct = await Product.create(payload);
    res.json(newProduct);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

// GET ALL PRODUCT
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      colors,
      sizes,
      minPrice,
      maxPrice,
      sort,
      lowStocks,
      highStocks,
      outStocks,
      highSold,
      lowSold,
      page = 1,
      limit = 10,
      onlyPublished,
      onlyStock,
    } = req.query;

    const query = {};

    // Search by product name or description
    if (search && search != "all") {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // Case-insensitive search
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    if (brand && brand !== "all") {
      query.brand = { $regex: escapeRegex(brand), $options: "i" };
    }

    const colorFilters = normalizeStringArray(colors || req.query["colors[]"]);
    if (colorFilters.length) {
      query.colors = { $in: colorFilters.map((color) => new RegExp(`^${escapeRegex(color)}$`, "i")) };
    }

    const sizeFilters = normalizeStringArray(sizes || req.query["sizes[]"]);
    if (sizeFilters.length) {
      query.sizes = { $in: sizeFilters.map((size) => new RegExp(`^${escapeRegex(size)}$`, "i")) };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (isTruthyQuery(onlyPublished)) {
      query.isPublished = true;
    }

    // filter by all stocks above 0
    if (isTruthyQuery(onlyStock)) {
      query.quantity = { $gte: 1 };
    }

    // Filter by stocks
    if (isTruthyQuery(lowStocks) || isTruthyQuery(highStocks) || isTruthyQuery(outStocks)) {
      query.quantity = {};
      if (isTruthyQuery(highStocks)) query.quantity.$gte = 11;
      if (isTruthyQuery(lowStocks)) query.quantity.$lte = 10;
      if (isTruthyQuery(outStocks)) query.quantity.$lte = 0;
    }
    // Filter by sold
    if (isTruthyQuery(lowSold) || isTruthyQuery(highSold)) {
      query.sold = {};
      if (isTruthyQuery(highSold)) query.sold.$gte = 11;
      if (isTruthyQuery(lowSold)) query.sold.$lte = 10;
    }

    // Sort options
    let sortOptions = {};
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions[key] = order === "desc" ? -1 : 1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch products with query, sort, and pagination
    const allProducts = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name slug");

    const total = await Product.countDocuments(query);

    res.json({
      stats: {
        success: true,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      products: allProducts,
    });
  } catch (err) {
    throw new Error(err);
  }
});

// GET A SINGLE PRODUCT

const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const singleProduct = await Product.findById(id).populate(
      "category",
      "name slug"
    );
    res.json(singleProduct);
  } catch (err) {
    throw new Error(err);
  }
});

// UPDATE PRODUCT

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { images, deletedImages } = req.body;
    validateMongoDb(id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let uploadedFiles = product.images || [];

    if (deletedImages) {
      deleteMultipleImages(deletedImages);
      uploadedFiles = uploadedFiles.filter(
        (img) => !deletedImages.includes(img.name)
      );
    }

    if (images && images.length > 0) {
      for (const base64Image of images) {
        const randomText = crypto.randomBytes(20).toString("hex");
        const buffer = Buffer.from(base64Image.split(",")[1], "base64");
        const fileKey = `images/${randomText}_${Math.random()
          .toString(36)
          .substring(7)}.jpg`;

        const uploadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileKey,
          Body: buffer,
          ContentType: "image/jpeg",
          ACL: "public-read",
        };

        await s3.send(new PutObjectCommand(uploadParams));

        uploadedFiles.push({
          name: fileKey,
          url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
        });
      }
    }

    const payload = normalizeProductPayload(req.body);
    payload.images = uploadedFiles;
    delete payload.deletedImages;

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      payload,
      { new: true }
    ).populate("category", "name slug");

    res.json(updatedProduct);
  } catch (err) {
    throw new Error(err);
  }
});

// DELETE PRODUCT

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    let imagKeys = [];
    for (img of product.images) {
      imagKeys.push(img.name);
    }

    deleteMultipleImages(imagKeys);

    const deletedProduct = await Product.findByIdAndDelete(id);
    res.json(deletedProduct);
  } catch (err) {
    throw new Error(err);
  }
});

// ADD PRODUCT RATTINGS
const addProductRating = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { userId, rating } = req.body;
  validateMongoDb(productId);

  if (!userId || !rating) throw new Error("User ID and rating are required.");
  try {
    const product = await Product.findById(productId);
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === userId
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      product.ratings.push({ user: userId, rating });
    }
    await product.save();
    res.json({ message: "Rating added/updated successfully.", product });
  } catch (error) {
    throw new Error(error);
  }
});

// Get popular products
const getPopularProducts = asyncHandler(async (req, res) => {
  try {
    const popularProducts = await Product.find({ isPublished: true, quantity: { $gte: 1 } })
      .sort({ sold: -1 })
      .limit(10);
    res.json(popularProducts);
  } catch (err) {
    throw new Error(err);
  }
});


// Publish or unpublish a product
const togglePublishProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatProdcut = await Product.findByIdAndUpdate(
      id,
      {
        isPublished: !product.isPublished,
        publishedAt: product.isPublished ? null : new Date(),
      },
      { new: true }
    );
    res.json(updatProdcut);
  } catch (err) {
    throw new Error(err);
  }
});

const applyDiscountToProducts = asyncHandler(async (req, res) => {
  try {
    const { productIds, discount } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Select at least one product." });
    }

    const invalidProductId = productIds.find(
      (productId) => !mongoose.Types.ObjectId.isValid(productId)
    );

    if (invalidProductId) {
      return res.status(400).json({ message: "Invalid product selected." });
    }

    const normalizedDiscount = normalizeDiscount(discount);
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { discount: normalizedDiscount } }
    );

    const products = await Product.find({ _id: { $in: productIds } }).populate(
      "category",
      "name slug"
    );

    res.json({
      message: "Discount applied successfully.",
      modifiedCount: result.modifiedCount,
      products,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const getProductsTotals = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filter for analytics
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length
      ? { publishedAt: dateFilter }
      : {};

    const averageSold = await Product.aggregate([
      {
        $group: {
          _id: null,
          averageSold: { $avg: "$sold" },
        },
      },
    ]);

    // Aggregate statistics
    const stats = await Product.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totalProducts: [{ $count: "count" }],
          totalQuantities: [
            { $group: { _id: null, total: { $sum: "$quantity" } } },
          ],
          lowStockProducts: [
            { $match: { quantity: { $lt: 11, $gt: 0 } } },
            { $count: "count" },
          ],
          highStockProducts: [
            { $match: { quantity: { $gte: 11 } } },
            { $count: "count" },
          ],
          outOfStockProducts: [
            { $match: { quantity: { $eq: 0 } } },
            { $count: "count" },
          ],
          bestSellingProducts: [
            { $match: { sold: { $gt: averageSold[0]?.averageSold || 0 } } },
            { $limit: 8 },
            {
              $project: {
                title: 1,
                sold: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    const data = stats[0];

    res.status(200).json({
      totalProducts: data.totalProducts[0]?.count || 0,
      totalQuantities: data.totalQuantities[0]?.total || 0,
      lowStockProducts: data.lowStockProducts[0]?.count || 0,
      highStockProducts: data.highStockProducts[0]?.count || 0,
      outOfStockProducts: data.outOfStockProducts[0]?.count || 0,
      bestSellingProducts: data.bestSellingProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  addProductRating,
  togglePublishProduct,
  applyDiscountToProducts,
  getProductsTotals,
  getPopularProducts,
};
