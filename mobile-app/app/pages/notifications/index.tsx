"use client"

import { useAuth } from "@/hooks/useAuth"
import { AppNotification, useNotificationStore } from "@/store/notifications"
import { useFocusEffect } from "@react-navigation/native"
import { router } from "expo-router"
import { ArrowLeft, Bell, CheckCheck, CreditCard, Megaphone, Package, Trash2, User } from "lucide-react-native"
import { useCallback, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import ReAnimated, { FadeIn, FadeInDown, FadeInUp, SlideInDown } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const severityLabels: Record<AppNotification["severity"], string> = {
    info: "Info",
    success: "Success",
    warning: "Warning",
    error: "Action needed",
}

export default function NotificationsScreen() {
    const { isAuthenticated } = useAuth()
    const insets = useSafeAreaInsets()
    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
        useNotificationStore()
    const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)

    useFocusEffect(
        useCallback(() => {
            if (isAuthenticated) fetchNotifications()
        }, [fetchNotifications, isAuthenticated]),
    )

    const openNotification = async (notification: AppNotification) => {
        setSelectedNotification(notification)
        if (!notification.isRead) {
            await markAsRead(notification._id)
        }
    }

    const openRelatedItem = (notification: AppNotification) => {
        setSelectedNotification(null)
        if (notification.entityType === "order" && notification.entityId) {
            router.push({ pathname: "/pages/orders/details" as any, params: { id: notification.entityId } as any })
            return
        }
        if (notification.link) {
            router.push(notification.link as any)
        }
    }

    const getNotificationIcon = (type: AppNotification["type"]) => {
        if (type === "order") return Package
        if (type === "payment") return CreditCard
        if (type === "alert") return Megaphone
        return Bell
    }

    const getNotificationColor = (notification: AppNotification) => {
        if (notification.severity === "success") return "#10B981"
        if (notification.severity === "warning") return "#F59E0B"
        if (notification.severity === "error") return "#EF4444"
        if (notification.type === "alert") return "#EC4899"
        return "#6366F1"
    }

    const formatTimeAgo = (dateString: string) => {
        const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60))
        if (diffInHours < 1) return "Just now"
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`
        return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity
                style={[styles.headerAction, unreadCount === 0 && styles.headerActionDisabled]}
                disabled={unreadCount === 0}
                onPress={markAllAsRead}
                activeOpacity={0.7}
            >
                <CheckCheck size={20} color={unreadCount === 0 ? "#CBD5E1" : "#6366F1"} />
            </TouchableOpacity>
        </ReAnimated.View>
    )

    const renderNotificationItem = ({ item, index }: { item: AppNotification; index: number }) => {
        const IconComponent = getNotificationIcon(item.type)
        const iconColor = getNotificationColor(item)

        return (
            <ReAnimated.View entering={FadeInUp.delay(Math.min(index, 8) * 35).springify()}>
                <TouchableOpacity
                    style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
                    onPress={() => openNotification(item)}
                    activeOpacity={0.82}
                >
                    <View style={[styles.accentLine, { backgroundColor: iconColor }]} />
                    <View style={styles.notificationBody}>
                        <View style={[styles.notificationIcon, { backgroundColor: `${iconColor}16` }]}>
                            <IconComponent size={20} color={iconColor} />
                        </View>
                        <View style={styles.notificationContent}>
                            <View style={styles.notificationMetaRow}>
                                <Text style={[styles.severityLabel, { color: iconColor }]}>{severityLabels[item.severity]}</Text>
                                <Text style={styles.notificationTime}>{formatTimeAgo(item.createdAt)}</Text>
                            </View>
                            <View style={styles.notificationTitleRow}>
                                <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
                                {!item.isRead && <View style={styles.unreadDot} />}
                            </View>
                            <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ReAnimated.View>
        )
    }

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
    )

    const renderDetailsDrawer = () => {
        if (!selectedNotification) return null

        const iconColor = getNotificationColor(selectedNotification)
        const IconComponent = getNotificationIcon(selectedNotification.type)
        const hasRelatedItem =
            (selectedNotification.entityType === "order" && selectedNotification.entityId) || selectedNotification.link

        return (
            <Modal transparent visible animationType="none" onRequestClose={() => setSelectedNotification(null)}>
                <ReAnimated.View entering={FadeIn.duration(160)} style={styles.drawerOverlay}>
                    <Pressable style={styles.drawerBackdrop} onPress={() => setSelectedNotification(null)} />
                    <ReAnimated.View
                        entering={SlideInDown.springify().damping(22).stiffness(180)}
                        style={[styles.drawer, { paddingBottom: Math.max(insets.bottom + 18, 34) }]}
                    >
                        <View style={styles.drawerHandle} />
                        <View style={styles.drawerHeader}>
                            <View style={[styles.drawerIcon, { backgroundColor: `${iconColor}16` }]}>
                                <IconComponent size={24} color={iconColor} />
                            </View>
                            <View style={styles.drawerHeaderText}>
                                <Text style={styles.drawerEyebrow}>{severityLabels[selectedNotification.severity]}</Text>
                                <Text style={styles.drawerDate}>
                                    {new Date(selectedNotification.createdAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.drawerTitle}>{selectedNotification.title}</Text>
                        <Text style={styles.drawerMessage}>{selectedNotification.message}</Text>
                        <View style={styles.drawerActions}>
                            {hasRelatedItem ? (
                                <TouchableOpacity
                                    style={styles.primaryAction}
                                    onPress={() => openRelatedItem(selectedNotification)}
                                    activeOpacity={0.84}
                                >
                                    <Text style={styles.primaryActionText}>
                                        {selectedNotification.entityType === "order" ? "View order" : "Open"}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity
                                style={styles.secondaryAction}
                                onPress={async () => {
                                    await deleteNotification(selectedNotification._id)
                                    setSelectedNotification(null)
                                }}
                                activeOpacity={0.84}
                            >
                                <Trash2 size={18} color="#EF4444" />
                                <Text style={styles.secondaryActionText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </ReAnimated.View>
                </ReAnimated.View>
            </Modal>
        )
    }

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                        <User size={60} color="#6366F1" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Sign in to view notifications</Text>
                    <Text style={styles.authText}>Receive updates about orders, payments, and admin messages.</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login" as any)} activeOpacity={0.8}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </ReAnimated.View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}
            <View style={styles.container}>
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.notificationsList}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} tintColor="#6366F1" />}
                    ItemSeparatorComponent={() => <View style={styles.notificationSeparator} />}
                    ListEmptyComponent={
                        isLoading ? renderLoadingState() : (
                            <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
                                <View style={styles.emptyIconContainer}>
                                    <Bell size={50} color="#CBD5E1" strokeWidth={1.5} />
                                </View>
                                <Text style={styles.emptyTitle}>No notifications</Text>
                                <Text style={styles.emptyText}>Order updates, payment messages, and admin alerts will appear here.</Text>
                            </ReAnimated.View>
                        )
                    }
                />
            </View>
            {renderDetailsDrawer()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    backButton: { padding: 4 },
    headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
    unreadBadge: { backgroundColor: "#EF4444", borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 },
    unreadBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    headerAction: { padding: 4 },
    headerActionDisabled: { opacity: 0.8 },
    container: { flex: 1 },
    notificationsList: { padding: 16, paddingBottom: 100, flexGrow: 1 },
    notificationCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, backgroundColor: "#FFFFFF", overflow: "hidden" },
    notificationCardUnread: { borderColor: "#C7D2FE", backgroundColor: "#FBFCFF" },
    accentLine: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4 },
    notificationBody: { flexDirection: "row", alignItems: "flex-start", padding: 14, paddingLeft: 16 },
    notificationIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
    notificationContent: { flex: 1 },
    notificationMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 },
    severityLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0 },
    notificationTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    notificationTitle: { fontSize: 15, fontWeight: "700", color: "#111827", flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366F1" },
    notificationMessage: { fontSize: 13, color: "#64748B", lineHeight: 19 },
    notificationTime: { fontSize: 12, color: "#94A3B8", fontWeight: "600" },
    notificationSeparator: { height: 12 },
    drawerOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.45)", justifyContent: "flex-end" },
    drawerBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    drawer: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 28 },
    drawerHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 18 },
    drawerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
    drawerIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12 },
    drawerHeaderText: { flex: 1 },
    drawerEyebrow: { color: "#6366F1", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0 },
    drawerDate: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginTop: 3 },
    drawerTitle: { color: "#111827", fontSize: 22, fontWeight: "800", lineHeight: 28, marginBottom: 10 },
    drawerMessage: { color: "#475569", fontSize: 15, lineHeight: 23 },
    drawerActions: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24 },
    primaryAction: { flex: 1, height: 48, borderRadius: 14, backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center" },
    primaryActionText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
    secondaryAction: { height: 48, borderRadius: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FEF2F2", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    secondaryActionText: { color: "#EF4444", fontSize: 14, fontWeight: "800" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, gap: 12 },
    loadingText: { color: "#64748B", fontSize: 14, fontWeight: "700" },
    emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center", marginBottom: 20 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 8, textAlign: "center" },
    emptyText: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20 },
    authContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
    authIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#EEF2FF", justifyContent: "center", alignItems: "center", marginBottom: 24 },
    authTitle: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 12, textAlign: "center" },
    authText: { fontSize: 15, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 32 },
    loginButton: { backgroundColor: "#6366F1", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: "center" },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
