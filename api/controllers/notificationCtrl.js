const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");
const User = require("../models/userModels");
const { createNotification } = require("../utils/notification");

const getNotifications = asyncHandler(async (req, res) => {
  const { status = "all", limit = 20, page = 1 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const isAdmin = req.user?.role === "admin";
  const filter = isAdmin
    ? { audience: { $in: ["admin", "all"] } }
    : { $or: [{ recipient: req.user?._id }, { audience: "all" }] };

  if (status === "unread") filter.isRead = false;
  if (status === "read") filter.isRead = true;

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Notification.countDocuments({ ...filter, isRead: false }),
    Notification.countDocuments(filter),
  ]);

  res.json({
    notifications,
    unreadCount,
    total,
    currentPage: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const accessFilter = req.user?.role === "admin"
    ? { _id: req.params.id, audience: { $in: ["admin", "all"] } }
    : { _id: req.params.id, $or: [{ recipient: req.user?._id }, { audience: "all" }] };

  const notification = await Notification.findOneAndUpdate(
    accessFilter,
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) return res.status(404).json({ message: "Notification not found." });
  res.json(notification);
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin"
    ? { isRead: false, audience: { $in: ["admin", "all"] } }
    : { isRead: false, $or: [{ recipient: req.user?._id }, { audience: "all" }] };

  await Notification.updateMany(
    filter,
    { isRead: true, readAt: new Date() }
  );

  const unreadCount = 0;
  res.json({ unreadCount });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const accessFilter = req.user?.role === "admin"
    ? { _id: req.params.id, audience: { $in: ["admin", "all"] } }
    : { _id: req.params.id, recipient: req.user?._id };
  const notification = await Notification.findOneAndDelete(accessFilter);
  if (!notification) return res.status(404).json({ message: "Notification not found." });
  res.json(notification);
});

const registerPushToken = asyncHandler(async (req, res) => {
  const { token, platform = "", deviceId = "" } = req.body;
  if (!token) return res.status(400).json({ message: "Push token is required." });

  await User.updateMany(
    { "expoPushTokens.token": token, _id: { $ne: req.user?._id } },
    { $pull: { expoPushTokens: { token } } }
  );

  const user = await User.findById(req.user?._id).select("expoPushTokens");
  if (!user) return res.status(404).json({ message: "User not found." });

  const existingToken = (user.expoPushTokens || []).find((item) => item.token === token);
  if (existingToken) {
    existingToken.platform = platform;
    existingToken.deviceId = deviceId;
    existingToken.updatedAt = new Date();
  } else {
    user.expoPushTokens.push({ token, platform, deviceId, updatedAt: new Date() });
  }

  await user.save();
  res.json({ success: true });
});

const unregisterPushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Push token is required." });

  await User.findByIdAndUpdate(req.user?._id, { $pull: { expoPushTokens: { token } } });
  res.json({ success: true });
});

const sendClientNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    recipientIds = [],
    audience = "selected",
    severity = "info",
    link = "",
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required." });
  }
  if (!["all", "selected"].includes(audience)) {
    return res.status(400).json({ message: "Invalid notification audience." });
  }
  if (!["info", "success", "warning", "error"].includes(severity)) {
    return res.status(400).json({ message: "Invalid notification priority." });
  }

  const userFilter = audience === "all"
    ? { role: { $ne: "admin" }, isBlock: { $ne: true } }
    : { _id: { $in: Array.isArray(recipientIds) ? recipientIds : [] }, role: { $ne: "admin" }, isBlock: { $ne: true } };

  const users = await User.find(userFilter).select("_id");
  if (!users.length) {
    return res.status(400).json({ message: "Select at least one client." });
  }

  const notifications = await Promise.all(
    users.map((user) =>
      createNotification({
        title,
        message,
        type: "alert",
        severity,
        entityType: "admin-message",
        recipient: user._id,
        audience: "user",
        link,
      })
    )
  );

  res.status(201).json({
    message: "Notification sent successfully.",
    sentCount: notifications.filter(Boolean).length,
  });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  sendClientNotification,
};
