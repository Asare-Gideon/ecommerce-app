"use client"

import { useAuth } from "@/hooks/useAuth"
import { formatMoney, getProductImage } from "@/lib/catalog"
import { useOrdersStore } from "@/store/orders"
import type { Order, OrderStatus } from "@/types/order"
import { router } from "expo-router"
import { ArrowLeft, Banknote, CheckCircle, Clock, CreditCard, ChevronRight, Package, Search, XCircle } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Image, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

type FilterType = "all" | OrderStatus | "paid" | "unpaid"

const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "delivered", label: "Delivered" },
    { key: "paid", label: "Paid" },
    { key: "unpaid", label: "Unpaid" },
    { key: "canceled", label: "Canceled" },
]

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case "pending":
            return <Clock size={12} color="#D97706" />
        case "processing":
            return <Package size={12} color="#4F46E5" />
        case "completed":
        case "delivered":
            return <CheckCircle size={12} color="#059669" />
        case "canceled":
            return <XCircle size={12} color="#DC2626" />
        default:
            return <Package size={12} color="#4B5563" />
    }
}

const getStatusColor = (status: OrderStatus) => {
    if (status === "pending") return "#D97706"
    if (status === "processing") return "#4F46E5"
    if (status === "completed" || status === "delivered") return "#059669"
    if (status === "canceled") return "#DC2626"
    return "#4B5563"
}

const getStatusBackground = (status: OrderStatus) => {
    if (status === "pending") return "#FEF3C7"
    if (status === "processing") return "#EEF2FF"
    if (status === "completed" || status === "delivered") return "#D1FAE5"
    if (status === "canceled") return "#FEE2E2"
    return "#F3F4F6"
}

const getPaymentIcon = (method: string) =>
    method === "payment-on-delivery" ? <Banknote size={12} color="#6B7280" /> : <CreditCard size={12} color="#6B7280" />

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const getProductsTitle = (order: Order) => {
    const firstProduct = order.products[0]?.product
    if (!firstProduct) return "Order items"
    const remaining = order.products.length - 1
    return remaining > 0 ? `${firstProduct.title} +${remaining} more` : firstProduct.title
}

const getOrderSortRank = (status: OrderStatus) => {
    if (status === "delivered") return 2
    if (status === "canceled") return 1
    return 0
}

export default function OrdersScreen() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const { orders, fetchOrders, isLoading: ordersLoading } = useOrdersStore()
    const [activeFilter, setActiveFilter] = useState<FilterType>("all")

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders(user)
        }
    }, [fetchOrders, isAuthenticated, user, user?._id, user?.id])

    const sortedOrders = useMemo(
        () =>
            [...orders].sort((a, b) => {
                const statusRank = getOrderSortRank(a.status) - getOrderSortRank(b.status)
                if (statusRank !== 0) return statusRank
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }),
        [orders],
    )

    const filteredOrders = useMemo(() => {
        if (activeFilter === "all") return sortedOrders
        if (activeFilter === "paid") return sortedOrders.filter((order) => order.paymentStatus === "paid")
        if (activeFilter === "unpaid") return sortedOrders.filter((order) => order.paymentStatus !== "paid")
        return sortedOrders.filter((order) => order.status === activeFilter)
    }, [activeFilter, sortedOrders])

    const handleViewOrder = (orderId: string) => {
        router.push({ pathname: "/pages/orders/details" as any, params: { id: orderId } as any })
    }

    const renderOrderItem = ({ item, index }: { item: Order; index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 35).springify()} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderMeta}>
                    <Text style={styles.orderNumber}>#{item._id.slice(-6).toUpperCase()}</Text>
                    <View style={styles.orderDetails}>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                        <View style={styles.dot} />
                        <View style={styles.paymentInfo}>
                            {getPaymentIcon(item.paymentMethod)}
                            <Text style={styles.paymentText}>{item.paymentMethod.replaceAll("-", " ").toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(item.status) }]}>
                    {getStatusIcon(item.status)}
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.productsRow}>
                <View style={styles.productImages}>
                    {item.products.slice(0, 3).map((productItem, index) => (
                        <View key={`${productItem.product._id}-${index}`} style={[styles.productImageContainer, { zIndex: 3 - index }]}>
                            <Image source={{ uri: getProductImage(productItem.product) }} style={styles.productImage} />
                        </View>
                    ))}
                    {item.products.length > 3 && (
                        <View style={styles.moreProductsIndicator}>
                            <Text style={styles.moreProductsText}>+{item.products.length - 3}</Text>
                        </View>
                    )}
                    <View style={styles.productTitleContainer}>
                        <Text style={styles.productTitle} numberOfLines={1}>{getProductsTitle(item)}</Text>
                        <Text style={styles.productCount}>{item.products.length} item{item.products.length > 1 ? "s" : ""}</Text>
                    </View>
                </View>
                <Text style={styles.orderAmount}>{formatMoney(item.totalAmount)}</Text>
            </View>

            <View style={styles.orderFooter}>
                <View style={[styles.paymentPill, item.paymentStatus === "paid" ? styles.paymentPillPaid : styles.paymentPillPending]}>
                    <Text style={[styles.paymentStatus, item.paymentStatus === "paid" ? styles.paymentStatusPaid : styles.paymentStatusPending]}>
                        {item.paymentStatus === "paid" ? "Paid" : "Payment pending"}
                    </Text>
                </View>
                <TouchableOpacity style={styles.viewButton} onPress={() => handleViewOrder(item._id)} activeOpacity={0.7}>
                    <Text style={styles.viewButtonText}>View Order</Text>
                    <ChevronRight size={14} color="#2463eb" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )

    const renderFilters = () => (
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
                {filters.map((filter) => {
                    const active = activeFilter === filter.key
                    return (
                        <TouchableOpacity key={filter.key} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setActiveFilter(filter.key)} activeOpacity={0.8}>
                            <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{filter.label}</Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
        </Animated.View>
    )

    const renderEmptyState = () => (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Search size={50} color="#2463eb" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No matching orders</Text>
            <Text style={styles.emptyText}>Try another filter or start shopping.</Text>
            {activeFilter === "all" && (
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/" as any)} activeOpacity={0.8}>
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    )

    const renderLoadingState = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2463eb" />
            <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
    )

    if (!isLoading && !isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Header />
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                <Package size={50} color="#2463eb" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Sign in to view your orders</Text>
                    <Text style={styles.authText}>Track orders and view your purchase history.</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login" as any)}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            {renderFilters()}

            <FlatList
                data={filteredOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.ordersList}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={ordersLoading} onRefresh={() => fetchOrders(user)} />}
                ListEmptyComponent={ordersLoading ? renderLoadingState() : renderEmptyState()}
                ItemSeparatorComponent={() => <View style={styles.orderSeparator} />}
            />
        </SafeAreaView>
    )
}

function Header() {
    return (
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={styles.headerSpacer} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", letterSpacing: 0 },
    headerSpacer: { width: 40 },
    filterSection: { backgroundColor: "#FFFFFF" },
    filterList: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: "#F5F5F5", borderWidth: 1, borderColor: "#E0E0E0" },
    filterChipActive: { backgroundColor: "#2463eb" },
    filterChipText: { fontSize: 13, fontWeight: "600", color: "#666" },
    filterChipTextActive: { color: "#fff" },
    ordersList: { padding: 16, paddingBottom: 100, flexGrow: 1 },
    orderCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E0E0E0" },
    orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    orderMeta: { flex: 1 },
    orderNumber: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
    orderDetails: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    orderDate: { fontSize: 13, color: "#666", fontWeight: "500" },
    dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#BDBDBD" },
    paymentInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
    paymentText: { fontSize: 11, color: "#666", fontWeight: "600" },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    productsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    productImages: { flexDirection: "row", alignItems: "center", flex: 1 },
    productImageContainer: { marginRight: -10, borderRadius: 12, borderWidth: 2, borderColor: "#fff" },
    productImage: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F3F4F6" },
    moreProductsIndicator: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff", marginLeft: -10 },
    moreProductsText: { fontSize: 11, fontWeight: "700", color: "#666" },
    productTitleContainer: { marginLeft: 16, flex: 1 },
    productTitle: { fontSize: 14, color: "#1A1A1A", fontWeight: "600", marginBottom: 2 },
    productCount: { fontSize: 12, color: "#666", fontWeight: "500" },
    orderAmount: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
    orderFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTopWidth: 1, borderTopColor: "#EEEEEE" },
    paymentPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
    paymentPillPaid: { backgroundColor: "#ECFDF5" },
    paymentPillPending: { backgroundColor: "#FFFBEB" },
    paymentStatus: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
    paymentStatusPaid: { color: "#047857" },
    paymentStatusPending: { color: "#D97706" },
    viewButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#F5F5F5", borderRadius: 8 },
    viewButtonText: { fontSize: 12, fontWeight: "700", color: "#2463eb" },
    orderSeparator: { height: 12 },
    emptyContainer: { justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 80 },
    emptyIconContainer: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center", marginBottom: 24 },
    emptyTitle: { fontSize: 22, fontWeight: "700", color: "#1A1A1A", marginBottom: 8, textAlign: "center", letterSpacing: 0 },
    emptyText: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22, marginBottom: 32 },
    loadingContainer: { justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 120, gap: 12 },
    loadingText: { color: "#666", fontSize: 14, fontWeight: "600" },
    shopButton: { backgroundColor: "#2463eb", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
    shopButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    authContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, gap: 16, backgroundColor: "#fff" },
    authIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F5F5F5", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    authTitle: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", textAlign: "center", letterSpacing: 0 },
    authText: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22, marginBottom: 10 },
    loginButton: { backgroundColor: "#2463eb", paddingVertical: 14, paddingHorizontal: 36, borderRadius: 12, marginTop: 10 },
    loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
