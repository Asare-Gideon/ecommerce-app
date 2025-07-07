"use client"

import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import { ArrowLeft, Banknote, CheckCircle, Clock, CreditCard, Eye, Package, XCircle } from "lucide-react-native"
import { useRef, useState } from "react"
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

const { width } = Dimensions.get("window")

// Mock orders data matching your schema
const MOCK_ORDERS = {
    ongoing: [
        {
            _id: "ORD-001",
            user: "user123",
            products: [
                {
                    product: {
                        _id: "prod1",
                        title: "Wireless Headphones",
                        images: ["https://via.placeholder.com/60x60/6366F1/fff?text=WH"],
                        price: 199.99,
                    },
                    quantity: 1,
                    chosenColors: ["Black"],
                },
                {
                    product: {
                        _id: "prod2",
                        title: "Phone Case Premium",
                        images: ["https://via.placeholder.com/60x60/10B981/fff?text=PC"],
                        price: 29.99,
                    },
                    quantity: 2,
                    chosenColors: ["Blue"],
                },
            ],
            totalAmount: 259.97,
            status: "processing",
            paymentMethod: "card",
            paymentStatus: "paid",
            createdAt: "2024-01-15T10:30:00Z",
            transactionId: "TXN123456",
        },
        {
            _id: "ORD-002",
            user: "user123",
            products: [
                {
                    product: {
                        _id: "prod3",
                        title: "Bluetooth Speaker",
                        images: ["https://via.placeholder.com/60x60/F59E0B/fff?text=BS"],
                        price: 149.99,
                    },
                    quantity: 1,
                    chosenColors: ["Red"],
                },
            ],
            totalAmount: 149.99,
            status: "pending",
            paymentMethod: "cash",
            paymentStatus: "pending",
            createdAt: "2024-01-14T15:20:00Z",
        },
    ],
    completed: [
        {
            _id: "ORD-003",
            user: "user123",
            products: [
                {
                    product: {
                        _id: "prod4",
                        title: "USB-C Cable",
                        images: ["https://via.placeholder.com/60x60/8B5CF6/fff?text=UC"],
                        price: 19.99,
                    },
                    quantity: 2,
                    chosenColors: ["White"],
                },
                {
                    product: {
                        _id: "prod5",
                        title: "Power Bank 10000mAh",
                        images: ["https://via.placeholder.com/60x60/EF4444/fff?text=PB"],
                        price: 49.99,
                    },
                    quantity: 1,
                    chosenColors: ["Black"],
                },
            ],
            totalAmount: 89.97,
            status: "delivered",
            paymentMethod: "card",
            paymentStatus: "paid",
            createdAt: "2024-01-10T09:15:00Z",
            deliveredAt: "2024-01-12T14:30:00Z",
        },
    ],
    cancelled: [
        {
            _id: "ORD-004",
            user: "user123",
            products: [
                {
                    product: {
                        _id: "prod6",
                        title: "Smart Watch Series 5",
                        images: ["https://via.placeholder.com/60x60/6B7280/fff?text=SW"],
                        price: 199.99,
                    },
                    quantity: 1,
                    chosenColors: ["Silver"],
                },
            ],
            totalAmount: 199.99,
            status: "canceled",
            paymentMethod: "card",
            paymentStatus: "refunded",
            createdAt: "2024-01-08T11:45:00Z",
            canceledReason: "Requested by customer",
        },
    ],
}

type OrderStatus = "pending" | "processing" | "completed" | "delivered" | "canceled"
type TabType = "ongoing" | "completed" | "cancelled"

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case "pending":
            return <Clock size={14} color="#F59E0B" />
        case "processing":
            return <Package size={14} color="#6366F1" />
        case "completed":
        case "delivered":
            return <CheckCircle size={14} color="#10B981" />
        case "canceled":
            return <XCircle size={14} color="#EF4444" />
        default:
            return <Package size={14} color="#6B7280" />
    }
}

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case "pending":
            return "#F59E0B"
        case "processing":
            return "#6366F1"
        case "completed":
        case "delivered":
            return "#10B981"
        case "canceled":
            return "#EF4444"
        default:
            return "#6B7280"
    }
}

const getStatusBackground = (status: OrderStatus) => {
    switch (status) {
        case "pending":
            return "#FFFBEB"
        case "processing":
            return "#EEF2FF"
        case "completed":
        case "delivered":
            return "#ECFDF5"
        case "canceled":
            return "#FEF2F2"
        default:
            return "#F9FAFB"
    }
}

const getPaymentIcon = (method: string) => {
    switch (method) {
        case "card":
            return <CreditCard size={12} color="#6B7280" />
        case "cash":
            return <Banknote size={12} color="#6B7280" />
        default:
            return <CreditCard size={12} color="#6B7280" />
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

const getProductsTitle = (products: any[]) => {
    if (products.length === 0) return ""
    const firstProduct = products[0].product.title
    const remainingCount = products.length - 1

    if (remainingCount === 0) {
        return firstProduct.length > 25 ? `${firstProduct.substring(0, 25)}...` : firstProduct
    }

    const truncatedTitle = firstProduct.length > 20 ? `${firstProduct.substring(0, 20)}...` : firstProduct
    return `${truncatedTitle} +${remainingCount} more`
}

export default function OrdersScreen() {
    const { isAuthenticated, isLoading } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>("ongoing")
    const translateX = useSharedValue(0)
    const scrollViewRef = useRef<ScrollView>(null)

    const tabs: { key: TabType; label: string }[] = [
        { key: "ongoing", label: "Ongoing" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ]

    const tabIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        width: (width - 48) / 3,
    }))

    const handleTabPress = (tab: TabType, index: number) => {
        setActiveTab(tab)
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true })
        const tabWidth = (width - 48) / 3
        translateX.value = withSpring(index * tabWidth, {
            damping: 20,
            stiffness: 200,
        })
    }

    const handleViewOrder = (orderId: string) => {
        router.push("/pages/orders/details" as any)
        console.log("View order:", orderId)
    }

    const renderOrderItem = ({ item }: { item: any }) => (
        <Animated.View entering={FadeInUp.springify()} style={styles.orderCard}>
            {/* Header Row */}
            <View style={styles.orderHeader}>
                <View style={styles.orderMeta}>
                    <Text style={styles.orderNumber}>#{item._id.slice(-6).toUpperCase()}</Text>
                    <View style={styles.orderDetails}>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                        <View style={styles.dot} />
                        <View style={styles.paymentInfo}>
                            {getPaymentIcon(item.paymentMethod)}
                            <Text style={styles.paymentText}>{item.paymentMethod.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
                    {getStatusIcon(item.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Products Row */}
            <View style={styles.productsRow}>
                <View style={styles.productImages}>
                    {item.products.slice(0, 3).map((productItem: any, index: number) => (
                        <View key={productItem.product._id} style={[styles.productImageContainer, { zIndex: 3 - index }]}>
                            <Image
                                source={{ uri: productItem.product.images[0] }}
                                style={styles.productImage}
                                defaultSource={{
                                    uri: `https://via.placeholder.com/40x40/F3F4F6/9CA3AF?text=${productItem.product.title.charAt(0)}`,
                                }}
                            />
                        </View>
                    ))}
                    {item.products.length > 3 && (
                        <View style={styles.moreProductsIndicator}>
                            <Text style={styles.moreProductsText}>+{item.products.length - 3}</Text>
                        </View>
                    )}
                    <View style={styles.productTitleContainer}>
                        <Text style={styles.productTitle} numberOfLines={1}>
                            {getProductsTitle(item.products)}
                        </Text>
                        <Text >
                            {item.products.length} item{item.products.length > 1 ? "s" : ""}
                        </Text>
                    </View>
                </View>
                <View style={styles.productSummary}>
                    <Text >${item.totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {/* Footer Row */}
            <View style={styles.orderFooter}>
                {item.deliveredAt && <Text style={styles.deliveryText}>Delivered {formatDate(item.deliveredAt)}</Text>}
                {item.canceledReason && <Text style={styles.cancelText}>{item.canceledReason}</Text>}
                <TouchableOpacity style={styles.viewButton} onPress={() => handleViewOrder(item._id)} activeOpacity={0.7}>
                    <Eye size={14} color="#6366F1" />
                    <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )

    const renderEmptyState = (tab: TabType) => (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Package size={50} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No {tab} orders</Text>
            <Text style={styles.emptyText}>
                {tab === "ongoing"
                    ? "You don't have any ongoing orders"
                    : tab === "completed"
                        ? "You haven't completed any orders yet"
                        : "You don't have any cancelled orders"}
            </Text>
            {tab === "ongoing" && (
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")} activeOpacity={0.8}>
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    )

    const renderAuthRequired = () => (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
            <View style={styles.authIconContainer}>
                <Package size={60} color="#6366F1" strokeWidth={1.5} />
            </View>
            <Text style={styles.authTitle}>Sign in to view your orders</Text>
            <Text style={styles.authText}>
                Create an account or sign in to track your orders{"\n"}
                and view your order history
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
        </Animated.View>
    )

    if (!isLoading && !isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <View style={styles.headerSpacer} />
                </Animated.View>
                {renderAuthRequired()}
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            {/* Modern Tab Bar */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.tabContainer}>
                <View style={styles.tabBar}>
                    {tabs.map((tab, index) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={styles.tab}
                            onPress={() => handleTabPress(tab.key, index)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
            </Animated.View>

            {/* Content */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width)
                    const newTab = tabs[index]?.key
                    if (newTab && newTab !== activeTab) {
                        setActiveTab(newTab)
                        const tabWidth = (width - 48) / 3
                        translateX.value = withSpring(index * tabWidth, {
                            damping: 20,
                            stiffness: 200,
                        })
                    }
                }}
                style={styles.contentContainer}
            >
                {tabs.map((tab) => (
                    <View key={tab.key} style={styles.tabContent}>
                        {MOCK_ORDERS[tab.key].length > 0 ? (
                            <FlatList
                                data={MOCK_ORDERS[tab.key]}
                                renderItem={renderOrderItem}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={styles.ordersList}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <View style={styles.orderSeparator} />}
                            />
                        ) : (
                            renderEmptyState(tab.key)
                        )}
                    </View>
                ))}
            </ScrollView>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
    },
    headerSpacer: {
        width: 32,
    },
    // Modern Tab Styles
    tabContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingBottom: 8,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    tabBar: {
        flexDirection: "row",
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
        position: "relative",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#9CA3AF",
        letterSpacing: 0.2,
    },
    activeTabText: {
        color: "#1F2937",
        fontWeight: "600",
    },
    tabIndicator: {
        position: "absolute",
        bottom: 0,
        left: 24,
        height: 3,
        backgroundColor: "#6366F1",
        borderRadius: 2,
        zIndex: 1,
    },
    contentContainer: {
        flex: 1,
        marginTop: 8,
    },
    tabContent: {
        width: width,
        flex: 1,
    },
    ordersList: {
        padding: 16,
        paddingBottom: 100,
    },
    // Compact Order Card Styles
    orderCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    orderMeta: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    orderDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    orderDate: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#D1D5DB",
    },
    paymentInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    paymentText: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    productsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    productImages: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    productImageContainer: {
        marginRight: -8,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: "#fff",
    },
    productImage: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#F3F4F6",
    },
    moreProductsIndicator: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
        marginLeft: -8,
    },
    moreProductsText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#6B7280",
    },
    productSummary: {
        alignItems: "flex-end",
    },
    productTitle: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "500",
        marginBottom: 2,
    },
    orderFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    deliveryText: {
        fontSize: 12,
        color: "#10B981",
        fontWeight: "500",
        flex: 1,
    },
    cancelText: {
        fontSize: 12,
        color: "#EF4444",
        fontWeight: "500",
        flex: 1,
    },
    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#EEF2FF",
        borderRadius: 6,
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6366F1",
    },
    orderSeparator: {
        height: 12,
    },
    // Empty State Styles
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        paddingTop: 60,
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
        marginBottom: 28,
    },
    shopButton: {
        backgroundColor: "#6366F1",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    shopButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
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
    productTitleContainer: {
        marginLeft: 12,
        flex: 1,
    },
})

