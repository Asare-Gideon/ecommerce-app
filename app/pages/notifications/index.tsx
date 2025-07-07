"use client"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import { ArrowLeft, Bell, Check, CheckCheck, Package, ShoppingCart, Star, Trash2, User } from "lucide-react-native"
import { useState } from "react"
import {
    Dimensions,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import ReAnimated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Mock notifications data
const MOCK_NOTIFICATIONS = [
    {
        _id: "notif1",
        type: "order",
        title: "Order Delivered",
        message: "Your order #ORD123456 has been delivered successfully. Thank you for shopping with us!",
        read: false,
        createdAt: "2024-01-15T10:30:00Z",
        data: {
            orderId: "ORD123456",
            status: "delivered",
        },
    },
    {
        _id: "notif2",
        type: "promotion",
        title: "Special Offer - 20% Off",
        message: "Get 20% off on all electronics! Use code SAVE20 at checkout. Valid until tomorrow.",
        read: false,
        createdAt: "2024-01-15T08:15:00Z",
        data: {
            code: "SAVE20",
            discount: 20,
        },
    },
    {
        _id: "notif3",
        type: "order",
        title: "Order Shipped",
        message: "Your order #ORD123455 is on its way! Track your package for real-time updates.",
        read: true,
        createdAt: "2024-01-14T16:45:00Z",
        data: {
            orderId: "ORD123455",
            status: "shipped",
            trackingNumber: "TRK789012",
        },
    },
    {
        _id: "notif4",
        type: "review",
        title: "Review Request",
        message: "How was your recent purchase? Share your experience and help other customers.",
        read: true,
        createdAt: "2024-01-14T14:20:00Z",
        data: {
            productId: "prod123",
            orderId: "ORD123454",
        },
    },
    {
        _id: "notif5",
        type: "account",
        title: "Profile Updated",
        message: "Your profile information has been successfully updated.",
        read: true,
        createdAt: "2024-01-13T11:30:00Z",
        data: {},
    },
    {
        _id: "notif6",
        type: "promotion",
        title: "Flash Sale Alert",
        message: "⚡ Flash Sale is live! Up to 50% off on selected items. Hurry, limited time only!",
        read: true,
        createdAt: "2024-01-12T09:00:00Z",
        data: {
            saleId: "flash001",
            discount: 50,
        },
    },
    {
        _id: "notif7",
        type: "order",
        title: "Order Confirmed",
        message: "Your order #ORD123453 has been confirmed and is being prepared for shipment.",
        read: true,
        createdAt: "2024-01-11T15:22:00Z",
        data: {
            orderId: "ORD123453",
            status: "confirmed",
        },
    },
]

type NotificationType = "order" | "promotion" | "review" | "account"

interface Notification {
    _id: string
    type: NotificationType
    title: string
    message: string
    read: boolean
    createdAt: string
    data: any
}

export default function NotificationsScreen() {
    const { isAuthenticated } = useAuth()
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
    const [showOptionsModal, setShowOptionsModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read if unread
        if (!notification.read) {
            setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n)))
        }

        // Handle navigation based on notification type
        switch (notification.type) {
            case "order":
                // Navigate to order details
                console.log("Navigate to order:", notification.data.orderId)
                break
            case "promotion":
                // Navigate to promotions or products
                console.log("Navigate to promotion:", notification.data)
                break
            case "review":
                // Navigate to review screen
                console.log("Navigate to review:", notification.data.productId)
                break
            case "account":
                // Navigate to profile
                console.log("Navigate to profile")
                break
        }
    }

    const handleLongPress = (notification: Notification) => {
        setSelectedNotification(notification)
        setShowOptionsModal(true)
    }

    const handleMarkAsRead = () => {
        if (selectedNotification) {
            setNotifications((prev) => prev.map((n) => (n._id === selectedNotification._id ? { ...n, read: true } : n)))
        }
        setShowOptionsModal(false)
    }

    const handleMarkAsUnread = () => {
        if (selectedNotification) {
            setNotifications((prev) => prev.map((n) => (n._id === selectedNotification._id ? { ...n, read: false } : n)))
        }
        setShowOptionsModal(false)
    }

    const handleDeleteNotification = () => {
        setShowOptionsModal(false)
        setShowDeleteModal(true)
    }

    const confirmDeleteNotification = () => {
        if (selectedNotification) {
            setNotifications((prev) => prev.filter((n) => n._id !== selectedNotification._id))
            setSelectedNotification(null)
        }
        setShowDeleteModal(false)
    }

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case "order":
                return Package
            case "promotion":
                return ShoppingCart
            case "review":
                return Star
            case "account":
                return User
            default:
                return Bell
        }
    }

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case "order":
                return "#6366F1"
            case "promotion":
                return "#F59E0B"
            case "review":
                return "#10B981"
            case "account":
                return "#8B5CF6"
            default:
                return "#6B7280"
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return "Just now"
        if (diffInHours < 24) return `${diffInHours}h ago`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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
                        <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.headerAction} onPress={handleMarkAllAsRead} activeOpacity={0.7}>
                <CheckCheck size={20} color="#6366F1" />
            </TouchableOpacity>
        </ReAnimated.View>
    )

    const renderNotificationItem = ({ item, index }: { item: Notification; index: number }) => {
        const IconComponent = getNotificationIcon(item.type)
        const iconColor = getNotificationColor(item.type)

        return (
            <ReAnimated.View entering={FadeInUp.delay(index * 50).springify()}>
                <TouchableOpacity
                    style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
                    onPress={() => handleNotificationPress(item)}
                    onLongPress={() => handleLongPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.notificationHeader}>
                        <View style={styles.notificationLeft}>
                            <View style={[styles.notificationIcon, { backgroundColor: `${iconColor}15` }]}>
                                <IconComponent size={20} color={iconColor} />
                            </View>
                            <View style={styles.notificationContent}>
                                <View style={styles.notificationTitleRow}>
                                    <Text style={styles.notificationTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    {!item.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.notificationMessage} numberOfLines={2}>
                                    {item.message}
                                </Text>
                                <Text style={styles.notificationTime}>{formatTimeAgo(item.createdAt)}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </ReAnimated.View>
        )
    }

    const renderOptionsModal = () => (
        <Modal transparent visible={showOptionsModal} animationType="fade">
            <View style={styles.optionsOverlay}>
                <TouchableOpacity style={styles.optionsBackdrop} onPress={() => setShowOptionsModal(false)} activeOpacity={1} />
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.optionsModal}>
                    <Text style={styles.optionsTitle}>Notification Options</Text>

                    {selectedNotification?.read ? (
                        <TouchableOpacity style={styles.optionItem} onPress={handleMarkAsUnread} activeOpacity={0.7}>
                            <Bell size={20} color="#6366F1" />
                            <Text style={styles.optionText}>Mark as Unread</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.optionItem} onPress={handleMarkAsRead} activeOpacity={0.7}>
                            <Check size={20} color="#10B981" />
                            <Text style={styles.optionText}>Mark as Read</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.optionItem, styles.deleteOption]}
                        onPress={handleDeleteNotification}
                        activeOpacity={0.7}
                    >
                        <Trash2 size={20} color="#EF4444" />
                        <Text style={[styles.optionText, styles.deleteOptionText]}>Delete</Text>
                    </TouchableOpacity>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const renderDeleteModal = () => (
        <Modal transparent visible={showDeleteModal} animationType="fade">
            <View style={styles.deleteOverlay}>
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.deleteModal}>
                    <Text style={styles.deleteTitle}>Delete Notification</Text>
                    <Text style={styles.deleteMessage}>
                        Are you sure you want to delete this notification? This action cannot be undone.
                    </Text>
                    <View style={styles.deleteActions}>
                        <TouchableOpacity style={styles.deleteCancel} onPress={() => setShowDeleteModal(false)} activeOpacity={0.8}>
                            <Text style={styles.deleteCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteConfirm} onPress={confirmDeleteNotification} activeOpacity={0.8}>
                            <Text style={styles.deleteConfirmText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const renderEmptyState = () => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Bell size={50} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You'll see notifications about orders, promotions, and account updates here.</Text>
        </ReAnimated.View>
    )

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
                    <Text style={styles.authText}>
                        Create an account or sign in to receive{"\n"}
                        notifications about your orders and updates
                    </Text>
                    <View style={styles.authButtons}>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push("/auth/login" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={() => router.push("/auth/register" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}

            <View style={styles.container}>
                {notifications.length > 0 ? (
                    <FlatList
                        data={notifications as any}
                        renderItem={renderNotificationItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.notificationsList}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.notificationSeparator} />}
                    />
                ) : (
                    renderEmptyState()
                )}
            </View>

            {renderOptionsModal()}
            {renderDeleteModal()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
    },
    unreadBadge: {
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 6,
    },
    unreadBadgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    headerAction: {
        padding: 4,
    },
    container: {
        flex: 1,
    },
    notificationsList: {
        padding: 16,
        paddingBottom: 100,
    },
    notificationCard: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#FAFAFA",
    },
    notificationCardUnread: {
        borderColor: "#6366F1",
        backgroundColor: "#F8FAFF",
    },
    notificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    notificationLeft: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6366F1",
    },
    notificationMessage: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    notificationSeparator: {
        height: 12,
    },
    // Options Modal
    optionsOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    optionsBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    optionsModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 40,
        minWidth: 250,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 16,
        textAlign: "center",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    optionText: {
        fontSize: 16,
        color: "#374151",
    },
    deleteOption: {
        backgroundColor: "#FEF2F2",
    },
    deleteOptionText: {
        color: "#EF4444",
    },
    // Delete Modal
    deleteOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 40,
        maxWidth: 320,
    },
    deleteTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 12,
        textAlign: "center",
    },
    deleteMessage: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    deleteActions: {
        flexDirection: "row",
        gap: 12,
    },
    deleteCancel: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    deleteCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    deleteConfirm: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        alignItems: "center",
    },
    deleteConfirmText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
    // Auth Required Styles
    authContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    authIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    authTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
        textAlign: "center",
    },
    authText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    authButtons: {
        width: "100%",
        gap: 12,
    },
    loginButton: {
        backgroundColor: "#6366F1",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    signupButton: {
        backgroundColor: "#F9FAFB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    signupButtonText: {
        color: "#374151",
        fontSize: 16,
        fontWeight: "600",
    },
})

