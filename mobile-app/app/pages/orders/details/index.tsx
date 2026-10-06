"use client"

import { useAuth } from "@/hooks/useAuth"
import { formatMoney, getProductImage } from "@/lib/catalog"
import { useOrdersStore } from "@/store/orders"
import type { Order, OrderItem, OrderStatus } from "@/types/order"
import type { Address } from "@/types/user"
import { router, useLocalSearchParams } from "expo-router"
import {
    ArrowLeft,
    Banknote,
    CheckCircle,
    ChevronRight,
    Clock,
    CreditCard,
    MapPin,
    Package,
    Star,
    Truck,
    XCircle,
} from "lucide-react-native"
import { useEffect } from "react"
import {
    ActivityIndicator,
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const progressSteps = [
    { status: "pending", title: "Placed", icon: Package },
    { status: "processing", title: "Processing", icon: Clock },
    { status: "completed", title: "Prepared", icon: CheckCircle },
    { status: "delivered", title: "Delivered", icon: Truck },
]

const statusOrder = ["pending", "processing", "completed", "delivered"]

const getCurrentStepIndex = (status: OrderStatus) => statusOrder.indexOf(status)

const getAddressText = (address?: Address | string) => {
    if (!address || typeof address === "string") return "No address attached"
    return [address.address, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ")
}

const getStatusColors = (status: OrderStatus) => {
    if (status === "pending") return { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" }
    if (status === "processing") return { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" }
    if (status === "completed") return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" }
    if (status === "delivered") return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" }
    if (status === "canceled") return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" }
    return { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" }
}

const getPaymentIcon = (method: string) => (method === "payment-on-delivery" ? Banknote : CreditCard)

const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })

const getItemTotal = (item: OrderItem) => (item.price || item.product.price) * item.quantity

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams()
    const { isAuthenticated } = useAuth()
    const { selectedOrder, fetchOrderById, isLoading } = useOrdersStore()

    useEffect(() => {
        if (id) fetchOrderById(String(id))
    }, [fetchOrderById, id])

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Header />
                <View style={styles.stateContainer}>
                    <Package size={44} color="#BDBDBD" />
                    <Text style={styles.stateTitle}>Sign in required</Text>
                    <Text style={styles.stateText}>Please login to view order details.</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (isLoading || !selectedOrder) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Header />
                <View style={styles.stateContainer}>
                    <ActivityIndicator color="#2463eb" />
                    <Text style={styles.stateText}>Loading order...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return <OrderDetailsContent order={selectedOrder} />
}

function OrderDetailsContent({ order }: { order: Order }) {
    const isCanceled = order.status === "canceled"
    const isDelivered = order.status === "delivered"
    const currentIndex = getCurrentStepIndex(order.status)
    const statusColors = getStatusColors(order.status)
    const PaymentIcon = getPaymentIcon(order.paymentMethod)

    const goToRating = (productId?: string) => {
        router.push({
            pathname: "/pages/reviews" as any,
            params: {
                orderId: order._id,
                productId,
            } as any,
        })
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <View style={styles.heroIcon}>
                            {isCanceled ? <XCircle size={24} color="#B91C1C" /> : <Package size={24} color="#2463eb" />}
                        </View>
                        <View style={styles.heroInfo}>
                            <Text style={styles.orderNumber}>Order #{order._id.slice(-8).toUpperCase()}</Text>
                            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
                            <Text style={[styles.statusText, { color: statusColors.text }]}>{order.status}</Text>
                        </View>
                    </View>

                    <View style={styles.totalPanel}>
                        <Text style={styles.heroTotalLabel}>Total paid</Text>
                        <Text style={styles.heroTotalValue}>{formatMoney(order.totalAmount)}</Text>
                        <View style={[styles.paymentBadge, order.paymentStatus === "paid" ? styles.paymentBadgePaid : styles.paymentBadgePending]}>
                            <Text style={[styles.paymentBadgeText, order.paymentStatus === "paid" ? styles.paymentBadgeTextPaid : styles.paymentBadgeTextPending]}>
                                {order.paymentStatus === "paid" ? "Payment confirmed" : "Payment pending"}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(130).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>{isCanceled ? "Order status" : "Order progress"}</Text>
                        {!isCanceled ? <Text style={styles.sectionHint}>{Math.max(currentIndex + 1, 1)} of {progressSteps.length}</Text> : null}
                    </View>

                    {isCanceled ? (
                        <View style={styles.cancelPanel}>
                            <View style={[styles.progressIcon, styles.progressIconCanceled]}>
                                <XCircle size={18} color="#fff" />
                            </View>
                            <View style={styles.progressTextBlock}>
                                <Text style={styles.progressTitleActive}>Order canceled</Text>
                                <Text style={styles.progressDescription}>{order.canceledReason || "This order was canceled."}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.progressGrid}>
                            <View style={styles.progressRail} />
                            {currentIndex > 0 ? (
                                <View
                                    style={[
                                        styles.progressRailActive,
                                        { width: `${(Math.min(currentIndex, progressSteps.length - 1) / (progressSteps.length - 1)) * 100}%` },
                                    ]}
                                />
                            ) : null}
                            {progressSteps.map((step, index) => {
                                const Icon = step.icon
                                const completed = index <= currentIndex
                                return (
                                    <View key={step.status} style={styles.progressStep}>
                                        <View style={[styles.progressIcon, completed ? styles.progressIconCompleted : styles.progressIconPending]}>
                                            <Icon size={17} color={completed ? "#fff" : "#9E9E9E"} />
                                        </View>
                                        <Text style={[styles.progressTitle, completed && styles.progressTitleActive]} numberOfLines={1}>
                                            {step.title}
                                        </Text>
                                    </View>
                                )
                            })}
                        </View>
                    )}
                </Animated.View>

                {isDelivered ? (
                    <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.ratePanel}>
                        <View style={styles.rateTextBlock}>
                            <Text style={styles.rateTitle}>How was your order?</Text>
                            <Text style={styles.rateText}>Rate the delivered products and help other shoppers choose well.</Text>
                        </View>
                        <TouchableOpacity style={styles.rateButton} onPress={() => goToRating()} activeOpacity={0.78}>
                            <Star size={17} color="#fff" fill="#fff" />
                            <Text style={styles.rateButtonText}>Rate products</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : null}

                <Animated.View entering={FadeInUp.delay(220).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.sectionTitle}>Products</Text>
                        <Text style={styles.sectionHint}>{order.products.length} item{order.products.length > 1 ? "s" : ""}</Text>
                    </View>
                    <FlatList
                        data={order.products}
                        keyExtractor={(item, index) => `${item.product._id}-${index}`}
                        scrollEnabled={false}
                        contentContainerStyle={styles.itemsContent}
                        renderItem={({ item }) => (
                            <View style={styles.orderItem}>
                                <Image source={{ uri: getProductImage(item.product) }} style={styles.itemImage} />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.product.title}</Text>
                                    <Text style={styles.itemMeta}>
                                        Qty {item.quantity}
                                        {item.chosenSize ? ` / ${item.chosenSize}` : ""}
                                        {item.chosenColor ? ` / ${item.chosenColor}` : ""}
                                    </Text>
                                    {isDelivered ? (
                                        <TouchableOpacity style={styles.itemRateButton} onPress={() => goToRating(item.product._id)} activeOpacity={0.75}>
                                            <Star size={14} color="#B45309" />
                                            <Text style={styles.itemRateText}>Rate item</Text>
                                            <ChevronRight size={14} color="#B45309" />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                                <Text style={styles.itemPrice}>{formatMoney(getItemTotal(item))}</Text>
                            </View>
                        )}
                    />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(270).springify()} style={styles.card}>
                    <Text style={styles.sectionTitlePadded}>Delivery & payment</Text>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <MapPin size={18} color="#2463eb" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Delivery address</Text>
                            <Text style={styles.infoValue}>{getAddressText(order.shippingAddress)}</Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIcon}>
                            <PaymentIcon size={18} color="#2463eb" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Payment</Text>
                            <Text style={styles.infoValue}>{order.paymentMethod.replaceAll("-", " ")} / {order.paymentStatus}</Text>
                        </View>
                    </View>
                    {order.shippingMethod ? (
                        <View style={styles.infoRow}>
                            <View style={styles.infoIcon}>
                                <Truck size={18} color="#2463eb" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Shipping method</Text>
                                <Text style={styles.infoValue}>{order.shippingMethod}</Text>
                            </View>
                        </View>
                    ) : null}
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(320).springify()} style={styles.card}>
                    <Text style={styles.sectionTitlePadded}>Payment summary</Text>
                    <View style={styles.totals}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>{formatMoney(order.subtotalAmount || order.totalAmount)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Shipping</Text>
                            <Text style={styles.totalValue}>{formatMoney(order.shippingAmount || 0)}</Text>
                        </View>
                        {order.discountAmount ? (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Discount</Text>
                                <Text style={styles.discountValue}>-{formatMoney(order.discountAmount)}</Text>
                            </View>
                        ) : null}
                        <View style={[styles.totalRow, styles.finalTotalRow]}>
                            <Text style={styles.finalTotalLabel}>Total</Text>
                            <Text style={styles.finalTotalValue}>{formatMoney(order.totalAmount)}</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    )
}

function Header() {
    return (
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.headerSpacer} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    stateContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 10 },
    stateTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A", textAlign: "center" },
    stateText: { fontSize: 14, fontWeight: "600", color: "#666", textAlign: "center", lineHeight: 20 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A" },
    headerSpacer: { width: 40 },
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 110 },
    heroCard: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 14, borderWidth: 1, borderColor: "#E0E0E0", overflow: "hidden" },
    heroTop: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
    heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
    heroInfo: { flex: 1, minWidth: 0 },
    orderNumber: { fontSize: 17, fontWeight: "800", color: "#1A1A1A", marginBottom: 3 },
    orderDate: { fontSize: 12, color: "#666", fontWeight: "600" },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
    totalPanel: { padding: 18, backgroundColor: "#F5F5F5", borderTopWidth: 1, borderTopColor: "#E0E0E0" },
    heroTotalLabel: { fontSize: 12, fontWeight: "800", color: "#666", textTransform: "uppercase", letterSpacing: 0.6 },
    heroTotalValue: { fontSize: 28, fontWeight: "900", color: "#1A1A1A", marginTop: 4, marginBottom: 12 },
    paymentBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    paymentBadgePaid: { backgroundColor: "#DCFCE7" },
    paymentBadgePending: { backgroundColor: "#FEF3C7" },
    paymentBadgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
    paymentBadgeTextPaid: { color: "#047857" },
    paymentBadgeTextPending: { color: "#B45309" },
    card: { backgroundColor: "#fff", borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: "#E0E0E0", overflow: "hidden" },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
    sectionTitlePadded: { fontSize: 16, fontWeight: "800", color: "#1A1A1A", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    sectionHint: { fontSize: 12, fontWeight: "700", color: "#666" },
    progressGrid: { position: "relative", flexDirection: "row", paddingHorizontal: 12, paddingBottom: 18 },
    progressRail: { position: "absolute", left: 32, right: 32, top: 19, height: 2, borderRadius: 1, backgroundColor: "#E0E0E0" },
    progressRailActive: { position: "absolute", left: 32, top: 19, height: 2, borderRadius: 1, backgroundColor: "#9E9E9E" },
    progressStep: { flex: 1, alignItems: "center", gap: 8 },
    progressIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", borderWidth: 1, zIndex: 2 },
    progressIconCompleted: { backgroundColor: "#666", borderColor: "#666" },
    progressIconPending: { backgroundColor: "#fff", borderColor: "#E0E0E0" },
    progressIconCanceled: { backgroundColor: "#B91C1C", borderColor: "#B91C1C" },
    progressTitle: { fontSize: 11, fontWeight: "700", color: "#999", textAlign: "center" },
    progressTitleActive: { color: "#1A1A1A", fontWeight: "800" },
    progressDescription: { fontSize: 13, color: "#666", fontWeight: "600", lineHeight: 19 },
    progressTextBlock: { flex: 1 },
    cancelPanel: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
    ratePanel: { backgroundColor: "#F5F5F5", borderRadius: 18, marginBottom: 14, padding: 16, borderWidth: 1, borderColor: "#E0E0E0" },
    rateTextBlock: { marginBottom: 14 },
    rateTitle: { fontSize: 17, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 },
    rateText: { fontSize: 13, fontWeight: "600", color: "#666", lineHeight: 19 },
    rateButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#2463eb", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
    rateButtonText: { color: "#fff", fontSize: 14, fontWeight: "800" },
    itemsContent: { paddingHorizontal: 16, paddingBottom: 4 },
    orderItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#EEEEEE" },
    itemImage: { width: 62, height: 62, borderRadius: 14, backgroundColor: "#F5F5F5", marginRight: 12 },
    itemInfo: { flex: 1, minWidth: 0 },
    itemName: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginBottom: 4, lineHeight: 19 },
    itemMeta: { fontSize: 12, color: "#666", fontWeight: "600" },
    itemPrice: { fontSize: 14, fontWeight: "800", color: "#1A1A1A", marginLeft: 8 },
    itemRateButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, marginTop: 9, backgroundColor: "#FFFBEB", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: "#FDE68A" },
    itemRateText: { fontSize: 12, fontWeight: "800", color: "#B45309" },
    infoRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: 1, borderTopColor: "#EEEEEE" },
    infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
    infoContent: { marginLeft: 12, flex: 1 },
    infoLabel: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "800", marginBottom: 4 },
    infoValue: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", textTransform: "capitalize", lineHeight: 20 },
    totals: { paddingHorizontal: 16, paddingBottom: 16 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
    totalLabel: { fontSize: 14, color: "#666", fontWeight: "600" },
    totalValue: { fontSize: 14, color: "#1A1A1A", fontWeight: "700" },
    discountValue: { fontSize: 14, color: "#047857", fontWeight: "800" },
    finalTotalRow: { borderTopWidth: 1, borderTopColor: "#E0E0E0", paddingTop: 14, marginTop: 14 },
    finalTotalLabel: { fontSize: 16, fontWeight: "800", color: "#1A1A1A" },
    finalTotalValue: { fontSize: 20, fontWeight: "900", color: "#2463eb" },
})
