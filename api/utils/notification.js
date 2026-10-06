const Notification = require("../models/notificationModel");
const User = require("../models/userModels");
const axios = require("axios");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isExpoPushToken = (token = "") => /^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/.test(token);

const sendExpoPushNotifications = async ({ recipients = [], title, message, data = {} }) => {
  const userIds = recipients.map((recipient) => String(recipient || "")).filter(Boolean);
  if (!userIds.length || !title || !message) return;

  const users = await User.find({ _id: { $in: userIds } }).select("expoPushTokens");
  const tokens = [
    ...new Set(
      users
        .flatMap((user) => user.expoPushTokens || [])
        .map((item) => item.token)
        .filter(isExpoPushToken)
    ),
  ];

  if (!tokens.length) return;

  const messages = tokens.map((to) => ({
    to,
    sound: "default",
    title,
    body: message,
    data,
  }));

  try {
    await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to send Expo push notification:", error.response?.data || error.message);
  }
};

const createNotification = async ({
  title,
  message,
  type = "system",
  severity = "info",
  entityType = "",
  entityId,
  recipient,
  audience = recipient ? "user" : "admin",
  link = "",
}) => {
  if (!title || !message) return null;

  const notification = await Notification.create({
    title,
    message,
    type,
    severity,
    entityType,
    entityId,
    recipient,
    audience,
    link,
  });

  const shouldPush = recipient && ["user", "all"].includes(audience);
  if (shouldPush) {
    await sendExpoPushNotifications({
      recipients: [recipient],
      title,
      message,
      data: {
        notificationId: String(notification._id),
        type,
        entityType,
        entityId: entityId ? String(entityId) : "",
        link,
      },
    });
  }

  return notification;
};

module.exports = { createNotification, sendExpoPushNotifications };
