const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    startsAt: {
      type: Date,
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      required: true,
    },
    color: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    images: [{ name: String, url: String }],
    brand: {
      type: String,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    discount: {
      type: discountSchema,
      default: () => ({}),
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true }
);

productSchema.methods.getEffectivePrice = function () {
  const price = Number(this.price) || 0;
  const discount = this.discount || {};
  const now = new Date();
  const startsAt = discount.startsAt ? new Date(discount.startsAt) : null;
  const endsAt = discount.endsAt ? new Date(discount.endsAt) : null;

  const isActive =
    discount.isActive &&
    Number(discount.value) > 0 &&
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now);

  if (!isActive) return price;

  const value = Number(discount.value) || 0;
  if (discount.type === "fixed") {
    return Math.max(price - value, 0);
  }

  return Math.max(price - price * (Math.min(value, 100) / 100), 0);
};

productSchema.virtual("effectivePrice").get(function () {
  return this.getEffectivePrice();
});

productSchema.virtual("hasDiscount").get(function () {
  return this.getEffectivePrice() < (Number(this.price) || 0);
});

productSchema.virtual("averageRating").get(function () {
  const ratings = Array.isArray(this.ratings) ? this.ratings : [];
  if (ratings.length === 0) return 0;
  const total = ratings.reduce((sum, { rating }) => sum + rating, 0);
  return total / ratings.length;
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
