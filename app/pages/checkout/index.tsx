"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { router } from "expo-router"
import { ArrowLeft, Check, ChevronRight, CreditCard, Edit3, MapPin, Package, Plus, Truck } from "lucide-react-native"
import { useState } from "react"
import {
    Alert,
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
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated"

const { width } = Dimensions.get("window")

// Mock addresses - replace with your actual address management
const MOCK_ADDRESSES = [
    {
        id: "1",
        name: "Home",
        fullName: "John Doe",
        phone: "+1 234 567 8900",
        address: "123 Main Street, Apt 4B",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        isDefault: true,
    },
    {
        id: "2",
        name: "Office",
        fullName: "John Doe",
        phone: "+1 234 567 8900",
        address: "456 Business Ave, Suite 200",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        isDefault: false,
    },
]

type PaymentMethod = "cod" | "card"

export default function CheckoutScreen() {
    const { isAuthenticated } = useAuth()
    const { items, cartTotal, clearCart } = useCart()

    const [addresses] = useState(MOCK_ADDRESSES)
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        addresses.find((addr) => addr.isDefault)?.id || null,
    )
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
    const [isProcessing, setIsProcessing] = useState(false)

    const deliveryFee = 5.0
    const finalTotal = cartTotal + deliveryFee
    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
    const { colors } = useTheme()

    const handleAddAddress = () => {
        router.push("/auth/address")
    }

    const handleEditAddress = (addressId: string) => {
        // Navigate to edit address screen
        Alert.alert("Edit Address", `Edit address ${addressId}`)
    }

    const handleEditCart = () => {
        router.back()
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert("Address Required", "Please select a delivery address to continue.")
            return
        }

        setIsProcessing(true)

        // Simulate order processing
        setTimeout(() => {
            setIsProcessing(false)
            Alert.alert("Order Placed!", `Your order has been placed successfully. Total: $${finalTotal.toFixed(2)}`, [
                {
                    text: "OK",
                    onPress: () => {
                        clearCart()
                        router.replace("/(tabs)")
                    },
                },
            ])
        }, 2000)
    }

    const getImageSource = (product: any) => {
        if (product.images && product.images.length > 0 && product.images[0]) {
            return { uri: product.images[0].url }
        }
        return {
            uri: product.images[0].url,
        }
    }

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={getImageSource(item.product)} style={styles.cartItemImage} />
            <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product.title}
                </Text>
                <Text style={styles.cartItemDetails}>
                    Qty: {item.quantity} • ${item.product.price.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.cartItemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
        </View>
    )

    const renderAddressCard = ({ item }: { item: any }) => (
        <Animated.View layout={Layout.springify()}>
            <TouchableOpacity
                style={[styles.addressCard, selectedAddressId === item.id && styles.addressCardSelected]}
                onPress={() => setSelectedAddressId(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.addressHeader}>
                    <View style={styles.addressInfo}>
                        <View style={styles.addressNameRow}>
                            <Text style={styles.addressName}>{item.name}</Text>
                            {item.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                        </View>
                        <Text style={styles.addressFullName}>{item.fullName}</Text>
                        <Text style={styles.addressPhone}>{item.phone}</Text>
                    </View>
                    <View style={styles.addressActions}>
                        {selectedAddressId === item.id && (
                            <View style={styles.selectedIndicator}>
                                <Check size={16} color="#10B981" />
                            </View>
                        )}
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditAddress(item.id)} activeOpacity={0.7}>
                            <Edit3 size={16} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.addressText}>
                    {item.address}, {item.city}, {item.state} {item.zipCode}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Text>Please login to continue</Text>
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
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Delivery Address Section */}
                <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <MapPin size={20} color="#6366F1" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} activeOpacity={0.7}>
                            <Plus size={16} color="#6366F1" />
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {addresses.length === 0 ? (
                        <View style={styles.emptyAddresses}>
                            <Text style={styles.emptyText}>No addresses found</Text>
                            <Text style={styles.emptySubtext}>Add an address to continue</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={addresses}
                            renderItem={renderAddressCard}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.addressSeparator} />}
                        />
                    )}
                </Animated.View>

                {/* Order Summary Section */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Package size={20} color="#6366F1" />
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                        </View>
                        <TouchableOpacity style={styles.editCartButton} onPress={handleEditCart} activeOpacity={0.7}>
                            <Edit3 size={16} color="#6366F1" />
                            <Text style={styles.editCartButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.orderSummaryCard}>
                        <FlatList
                            data={items}
                            renderItem={renderCartItem}
                            keyExtractor={(item) => item.product._id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.cartItemSeparator} />}
                        />

                        <View style={styles.orderTotals}>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Subtotal ({items.length} items)</Text>
                                <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Delivery Fee</Text>
                                <Text style={styles.totalValue}>${deliveryFee.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.totalRow, styles.finalTotalRow]}>
                                <Text style={styles.finalTotalLabel}>Total</Text>
                                <Text style={styles.finalTotalValue}>${finalTotal.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* Payment Method Section */}
                <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <CreditCard size={20} color="#6366F1" />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>

                    <View style={styles.paymentMethods}>
                        <TouchableOpacity
                            style={[styles.paymentMethod, paymentMethod === "cod" && styles.paymentMethodSelected]}
                            onPress={() => setPaymentMethod("cod")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.paymentMethodInfo}>
                                <Truck size={20} color={paymentMethod === "cod" ? "#10B981" : "#6B7280"} />
                                <View style={styles.paymentMethodText}>
                                    <Text
                                        style={[styles.paymentMethodTitle, paymentMethod === "cod" && styles.paymentMethodTitleSelected]}
                                    >
                                        Cash on Delivery
                                    </Text>
                                    <Text style={styles.paymentMethodSubtitle}>Pay when you receive</Text>
                                </View>
                            </View>
                            {paymentMethod === "cod" && (
                                <View style={styles.selectedPaymentIndicator}>
                                    <Check size={16} color="#10B981" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentMethod, paymentMethod === "card" && styles.paymentMethodSelected]}
                            onPress={() => setPaymentMethod("card")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.paymentMethodInfo}>
                                <CreditCard size={20} color={paymentMethod === "card" ? "#10B981" : "#6B7280"} />
                                <View style={styles.paymentMethodText}>
                                    <Text
                                        style={[styles.paymentMethodTitle, paymentMethod === "card" && styles.paymentMethodTitleSelected]}
                                    >
                                        Mobile Money
                                    </Text>
                                    <Text style={styles.paymentMethodSubtitle}>Pay now securely</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color="#9CA3AF" />
                            {paymentMethod === "card" && (
                                <View style={styles.selectedPaymentIndicator}>
                                    <Check size={16} color="#10B981" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Fixed Bottom Section */}
            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.bottomSection}>
                <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>Total Amount</Text>
                    <Text style={styles.orderTotalValue}>${finalTotal.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.placeOrderButton, (!selectedAddress || isProcessing) && styles.placeOrderButtonDisabled, { backgroundColor: colors.primary }]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedAddress || isProcessing}
                    activeOpacity={0.9}
                >
                    <Text
                        style={[
                            styles.placeOrderButtonText,
                            (!selectedAddress || isProcessing) && styles.placeOrderButtonTextDisabled,
                        ]}
                    >
                        {isProcessing ? "Processing..." : "Place Order"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
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
    container: {
        flex: 1,
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#EEF2FF",
        borderRadius: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6366F1",
    },
    emptyAddresses: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#6B7280",
    },
    addressCard: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#FAFAFA",
    },
    addressCardSelected: {
        borderColor: "#10B981",
        backgroundColor: "#F0FDF4",
    },
    addressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    addressInfo: {
        flex: 1,
    },
    addressNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    addressName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    defaultBadge: {
        fontSize: 12,
        fontWeight: "500",
        color: "#10B981",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    addressFullName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
    },
    addressActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ECFDF5",
        justifyContent: "center",
        alignItems: "center",
    },
    editButton: {
        padding: 4,
    },
    addressText: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
    },
    addressSeparator: {
        height: 12,
    },
    editCartButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: "#EEF2FF",
        borderRadius: 8,
    },
    editCartButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6366F1",
    },
    orderSummaryCard: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#FAFAFA",
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    cartItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    cartItemDetails: {
        fontSize: 12,
        color: "#6B7280",
    },
    cartItemTotal: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    cartItemSeparator: {
        height: 12,
    },
    orderTotals: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: "#6B7280",
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    finalTotalRow: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    finalTotalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    finalTotalValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    paymentMethods: {
        marginTop: 16,
        gap: 12,
    },
    paymentMethod: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        backgroundColor: "#FAFAFA",
    },
    paymentMethodSelected: {
        borderColor: "#10B981",
        backgroundColor: "#F0FDF4",
    },
    paymentMethodInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    paymentMethodText: {
        flex: 1,
    },
    paymentMethodTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    paymentMethodTitleSelected: {
        color: "#10B981",
    },
    paymentMethodSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    selectedPaymentIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ECFDF5",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomSpacing: {
        height: 130,
    },
    bottomSection: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    orderTotal: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    orderTotalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
    orderTotalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
    },
    placeOrderButton: {
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
    placeOrderButtonDisabled: {
        backgroundColor: "#E5E7EB",
    },
    placeOrderButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    placeOrderButtonTextDisabled: {
        color: "#9CA3AF",
    },
})
