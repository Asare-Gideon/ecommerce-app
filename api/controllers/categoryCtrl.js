const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const Category = require("../models/categoryModal");

// CREATE NEW CATEGORY
const createCategory = asyncHandler(async (req, res) => {
  try {
    let slugTitle = slugify(req.body.name);
    req.body.slug = slugTitle;
    const newProduct = await Category.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const cats = await Category.find();
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
    const cat = await Category.findById(id);
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
    const cat = await Category.findByIdAndUpdate(id, req.body, { new: true });
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
    const cat = await Category.findByIdAndDelete(id);
    res.json({
      message: "Category successfully deleted",
      product: cat,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const toggleCategoryStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updatCat = await Category.findByIdAndUpdate(
      id,
      {
        isActive: !category.isActive,
      },
      { new: true }
    );

    res.json(updatCat);
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
  toggleCategoryStatus,
};
