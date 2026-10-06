import axios from "axios";

import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { BASE_URL } from "@/utils/constants";
import { toast } from "./use-toast";

const NOTIFICATION_URL = `${BASE_URL}/notifications`;

const getErrorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || fallback;

type ClientNotificationPayload = {
  title: string;
  message: string;
  audience: "all" | "selected";
  recipientIds?: string[];
  severity?: "info" | "success" | "warning" | "error";
  link?: string;
};

export function useNotifications() {
  const { token } = useAuthStore();
  const {
    setNotifications,
    setUnreadCount,
    setLoading,
    markReadInState,
    markAllReadInState,
  } = useNotificationStore();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchNotifications = async (status = "all", limit = 10) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${NOTIFICATION_URL}?status=${status}&limit=${limit}`, { headers });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
      return response.data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to fetch notifications.",
        description: getErrorMessage(error, "Something went wrong please try again later."),
      });
    } finally {
      setLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!token) return;
    markReadInState(id);
    try {
      await axios.put(`${NOTIFICATION_URL}/${id}/read`, {}, { headers });
    } catch (error) {
      fetchNotifications();
    }
  };

  const markAllNotificationsRead = async () => {
    if (!token) return;
    markAllReadInState();
    try {
      await axios.put(`${NOTIFICATION_URL}/read-all`, {}, { headers });
    } catch (error) {
      fetchNotifications();
    }
  };

  const sendClientNotification = async (payload: ClientNotificationPayload) => {
    if (!token) return;
    try {
      const response = await axios.post(`${NOTIFICATION_URL}/send-client`, payload, { headers });
      toast({
        variant: "default",
        title: "Notification sent.",
        description: `${response.data.sentCount || 0} client notification(s) created.`,
      });
      return response.data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send notification.",
        description: getErrorMessage(error, "Something went wrong please try again later."),
      });
      throw error;
    }
  };

  return {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    sendClientNotification,
  };
}
