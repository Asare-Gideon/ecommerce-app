const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const BlogCategory = require("../models/blogCatModel");

const normalizeCategoryPayload = (body) => {
  const payload = { ...body };
  if (payload.name) {
    payload.slug = slugify(payload.name, { lower: true, strict: true });
  } else if (payload.slug) {
    payload.slug = slugify(payload.slug, { lower: true, strict: true });
  }
  if (payload.status) {
    payload.isActive = payload.status === "active";
    delete payload.status;
  }
  return payload;
};

// CREATE NEW CATEGORY
const createCategory = asyncHandler(async (req, res) => {
  try {
    const payload = normalizeCategoryPayload(req.body);
    const newCategory = await BlogCategory.create(payload);
    res.json(newCategory);
  } catch (err) {
    throw new Error(err);
  }
});

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const cats = await BlogCategory.find().sort({ createdAt: -1 });
    res.json(cats);
  } catch (err) {
    throw new Error(err);
  }
});

// GET A SINGLE CATEGORY
const getSingleCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const cat = await BlogCategory.findById(id);
    res.json(cat);
  } catch (err) {
    throw new Error(err);
  }
});

// UPDATE CATEGORY
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const payload = normalizeCategoryPayload(req.body);
    const cat = await BlogCategory.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!cat) return res.status(404).json({ message: "Blog category not found" });
    res.json(cat);
  } catch (err) {
    throw new Error(err);
  }
});

// DELETE CATEGORY
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const cat = await BlogCategory.findByIdAndDelete(id);
    if (!cat) return res.status(404).json({ message: "Blog category not found" });
    res.json({
      message: "Blog Category successfully deleted",
      category: cat,
    });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
