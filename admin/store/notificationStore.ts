import { create } from "zustand";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "stock" | "system" | "alert";
  severity: "info" | "success" | "warning" | "error";
  entityType: string;
  entityId?: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
  setLoading: (isLoading: boolean) => void;
  markReadInState: (id: string) => void;
  markAllReadInState: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setLoading: (isLoading) => set({ isLoading }),
  markReadInState: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification._id === id ? { ...notification, isRead: true } : notification
      ),
      unreadCount: Math.max(state.unreadCount - 1, 0),
    })),
  markAllReadInState: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
      unreadCount: 0,
    })),
}));
