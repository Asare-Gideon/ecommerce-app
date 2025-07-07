"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { router } from "expo-router"
import { Minus, Plus, ShoppingBag, ShoppingCart, User, X } from "lucide-react-native"
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

    const deliveryFee = 5.0
    const finalTotal = cartTotal + deliveryFee
    console.log("isAuthenticated", isAuthenticated)

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
                            onPress={() => router.push("/auth/register" as any)}
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

    const getImageSource = (product: any) => {
        if (product.images && product.images.length > 0 && product.images[0]) {
            return { uri: product.images[0].url }
        }
        return {
            uri: product.images[0].url,
        }
    }

    const renderCartItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            exiting={SlideOutRight.springify()}
            layout={Layout.springify()}
            style={styles.cartItem}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={getImageSource(item.product)}
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
                        {(item.color || item.size) && (
                            <Text style={styles.productVariant}>
                                {item.color && `${item.color}`}
                                {item.size && ` • ${item.size}`}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.product._id)}
                        activeOpacity={0.7}
                    >
                        <X size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            activeOpacity={0.7}
                        >
                            <Minus size={14} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={[styles.quantityButton, styles.quantityButtonPlus]}
                            onPress={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            activeOpacity={0.7}
                        >
                            <Plus size={14} color="#10B981" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    )

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
                    <Text style={styles.headerTitle}>My cart</Text>
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
                <Text style={styles.headerTitle}>My cart</Text>
            </Animated.View>

            {/* Cart Items */}
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.product._id}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />

            {/* Bottom Section - Fixed */}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.bottomSection}>
                {/* Order Summary */}
                <View style={styles.orderSummary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                        <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity style={[styles.checkoutButton, { backgroundColor: colors.primary }]} onPress={handleCheckout} activeOpacity={0.9}>
                    <Text style={styles.checkoutButtonText}>Checkout for ${finalTotal.toFixed(2)}</Text>
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
    cartList: {
        padding: 16,
        paddingBottom: 200, // Extra space for bottom section
    },
    cartItem: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        flexDirection: "row",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        borderWidth: 1,
        borderColor: "#F3F4F6",
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    orderSummary: {
        marginBottom: 20,
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
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
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

