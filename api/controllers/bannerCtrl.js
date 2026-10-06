const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const Banner = require("../models/bannerModel");
const { uploadImages } = require("../utils/uploadImages");

const normalizeBannerPayload = async (body) => {
  const payload = {
    name: body.name || body.title || "",
    placement: body.placement === "promo" ? "promo" : "slider",
    title: body.title || body.name || "",
    subtitle: body.subtitle || "",
    buttonText: body.buttonText || "Shop Now",
    link: body.link || "",
    image: body.image || "",
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    sortOrder: Number(body.sortOrder) || 0,
  };

  if (payload.image && /^data:image\//.test(payload.image)) {
    const [uploadedImage] = await uploadImages([payload.image]);
    payload.image = uploadedImage?.url || "";
  }

  return payload;
};

// CREATE NEW BANNER
const createBanner = asyncHandler(async (req, res) => {
  try {
    const payload = await normalizeBannerPayload(req.body);
    const newBanner = await Banner.create(payload);
    res.json(newBanner);
  } catch (err) {
    throw new Error(err);
  }
});

// GET ALL Banners
const getBanners = asyncHandler(async (req, res) => {
  try {
    const query = req.query.includeInactive === "true" ? {} : { isActive: true };
    if (req.query.placement === "slider") {
      query.$or = [{ placement: "slider" }, { placement: { $exists: false } }];
    } else if (req.query.placement === "promo") {
      query.placement = req.query.placement;
    }
    const banners = await Banner.find(query).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    throw new Error(err);
  }
});

// UPDATE BANNER
const updateBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);

    const payload = await normalizeBannerPayload(req.body);
    const banner = await Banner.findByIdAndUpdate(id, payload, {
      new: true,
    });
    res.json(banner);
  } catch (err) {
    throw new Error(err);
  }
});

// DELETE BANNER
const deleteBanner = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const banner = await Banner.findByIdAndDelete(id);
    res.json({
      message: "Banner successfully deleted",
      banner,
    });
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = { createBanner, updateBanner, getBanners, deleteBanner };
