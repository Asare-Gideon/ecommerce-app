const User = require("../models/userModels");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const authorizeUser = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    try {
      token = req?.headers?.authorization.split(" ")[1];
      let decode = await jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decode.id);
      req.user = user;
      next();
    } catch (err) {
      res.status(401);
      throw new Error(err);
    }
  } else {
    res.status(401);
    throw new Error("There's no token attached header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.user;
    const findUser = await User.findOne({ email });
    if (findUser.role !== "admin") {
      throw new Error("You are not an admin");
    } else {
      next();
    }
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = { authorizeUser, isAdmin };
