"use client"

import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { formatMoney, getProductImage, getUserId } from "@/lib/catalog"
import { useOrdersStore } from "@/store/orders"
import type { OrderItem } from "@/types/order"
import type { ProductRating } from "@/types/product"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, CheckCircle, Package, Star } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

type RateableItem = OrderItem & { orderId: string; orderedAt: string }

const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very good",
    5: "Excellent",
}

const getRatingUserId = (rating: ProductRating) => {
    if (typeof rating.user === "string") return rating.user
    return rating.user?._id || rating.user?.id || ""
}

const formatOrderDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" })

export default function ReviewsScreen() {
    const { orderId, productId } = useLocalSearchParams<{ orderId?: string; productId?: string }>()
    const { user, isAuthenticated } = useAuth()
    const { orders, fetchOrders, isLoading } = useOrdersStore()
    const [ratings, setRatings] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [savedProducts, setSavedProducts] = useState<Record<string, boolean>>({})

    const userId = getUserId(user)

    useEffect(() => {
        if (isAuthenticated) fetchOrders(user)
    }, [fetchOrders, isAuthenticated, user, user?._id, user?.id])

    const rateableItems = useMemo<RateableItem[]>(() => {
        const deliveredItems = orders
            .filter((order) => order.status === "delivered")
            .flatMap((order) => order.products.map((item) => ({ ...item, orderId: order._id, orderedAt: order.createdAt })))
            .filter((item) => (!orderId || item.orderId === orderId) && (!productId || item.product._id === productId))

        const uniqueItems = new Map<string, RateableItem>()
        deliveredItems.forEach((item) => {
            if (!uniqueItems.has(item.product._id)) {
                uniqueItems.set(item.product._id, item)
            }
        })

        return [...uniqueItems.values()]
    }, [orderId, orders, productId])

    const getExistingRating = (item: RateableItem) =>
        item.product.ratings?.find((rating) => getRatingUserId(rating) === userId)?.rating || 0

    useEffect(() => {
        if (!userId || rateableItems.length === 0) return

        const nextRatings: Record<string, number> = {}
        const nextSaved: Record<string, boolean> = {}
        rateableItems.forEach((item) => {
            const existingRating = getExistingRating(item)
            if (existingRating) {
                nextRatings[item.product._id] = existingRating
                nextSaved[item.product._id] = true
            }
        })

        if (Object.keys(nextRatings).length || Object.keys(nextSaved).length) {
            setRatings((prev) => ({ ...nextRatings, ...prev }))
            setSavedProducts((prev) => ({ ...nextSaved, ...prev }))
        }
    }, [rateableItems, userId])

    const submitRating = async (item: RateableItem) => {
        const rating = ratings[item.product._id] || 0
        if (!rating) {
            Alert.alert("Select Rating", "Please select a star rating before submitting.")
            return
        }

        if (!userId) {
            Alert.alert("Sign in required", "Please sign in before rating this product.")
            return
        }

        try {
            setSubmitting(item.product._id)
            await api.put(`/product/rattings/${item.product._id}`, {
                userId,
                rating,
            })
            setSavedProducts((prev) => ({ ...prev, [item.product._id]: true }))
            Alert.alert("Rating Saved", "Thanks for rating this product.")
        } catch (error: any) {
            Alert.alert("Rating Failed", error.response?.data?.message || "Unable to submit rating.")
        } finally {
            setSubmitting(null)
        }
    }

    const renderStars = (productId: string) => {
        const selectedRating = ratings[productId] || 0
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                        key={rating}
                        style={styles.starButton}
                        onPress={() => setRatings((prev) => ({ ...prev, [productId]: rating }))}
                        activeOpacity={0.72}
                    >
                        <Star size={28} color="#F59E0B" fill={rating <= selectedRating ? "#F59E0B" : "transparent"} />
                    </TouchableOpacity>
                ))}
            </View>
        )
    }

    const renderItem = ({ item, index }: { item: RateableItem; index: number }) => {
        const selectedRating = ratings[item.product._id] || 0
        const saved = savedProducts[item.product._id]
        const isSubmitting = submitting === item.product._id

        return (
            <Animated.View entering={FadeInUp.delay(index * 55).springify()} style={styles.reviewCard}>
                <Image source={{ uri: getProductImage(item.product) }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.productTextBlock}>
                            <Text style={styles.productTitle} numberOfLines={2}>{item.product.title}</Text>
                            <Text style={styles.productMeta}>
                                Order #{item.orderId.slice(-6).toUpperCase()} / {formatOrderDate(item.orderedAt)} / {formatMoney((item.price || item.product.price) * item.quantity)}
                            </Text>
                        </View>
                        {saved ? (
                            <View style={styles.savedBadge}>
                                <CheckCircle size={13} color="#047857" />
                                <Text style={styles.savedBadgeText}>Rated</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.ratingBlock}>
                        {renderStars(item.product._id)}
                        <Text style={styles.ratingHint}>{selectedRating ? ratingLabels[selectedRating] : "Tap a star to rate"}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, (!selectedRating || isSubmitting) && styles.submitButtonDisabled]}
                        onPress={() => submitRating(item)}
                        disabled={!selectedRating || isSubmitting}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : null}
                        <Text style={styles.submitButtonText}>
                            {isSubmitting ? "Saving..." : saved ? "Update Rating" : "Submit Rating"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    }

    const renderLoadingState = () => (
        <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#2463eb" />
            <Text style={styles.stateText}>Loading products to review...</Text>
        </View>
    )

    const renderEmptyState = () => (
        <View style={styles.stateContainer}>
            <View style={styles.stateIcon}>
                        <Package size={42} color="#9E9E9E" />
            </View>
            <Text style={styles.stateTitle}>No products to rate</Text>
            <Text style={styles.stateText}>Delivered products will appear here after your order is completed.</Text>
        </View>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Header />
                <View style={styles.stateContainer}>
                    <View style={styles.stateIcon}>
                        <Star size={42} color="#9E9E9E" />
                    </View>
                    <Text style={styles.stateTitle}>Sign in to rate products</Text>
                    <Text style={styles.stateText}>Ratings are linked to your account and previous purchases.</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Header />

            <FlatList
                data={rateableItems}
                renderItem={renderItem}
                keyExtractor={(item) => `${item.orderId}-${item.product._id}`}
                contentContainerStyle={styles.listContent}
                refreshing={isLoading}
                onRefresh={() => fetchOrders(user)}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Animated.View entering={FadeInDown.delay(90).springify()} style={styles.introCard}>
                        <Text style={styles.introTitle}>{productId ? "Rate this product" : "Rate delivered products"}</Text>
                        <Text style={styles.introText}>Your rating updates the product rating shown across the store.</Text>
                    </Animated.View>
                }
                ListEmptyComponent={isLoading ? renderLoadingState() : renderEmptyState()}
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
            <Text style={styles.headerTitle}>Reviews & Ratings</Text>
            <View style={styles.headerSpacer} />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 19, fontWeight: "700", color: "#1A1A1A" },
    headerSpacer: { width: 40 },
    listContent: { padding: 16, paddingBottom: 110, flexGrow: 1 },
    introCard: { backgroundColor: "#F5F5F5", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#E0E0E0" },
    introTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 },
    introText: { fontSize: 13, fontWeight: "600", color: "#666", lineHeight: 19 },
    reviewCard: { backgroundColor: "#fff", borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#E0E0E0" },
    productImage: { width: "100%", height: 150, borderRadius: 14, backgroundColor: "#F5F5F5", marginBottom: 12 },
    productInfo: { flex: 1 },
    cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    productTextBlock: { flex: 1, minWidth: 0 },
    productTitle: { fontSize: 16, fontWeight: "800", color: "#1A1A1A", lineHeight: 21, marginBottom: 5 },
    productMeta: { fontSize: 12, color: "#666", fontWeight: "600", lineHeight: 18 },
    savedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, borderWidth: 1, borderColor: "#A7F3D0" },
    savedBadgeText: { fontSize: 11, fontWeight: "800", color: "#047857" },
    ratingBlock: { marginTop: 14, marginBottom: 13 },
    starsRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    starButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
    ratingHint: { marginTop: 6, fontSize: 13, fontWeight: "700", color: "#666" },
    submitButton: { minHeight: 46, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#2463eb" },
    submitButtonDisabled: { backgroundColor: "#9E9E9E" },
    submitButtonText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    stateContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34, paddingTop: 40 },
    stateIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", marginBottom: 18 },
    stateTitle: { fontSize: 21, fontWeight: "800", color: "#1A1A1A", marginBottom: 8, textAlign: "center" },
    stateText: { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 21, fontWeight: "600" },
})
