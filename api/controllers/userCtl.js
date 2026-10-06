const generateToken = require("../config/jsonToken");
const User = require("../models/userModels");
const asyncHandler = require("express-async-handler");
const validateMongoDb = require("../utils/ValidateMongoDB");
const generateRefreshToken = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Order = require("../models/orderModel");
const {
  sendPasswordResetEmail,
  sendSuccessfullResetEmail,
} = require("../mailtrap/mails");
const sendSms = require("../utils/sendSMS");

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

// CREATE USER CONTROLLER
const createUser = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  console.log(req.body);
  console.log(email, phone);
  try {
    let findUser;
    if (email) {
      findUser = await User.findOne({ email });
    } else if (phone) {
      findUser = await User.findOne({ phone });
    }

    if (!findUser) {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } else {
      res.status(400);
      throw new Error("User already exist");
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

// LOGIN USER CONTROLLER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, phone } = req.body;
  let findUser;
  if (email) {
    findUser = await User.findOne({ email });
  } else if (phone) {
    findUser = await User.findOne({ phone });
  }

  if (!findUser) throw new Error("User does not exist");
  const isvalidPass = await findUser.isPasswordMatch(password);
  if (isvalidPass) {
    const refreshToken = generateRefreshToken(findUser?._id);
    findUser.refreshToken = refreshToken;
    await findUser.save();

    res.cookie("refreshToken", refreshToken, {
      maxAge: ONE_WEEK_IN_MS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const orders = await Order.find({ user: findUser._id });
    if (orders.length > 0) {
      const totalSpent = orders.reduce(
        (acc, order) => acc + order.totalAmount,
        0
      );
      findUser.totalOrders = orders.length;
      findUser.totalSpent = totalSpent;
    }

    findUser.loginAt = new Date();
    await findUser.save();

    res.status(200).json({
      token: generateToken(findUser?._id),
      refreshToken,
      user: {
        _id: findUser?._id,
        id: findUser?._id,
        firstName: findUser?.firstName,
        lastName: findUser?.lastName,
        email: findUser?.email,
        phone: findUser?.phone,
        role: findUser?.role,
        isBlock: findUser?.isBlock,
        totalOrders: findUser?.totalOrders,
        totalSpent: findUser?.totalSpent,
        wishlist: findUser?.wishlist,
        carts: findUser?.carts,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid user password");
  }
});

// GET ALL USERS CONTROLLER

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const {
      role,
      isBlock,
      search,
      dateRange,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (isBlock && isBlock !== "all") {
      filter.isBlock = isBlock !== "active";
    }

    if (search && search !== "") {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (dateRange && dateRange !== "all") {
      const { from, to } = JSON.parse(dateRange);
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ totalUsers, users });
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
});

// GET A SINGLE USER CONTROLLER
const getSingleUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const user = await User.findById(id).populate([{ path: "wishlist" }, { path: "addresses" }]);

    res.json({
      ...user._doc,
      password: undefined,
    });
  } catch (err) {
    console.log(err);
    res.status(400);
    throw new Error(err);
  }
});

// UPDATE USER CONTROLLER

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });

    res.json({
      ...user._doc,
      password: undefined,
    });
  } catch (err) {
    res.status(400);
    throw new Error(err);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required." });
  }

  const user = await User.findById(req.user?._id);
  if (!user) return res.status(404).json({ message: "User not found." });

  const isValidPassword = await user.isPasswordMatch(currentPassword);
  if (!isValidPassword) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully." });
});

const deleteOwnAccount = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.user?._id);
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ message: "Account deleted successfully." });
});

// GET USER TOTALS CONTROLLER
const getUserTotals = asyncHandler(async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database

    const totalUsers = users.length;
    const activeUsers = users.filter((user) => !user.isBlocked).length;
    const inactiveUsers = users.filter((user) => user.isBlocked).length;
    const newUsers = users.filter(
      (user) =>
        new Date(user.createdAt) >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length; // New users in the last 30 days

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
});

// DELETE USER CONTROLLER

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const user = await User.findByIdAndDelete(id);
    res.json(user);
  } catch (err) {
    throw new Error(err);
  }
});

// BLOCK USER CONTROLLER

const blockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const userUpdate = await User.findByIdAndUpdate(
      id,
      { isBlock: true },
      { new: true }
    );
    res.json(userUpdate);
  } catch (err) {
    throw new Error(err);
  }
});

// BLOCK USER CONTROLLER

const unblockUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const userUpdate = await User.findByIdAndUpdate(
      id,
      { isBlock: false },
      { new: true }
    );

    res.json(userUpdate);
  } catch (err) {
    throw new Error(err);
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.params;
    const cookie = req.cookies;

    if (!cookie?.refreshToken && !refreshToken) {
      res.status(401);
      throw new Error("No refresh token attached to the request");
    }

    const getRefreshToken = cookie.refreshToken || refreshToken;

    const findUser = await User.findOne({ refreshToken: getRefreshToken });

    if (!findUser) {
      res.status(401);
      throw new Error("Refresh token not found");
    }

    const decoded = jwt.verify(getRefreshToken, process.env.JWT_SECRET);
    if (decoded.id !== findUser._id.toString()) {
      res.status(401);
      throw new Error("Refresh token does not match user");
    }

    const accessToken = generateToken(findUser._id);

    res.json({
      accessToken: accessToken,
    });
  } catch (err) {
    res.status(401);
    throw new Error(err);
  }
});

const handleLogout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refreshToken in cookie");
  let refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  user.refreshToken = "";
  await user.save();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});

const forgotpassword = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  let findUser;
  if (email) {
    findUser = await User.findOne({ email });
  }
  if (phone) {
    findUser = await User.findOne({ phone });
  }
  if (!findUser) throw new Error("User does not exist");


  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();;
  const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

  findUser.resetToken = resetCode;
  findUser.resetExpiresDate = resetTokenExpiresAt;
  await findUser.save();

  if (email) {
    await sendPasswordResetEmail(
      "asaregid506@gmail.com",
      resetCode
    );
    res.json({
      message: "password reset link has been sent to your email",
    });
  }
  else if (phone) {
    await sendSms([phone], `Your reset code is ${resetCode}`)
    res.json({
      message: "password reset code has been sent to your phone",
    });
  }

});

const resetPassowrd = asyncHandler(async (req, res) => {
  const { password, resetToken } = req.body;

  if (!resetToken) throw new Error("No reset code found!");

  const findUser = await User.findOne({
    resetToken: resetToken,
  });

  if (!findUser) throw new Error("Reset token expired");
  let email = "asaregid506@gmail.com";
  findUser.resetToken = undefined;
  findUser.resetExpiresDate = undefined;
  findUser.password = password;
  await findUser.save();
  const senderEmail = await sendSuccessfullResetEmail(email);

  res.json({
    message: "password reset successfully",
    status: senderEmail,
  });
});


const verifyResetCode = asyncHandler(async (req, res) => {
  const { resetToken } = req.body;

  if (!resetToken) throw new Error("No reset code found!");

  const findUser = await User.findOne({
    resetToken: resetToken,
    resetExpiresDate: { $gt: Date.now() },
  });

  if (!findUser) throw new Error("Reset token expired");

  res.json({
    message: "Reset code is valid",
  });
});


const addToCarts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, price, title, image } = req.body;

    // Validate MongoDB ID
    validateMongoDb(id);

    // Find the user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const productIndex = user.carts.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (productIndex !== -1) {
      user.carts[productIndex].quantity += quantity;
      user.carts[productIndex].price += price * quantity;
    } else {
      user.carts.push({ productId, quantity, price, title, image });
    }
    await user.save();

    res.status(200).json({
      message: "Cart updated successfully",
      carts: user.carts,
    });
  } catch (err) {
    throw new Error(err.message || "An error occurred while updating the cart");
  }
});

const removeFromCarts = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    validateMongoDb(id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.carts = user.carts.filter((p) => p.productId.toString() !== productId);
    await user.save();
    res.status(200).json({
      message: "Product removed from cart",
      carts: user.carts,
    });
  } catch (err) {
    throw new Error(
      err.message || "An error occurred while removing the product"
    );
  }
});

const toggleWishlist = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    validateMongoDb(id);
    validateMongoDb(productId);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wishlistIndex = user.wishlist.findIndex(
      (w) => w.toString() === productId
    );

    if (wishlistIndex !== -1) {
      user.wishlist = user.wishlist.filter((w) => w.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    res.status(200).json({
      message: "wishlist updated",
      wishlist: user.wishlist,
    });
  } catch (err) {
    throw new Error(err.message || "An error occurred while updating wishlist");
  }
});

const getWishlist = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDb(id);
    const user = await User.findById(id).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      wishlist: user.wishlist,
    });
  } catch (err) {
    throw new Error(err.message || "An error occurred while fetching wishlist");
  }
});

module.exports = {
  getWishlist,
  createUser,
  loginUser,
  getAllUser,
  getSingleUser,
  deleteUser,
  updateUser,
  changePassword,
  deleteOwnAccount,
  blockUser,
  unblockUser,
  handleRefreshToken,
  handleLogout,
  forgotpassword,
  resetPassowrd,
  addToCarts,
  removeFromCarts,
  toggleWishlist,
  getUserTotals,
  verifyResetCode
};
