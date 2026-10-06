const router = require("express").Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerPushToken,
  unregisterPushToken,
  sendClientNotification,
} = require("../controllers/notificationCtrl");
const { authorizeUser, isAdmin } = require("../middleware/authMiddleware");

router.get("/", authorizeUser, getNotifications);
router.post("/push-token", authorizeUser, registerPushToken);
router.delete("/push-token", authorizeUser, unregisterPushToken);
router.post("/send-client", authorizeUser, isAdmin, sendClientNotification);
router.put("/read-all", authorizeUser, markAllNotificationsRead);
router.put("/:id/read", authorizeUser, markNotificationRead);
router.delete("/:id", authorizeUser, deleteNotification);

module.exports = router;
