const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const Blog = require("../models/blogModel");
const Comment = require("../models/commentModal");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../config/awsConfig");
const crypto = require("crypto");

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeBlogPayload = (body, user, assignAuthor = false) => {
  const payload = { ...body };

  if (payload.title) {
    payload.slug = slugify(payload.title, { lower: true, strict: true });
  } else if (payload.slug) {
    payload.slug = slugify(payload.slug, { lower: true, strict: true });
  }

  if (payload.category && payload.categories === undefined) {
    payload.categories = [payload.category];
    delete payload.category;
  }

  if (payload.categories !== undefined) {
    payload.categories = normalizeStringArray(payload.categories);
  }

  if (payload.tags !== undefined) {
    payload.tags = normalizeStringArray(payload.tags);
  }

  if (payload.status) {
    payload.isPublished = payload.status === "published";
    delete payload.status;
  }

  if (payload.isPublished !== undefined) {
    payload.isPublished = Boolean(payload.isPublished);
    payload.publishedAt = payload.isPublished ? payload.publishedAt || new Date() : null;
  }

  if (payload.showOnHome !== undefined) {
    payload.showOnHome = Boolean(payload.showOnHome);
  }

  if (payload.isPublished === false) {
    payload.showOnHome = false;
  }

  if (assignAuthor && !payload.author && user?._id) {
    payload.author = user._id;
  }

  return payload;
};

const isBase64Image = (value) =>
  typeof value === "string" && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value);

const uploadBlogThumbnail = async (thumbnail) => {
  if (!isBase64Image(thumbnail)) return thumbnail;

  const [metadata, base64Data] = thumbnail.split(",");
  const contentType = metadata.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64$/)?.[1] || "image/jpeg";
  const extension = contentType.split("/")[1] || "jpg";
  const randomText = crypto.randomBytes(20).toString("hex");
  const fileKey = `blog-thumbnails/${randomText}_${Math.random()
    .toString(36)
    .substring(7)}.${extension}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: Buffer.from(base64Data, "base64"),
    ContentType: contentType,
    ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

// Create a new blog
const createBlog = asyncHandler(async (req, res) => {
  try {
    const payload = normalizeBlogPayload(req.body, req.user, true);
    if (payload.thumbnail) {
      payload.thumbnail = await uploadBlogThumbnail(payload.thumbnail);
    }
    if (payload.showOnHome) {
      await Blog.updateMany({ showOnHome: true }, { $set: { showOnHome: false } });
    }
    const blog = await Blog.create(payload);
    res.status(201).json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

const getBlogs = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      author,
      tag,
      search,
      status,
      showOnHome,
      sort = "createdAt:desc",
      limit = 10,
      page = 1,
    } = req.query;
    const query = {};
    if (category && category !== "all") query.categories = category;
    if (author) query.author = author;
    if (tag) query.tags = { $in: [tag] };
    if (status === "published") query.isPublished = true;
    if (status === "draft") query.isPublished = false;
    if (showOnHome !== undefined) query.showOnHome = showOnHome === "true" || showOnHome === true;
    if (search && search !== "all")
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];

    const [sortKey, sortOrder] = String(sort).split(":");
    const sortOptions = { [sortKey || "createdAt"]: sortOrder === "asc" ? 1 : -1 };
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const blogs = await Blog.find(query)
      .sort(sortOptions)
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .populate([
        { path: "author", select: "firstName lastName email" },
        { path: "categories", select: "name description slug" },
        {
          path: "comments",
          select: "comment user createdAt",
          populate: {
            path: "user",
            select: "firstName lastName email",
          },
        },
      ]);

    const total = await Blog.countDocuments(query);
    res.json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      blogs: blogs,
    });
  } catch (err) {
    throw new Error(err);
  }
});

// Get a single blog
const getSingleBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDb(id);
  try {
    const blog = await Blog.findById(id).populate([
      { path: "author", select: "firstName lastName email" },
      { path: "categories", select: "name description slug" },
      {
        path: "comments",
        select: "comment user createdAt",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      },
    ]);
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// Update a blog
const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const payload = normalizeBlogPayload(req.body, req.user);
    if (payload.thumbnail) {
      payload.thumbnail = await uploadBlogThumbnail(payload.thumbnail);
    }
    if (payload.showOnHome) {
      await Blog.updateMany({ _id: { $ne: id }, showOnHome: true }, { $set: { showOnHome: false } });
    }
    const blog = await Blog.findByIdAndUpdate(id, payload, {
      new: true,
    }).populate([
      { path: "author", select: "firstName lastName email" },
      { path: "categories", select: "name description slug" },
    ]);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// Delete a blog
const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully", blog });
  } catch (err) {
    throw new Error(err);
  }
});

// Like or unlike a blog
const likeBlog = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const blog = await Blog.findById(id);
    const userId = req.body.userId;
    if (blog.likes.includes(userId)) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId);
    } else {
      blog.likes.push(userId);
    }
    await blog.save();
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// Add a comment
const addComment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const comment = await Comment.create(req.body);
    const blog = await Blog.findById(id);
    blog.comments.push(comment._id);
    await blog.save();
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

// Publish or unpublish a blog
const togglePublish = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const currentBlog = await Blog.findById(id);
    if (!currentBlog) return res.status(404).json({ message: "Blog not found" });
    const nextStatus =
      req.body.isPublished === undefined ? !currentBlog.isPublished : Boolean(req.body.isPublished);
    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        isPublished: nextStatus,
        publishedAt: nextStatus ? new Date() : null,
        ...(nextStatus ? {} : { showOnHome: false }),
      },
      { new: true }
    ).populate([
      { path: "author", select: "firstName lastName email" },
      { path: "categories", select: "name description slug" },
    ]);
    res.json(blog);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBlog,
  getSingleBlog,
  updateBlog,
  togglePublish,
  addComment,
  likeBlog,
  deleteBlog,
  getBlogs,
};
