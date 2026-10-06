import api from "@/lib/api"
import { create } from "zustand"

export type NotificationType = "order" | "payment" | "stock" | "system" | "alert"

export interface AppNotification {
    _id: string
    type: NotificationType
    title: string
    message: string
    severity: "info" | "success" | "warning" | "error"
    entityType?: string
    entityId?: string
    link?: string
    isRead: boolean
    readAt?: string
    createdAt: string
}

interface NotificationState {
    notifications: AppNotification[]
    unreadCount: number
    isLoading: boolean
    fetchNotifications: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (id: string) => Promise<void>
    registerPushToken: (token: string, platform: string, deviceId?: string) => Promise<void>
    unregisterPushToken: (token: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    fetchNotifications: async () => {
        try {
            set({ isLoading: true })
            const response = await api.get("/notifications")
            set({
                notifications: response.data.notifications || [],
                unreadCount: response.data.unreadCount || 0,
                isLoading: false,
            })
        } catch (error) {
            console.log("Failed to fetch notifications", error)
            set({ isLoading: false })
        }
    },
    markAsRead: async (id) => {
        await api.put(`/notifications/${id}/read`)
        set((state) => ({
            notifications: state.notifications.map((item) => item._id === id ? { ...item, isRead: true } : item),
            unreadCount: state.notifications.find((item) => item._id === id && !item.isRead)
                ? Math.max(state.unreadCount - 1, 0)
                : state.unreadCount,
        }))
    },
    markAllAsRead: async () => {
        await api.put("/notifications/read-all")
        set((state) => ({
            notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
            unreadCount: 0,
        }))
    },
    deleteNotification: async (id) => {
        await api.delete(`/notifications/${id}`)
        set((state) => {
            const deleted = state.notifications.find((item) => item._id === id)
            return {
                notifications: state.notifications.filter((item) => item._id !== id),
                unreadCount: deleted && !deleted.isRead ? Math.max(state.unreadCount - 1, 0) : state.unreadCount,
            }
        })
    },
    registerPushToken: async (token, platform, deviceId = "") => {
        await api.post("/notifications/push-token", { token, platform, deviceId })
    },
    unregisterPushToken: async (token) => {
        await api.delete("/notifications/push-token", { data: { token } })
    },
}))
