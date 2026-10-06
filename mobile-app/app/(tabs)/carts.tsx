"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { formatMoney, getProductImage, getProductPrice } from "@/lib/catalog"
import { useSettingsStore } from "@/store/settings"
import { router } from "expo-router"
import { Minus, Plus, ShieldCheck, ShoppingBag, ShoppingCart, Trash2, Truck, User, X } from "lucide-react-native"
import { useEffect } from "react"
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp, Layout, SlideOutRight } from "react-native-reanimated"

const { width } = Dimensions.get("window")

export default function CartScreen() {
    const { isAuthenticated, isLoading } = useAuth()
    const { items, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart()
    const { colors } = useTheme()
    const { shippingMethods, currency, fetchSettings } = useSettingsStore()

    const deliveryFee = Number(shippingMethods[0]?.amount || 0)
    const finalTotal = cartTotal + deliveryFee
    console.log("isAuthenticated", isAuthenticated)

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    // Show auth screen if not authenticated
    if (!isLoading && !isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <Text style={styles.headerTitle}>My cart</Text>
                </Animated.View>
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                        <User size={60} color={colors.primary} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Sign in to view your cart</Text>
                    <Text style={styles.authText}>
                        Create an account or sign in to save items{"\n"}
                        and access your cart across devices
                    </Text>
                    <View style={styles.authButtons}>
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: colors.primary }]}
                            onPress={() => router.push("/auth/login" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={() => router.push("/auth/signup" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        )
    }

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(productId)
        } else {
            updateQuantity(productId, newQuantity)
        }
    }

    const handleRemoveItem = (productId: string) => {
        const item = items.find((item) => item.product._id === productId)
        if (item) {
            Alert.alert("Remove Item", `Remove ${item.product.title} from cart?`, [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => removeFromCart(productId, item.product.title),
                },
            ])
        }
    }

    const handleCheckout = () => {
        router.push("/pages/checkout" as any)
    }

    const handleClearCart = () => {
        Alert.alert("Clear Cart", "Remove all items from your cart?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearCart },
        ])
    }

    const renderCartItem = ({ item, index }: { item: any; index: number }) => {
        const cartKey = item.cartKey || [item.product._id, item.selectedSize || "", item.selectedColor || ""].join(":")

        return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            exiting={SlideOutRight.springify()}
            layout={Layout.springify()}
            style={styles.cartItem}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: getProductImage(item.product) }}
                    style={styles.productImage}
                    defaultSource={{
                        uri: `https://via.placeholder.com/80x80/F3F4F6/9CA3AF?text=${encodeURIComponent(item.product.title.charAt(0))}`,
                    }}
                />
            </View>

            <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                    <View style={styles.productDetails}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.product.title}
                        </Text>
                        {(item.selectedColor || item.selectedSize) && (
                        <Text style={styles.productVariant}>
                                {[item.selectedColor, item.selectedSize].filter(Boolean).join(" / ")}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(cartKey)}
                        activeOpacity={0.7}
                    >
                        <X size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.productFooter}>
                    <View>
                        <Text style={styles.productPrice}>{formatMoney(getProductPrice(item.product) * item.quantity)}</Text>
                        <Text style={styles.unitPrice}>{formatMoney(getProductPrice(item.product))} each</Text>
                    </View>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(cartKey, item.quantity - 1)}
                            activeOpacity={0.7}
                        >
                            <Minus size={14} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={[styles.quantityButton, styles.quantityButtonPlus]}
                            onPress={() => handleQuantityChange(cartKey, item.quantity + 1)}
                            activeOpacity={0.7}
                        >
                            <Plus size={14} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
        )
    }

    const renderEmptyCart = () => (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <ShoppingCart size={50} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Add some products to get started</Text>
            <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")} activeOpacity={0.8}>

                <ShoppingBag size={18} color="#fff" style={styles.shopButtonIcon} />
                <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
        </Animated.View>
    )

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <Text style={styles.headerSubtitle}>{cartCount} item{cartCount === 1 ? "" : "s"}</Text>
                </Animated.View>
                {renderEmptyCart()}
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <Text style={styles.headerSubtitle}>{cartCount} item{cartCount === 1 ? "" : "s"} ready for checkout</Text>
                </View>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearCart} activeOpacity={0.8}>
                    <Trash2 size={16} color="#DC2626" />
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.cartHero}>
                <View style={styles.cartHeroIcon}>
                    <Truck size={22} color="#4F46E5" />
                </View>
                <View style={styles.cartHeroText}>
                    <Text style={styles.cartHeroTitle}>Fast Ghana delivery</Text>
                    <Text style={styles.cartHeroSubtitle}>Review your items before checkout.</Text>
                </View>
            </Animated.View>

            {/* Cart Items */}
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.cartKey || item.product._id}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />

            {/* Bottom Section - Fixed */}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.bottomSection}>
                <View style={styles.secureCheckoutRow}>
                    <ShieldCheck size={16} color="#047857" />
                    <Text style={styles.secureCheckoutText}>Secure checkout and verified payment</Text>
                </View>
                {/* Order Summary */}
                <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>{formatMoney(cartTotal, currency)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                        <Text style={styles.summaryValue}>{formatMoney(deliveryFee, currency)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>{formatMoney(finalTotal, currency)}</Text>
                    </View>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity style={[styles.checkoutButton, { backgroundColor: colors.primary }]} onPress={handleCheckout} activeOpacity={0.9}>
                    <Text style={styles.checkoutButtonText}>Checkout for {formatMoney(finalTotal, currency)}</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    shopButtonIcon: {
        marginRight: 6,
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
    },
    headerSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    clearButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },
    clearButtonText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#DC2626",
    },
    cartHero: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginTop: 14,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#EEF2FF",
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    cartHeroIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    cartHeroText: {
        flex: 1,
    },
    cartHeroTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },
    cartHeroSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: "#6B7280",
    },
    cartList: {
        padding: 16,
        paddingBottom: 200, // Extra space for bottom section
    },
    cartItem: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    imageContainer: {
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F9FAFB",
    },
    productImage: {
        width: 80,
        height: 80,
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
    },
    productHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    productDetails: {
        flex: 1,
        marginRight: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 4,
        lineHeight: 20,
    },
    productVariant: {
        fontSize: 13,
        color: "#6B7280",
        fontWeight: "500",
    },
    removeButton: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: "#F9FAFB",
    },
    productFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productPrice: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    unitPrice: {
        marginTop: 2,
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    quantityButtonPlus: {
        backgroundColor: "#ECFDF5",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginHorizontal: 16,
        minWidth: 20,
        textAlign: "center",
    },
    itemSeparator: {
        height: 16,
    },
    bottomSection: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for tab bar
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    orderSummary: {
        marginBottom: 20,
    },
    secureCheckoutRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#ECFDF5",
        marginBottom: 14,
    },
    secureCheckoutText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#047857",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: "#6B7280",
        fontWeight: "500",
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F2937",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    totalLabel: {
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "600",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    checkoutButton: {
        backgroundColor: "#10B981",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    checkoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    // Auth Screen Styles
    authContainer: {
        flex: 0.8,
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
    // Empty Cart Styles
    emptyContainer: {
        flex: 0.8,
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
        marginBottom: 28,
    },
    shopButton: {
        backgroundColor: "#6366F1",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center"
    },
    shopButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
})
