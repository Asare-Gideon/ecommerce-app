"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { formatMoney, getProductImage, getProductPrice, getUserId } from "@/lib/catalog"
import api from "@/lib/api"
import { useOrdersStore } from "@/store/orders"
import { useSettingsStore } from "@/store/settings"
import type { PaymentMethod, ShippingMethod } from "@/types/order"
import type { Address } from "@/types/user"
import * as Linking from "expo-linking"
import { router } from "expo-router"
import { ArrowLeft, Check, CreditCard, Edit3, MapPin, Package, Plus, Smartphone, Truck, X } from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Alert, FlatList, Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated"
import { WebView } from "react-native-webview"

type PendingPayment = {
    orderId: string
    authorizationUrl: string
    reference: string
}

type CheckoutStep = "review" | "methods"

export default function CheckoutScreen() {
    const { user, isAuthenticated, refreshUser } = useAuth()
    const { items, cartTotal, clearCart } = useCart()
    const { colors } = useTheme()
    const { paymentMethods, shippingMethods, currency, fetchSettings } = useSettingsStore()
    const { createOrder, initializePaystack, verifyPaystack } = useOrdersStore()

    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [selectedPaymentCode, setSelectedPaymentCode] = useState("")
    const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
    const [showAddressPicker, setShowAddressPicker] = useState(false)
    const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)
    const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("review")
    const paymentFinalizedRef = useRef(false)

    const selectedAddress = addresses.find((addr) => addr._id === selectedAddressId)
    const defaultAddress = addresses.find((addr) => addr.default)
    const deliveryAddress = selectedAddress || defaultAddress
    const selectedPayment = paymentMethods.find((method) => method.code === selectedPaymentCode)
    const selectedShipping = shippingMethods.find((method) => method._id === selectedShippingId)
    const deliveryFee = Number(selectedShipping?.amount || 0)
    const finalTotal = cartTotal + deliveryFee
    const isReviewStep = checkoutStep === "review"
    const canContinue = Boolean(items.length && deliveryAddress?._id)
    const canPlaceOrder = Boolean(canContinue && selectedShipping && selectedPayment && !isProcessing)
    const isCheckoutLocked = isProcessing

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!isAuthenticated) return
            try {
                const response = await api.get<Address[]>("/address/get-all")
                const apiAddresses = response.data || []
                setAddresses(apiAddresses)
                setSelectedAddressId(apiAddresses.find((addr) => addr.default)?._id || apiAddresses[0]?._id || null)
            } catch (error) {
                console.log("Failed to fetch addresses", error)
                await refreshUser()
                const userAddresses = user?.addresses || []
                setAddresses(userAddresses)
                setSelectedAddressId(userAddresses.find((addr) => addr.default)?._id || userAddresses[0]?._id || null)
            }
        }

        fetchAddresses()
    }, [isAuthenticated, refreshUser, user?.addresses])

    const handleHeaderBack = () => {
        if (isCheckoutLocked) return
        if (checkoutStep === "methods") {
            setCheckoutStep("review")
            return
        }
        router.back()
    }

    const handleContinue = () => {
        if (isCheckoutLocked) return
        if (!items.length) {
            Alert.alert("Cart Empty", "Add products to your cart before checking out.")
            return
        }
        if (!deliveryAddress?._id) {
            Alert.alert("Address Required", "Please select a delivery address to continue.")
            return
        }
        setCheckoutStep("methods")
    }

    const orderItems = useMemo(
        () =>
            items.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                chosenSize: item.selectedSize || "",
                chosenColor: item.selectedColor || "",
                chosenColors: item.selectedColor ? [item.selectedColor] : [],
            })),
        [items],
    )

    const getPaymentIcon = (method: PaymentMethod) => {
        if (method.code === "mobile-money") return Smartphone
        if (method.code === "payment-on-delivery") return Truck
        return CreditCard
    }

    const getPaystackReferenceFromUrl = (url: string) => {
        const match = url.match(/[?&](reference|trxref)=([^&#]+)/i)
        return match?.[2] ? decodeURIComponent(match[2]) : ""
    }

    const handlePlaceOrder = async () => {
        if (!items.length) {
            Alert.alert("Cart Empty", "Add products to your cart before checking out.")
            return
        }
        if (!deliveryAddress?._id) {
            Alert.alert("Address Required", "Please select a delivery address to continue.")
            return
        }
        if (!selectedPayment) {
            Alert.alert("Payment Required", "Please select a payment method.")
            return
        }
        if (!selectedShipping) {
            Alert.alert("Shipping Required", "Please select a shipping method.")
            return
        }

        const userId = getUserId(user)
        if (!userId) {
            Alert.alert("Sign in Required", "Please sign in again to place this order.")
            return
        }

        try {
            setIsProcessing(true)
            const order = await createOrder({
                user: userId,
                products: orderItems,
                paymentMethod: selectedPayment.code,
                shippingAddress: deliveryAddress._id,
                shippingMethod: selectedShipping?.name || "",
                shippingAmount: deliveryFee,
            })

            if (selectedPayment.gateway === "paystack") {
                const callbackUrl = Linking.createURL("/pages/checkout")
                const response = await initializePaystack(order._id, callbackUrl)
                const authorizationUrl = response?.paystack?.authorization_url
                if (!authorizationUrl) throw new Error("Paystack checkout URL was not returned.")
                setPendingPayment({
                    orderId: order._id,
                    authorizationUrl,
                    reference: response?.order?.transactionId || response?.paystack?.reference || "",
                })
                paymentFinalizedRef.current = false
                return
            }

            clearCart()
            Alert.alert("Order Placed", "Your order has been placed successfully.", [
                { text: "View Order", onPress: () => router.replace({ pathname: "/pages/orders/details" as any, params: { id: order._id } as any }) },
            ])
        } catch (error: any) {
            Alert.alert("Order Failed", error.response?.data?.message || error.message || "Unable to place your order.")
        } finally {
            setIsProcessing(false)
        }
    }

    const verifyPendingPaystackPayment = async (reference: string, orderId: string, pendingMessage: string) => {
        if (!reference || paymentFinalizedRef.current) return false
        paymentFinalizedRef.current = true
        try {
            setIsVerifyingPayment(true)
            const verification = await verifyPaystack(reference)
            if (verification?.order?.paymentStatus !== "paid") {
                setPendingPayment(null)
                Alert.alert("Payment Pending", pendingMessage)
                router.replace({ pathname: "/pages/orders/details" as any, params: { id: orderId } as any })
                return false
            }
            clearCart()
            setPendingPayment(null)
            Alert.alert("Payment Successful", "Your payment has been verified.")
            router.replace({ pathname: "/pages/orders/details" as any, params: { id: orderId } as any })
            return true
        } catch (error: any) {
            paymentFinalizedRef.current = false
            Alert.alert("Payment Verification Failed", error.response?.data?.message || error.message || "Please contact support with your payment reference.")
            return false
        } finally {
            setIsVerifyingPayment(false)
        }
    }

    const handlePaymentNavigation = async (url: string) => {
        if (!pendingPayment || isVerifyingPayment || paymentFinalizedRef.current) return

        const parsedUrl = Linking.parse(url)
        const status = String(parsedUrl.queryParams?.status || "")
        const reference = getPaystackReferenceFromUrl(url) || String(parsedUrl.queryParams?.reference || parsedUrl.queryParams?.trxref || pendingPayment.reference || "")
        const isCallbackUrl = url.includes("/pages/checkout") || url.includes("reference=") || url.includes("trxref=") || url.includes("status=")
        const looksSuccessful = status === "success" || url.toLowerCase().includes("success")

        if (!isCallbackUrl && !looksSuccessful) return

        if (status && status !== "success") {
            setPendingPayment(null)
            Alert.alert("Payment Pending", "Your order was created, but payment was not completed.")
            router.replace({ pathname: "/pages/orders/details" as any, params: { id: pendingPayment.orderId } as any })
            return
        }

        await verifyPendingPaystackPayment(reference, pendingPayment.orderId, "Your order was created, but payment has not been confirmed yet.")
    }

    const closePaymentModal = async () => {
        if (!pendingPayment || isVerifyingPayment || paymentFinalizedRef.current) return
        const { orderId, reference } = pendingPayment
        if (reference) {
            await verifyPendingPaystackPayment(reference, orderId, "Your order was created, but Paystack payment has not been confirmed yet.")
            return
        }
        setPendingPayment(null)
        Alert.alert("Payment Pending", "Your order was created, but Paystack payment was not completed yet.")
        router.replace({ pathname: "/pages/orders/details" as any, params: { id: orderId } as any })
    }

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: getProductImage(item.product) }} style={styles.cartItemImage} />
            <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={1}>{item.product.title}</Text>
                <Text style={styles.cartItemDetails}>
                    Qty: {item.quantity}
                    {item.selectedSize ? ` • ${item.selectedSize}` : ""}
                    {item.selectedColor ? ` • ${item.selectedColor}` : ""}
                </Text>
            </View>
            <Text style={styles.cartItemTotal}>{formatMoney(getProductPrice(item.product) * item.quantity, currency)}</Text>
        </View>
    )

    const renderAddressCard = ({ item }: { item: Address }) => (
        <Animated.View layout={Layout.springify()}>
            <TouchableOpacity
                style={[styles.addressCard, selectedAddressId === item._id && styles.addressCardSelected]}
                onPress={() => {
                    if (isCheckoutLocked) return
                    if (item._id) {
                        setSelectedAddressId(item._id)
                        setShowAddressPicker(false)
                    }
                }}
                disabled={isCheckoutLocked}
                activeOpacity={0.7}
            >
                <View style={styles.addressHeader}>
                    <View style={styles.addressInfo}>
                        <View style={styles.addressNameRow}>
                            <Text style={styles.addressName}>{item.city}</Text>
                            {item.default && <Text style={styles.defaultBadge}>Default</Text>}
                        </View>
                        {item.phoneNumber && <Text style={styles.addressPhone}>{item.phoneNumber}</Text>}
                    </View>
                    {selectedAddressId === item._id && (
                        <View style={styles.selectedIndicator}>
                            <Check size={16} color="#10B981" />
                        </View>
                    )}
                </View>
                <Text style={styles.addressText}>{item.address}, {item.city}, {item.state} {item.postalCode}</Text>
            </TouchableOpacity>
        </Animated.View>
    )

    const renderSelectedAddress = () => {
        const address = selectedAddress || defaultAddress

        if (!address) {
            return (
                <View style={styles.emptyAddresses}>
                    <Text style={styles.emptyText}>No default address found</Text>
                    <Text style={styles.emptySubtext}>Add a delivery address to continue.</Text>
                    <TouchableOpacity style={styles.addAddressButton} onPress={() => router.push("/pages/addresses" as any)} activeOpacity={0.85} disabled={isCheckoutLocked}>
                        <Plus size={16} color="#fff" />
                        <Text style={styles.addAddressButtonText}>Add Address</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return (
            <View style={styles.selectedAddressCard}>
                <View style={styles.selectedAddressTop}>
                    <View style={styles.addressIcon}>
                        <MapPin size={20} color="#4F46E5" />
                    </View>
                    <View style={styles.selectedAddressInfo}>
                        <View style={styles.addressNameRow}>
                            <Text style={styles.addressName}>{address.city || "Delivery address"}</Text>
                            {address.default && <Text style={styles.defaultBadge}>Default</Text>}
                        </View>
                        <Text style={styles.addressText}>{address.address}, {address.city}, {address.state} {address.postalCode}</Text>
                        {address.phoneNumber ? <Text style={styles.addressPhone}>{address.phoneNumber}</Text> : null}
                    </View>
                </View>
                <TouchableOpacity style={styles.changeAddressButton} onPress={() => setShowAddressPicker(true)} activeOpacity={0.8} disabled={isCheckoutLocked}>
                    <Text style={styles.changeAddressText}>Change Address</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderPaymentModal = () => (
        <Modal
            visible={Boolean(pendingPayment)}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={closePaymentModal}
        >
            <SafeAreaView style={styles.paymentModal}>
                <View style={styles.paymentHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={closePaymentModal} activeOpacity={0.75}>
                        <X size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.paymentHeaderTitle}>Paystack Checkout</Text>
                    <View style={styles.headerSpacer} />
                </View>
                {pendingPayment && (
                    <WebView
                        style={styles.paymentWebView}
                        source={{ uri: pendingPayment.authorizationUrl }}
                        onNavigationStateChange={(state) => handlePaymentNavigation(state.url)}
                        startInLoadingState
                        renderLoading={() => (
                            <View style={styles.webViewLoader}>
                                <ActivityIndicator size="large" color="#4F46E5" />
                                <Text style={styles.webViewLoaderText}>Loading payment...</Text>
                            </View>
                        )}
                    />
                )}
                {isVerifyingPayment && (
                    <View style={styles.verifyingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.verifyingText}>Verifying payment...</Text>
                    </View>
                )}
            </SafeAreaView>
        </Modal>
    )

    const renderAddressPicker = () => (
        <Modal transparent visible={showAddressPicker} animationType="slide" onRequestClose={() => !isCheckoutLocked && setShowAddressPicker(false)}>
            <View style={styles.addressPickerOverlay}>
                <TouchableOpacity style={styles.addressPickerBackdrop} onPress={() => setShowAddressPicker(false)} activeOpacity={1} disabled={isCheckoutLocked} />
                <View style={styles.addressPickerSheet}>
                    <View style={styles.addressPickerHeader}>
                        <Text style={styles.addressPickerTitle}>Choose Address</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowAddressPicker(false)} disabled={isCheckoutLocked}>
                            <X size={22} color="#111827" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={addresses}
                        renderItem={renderAddressCard}
                        keyExtractor={(item, index) => item._id || `address-${index}`}
                        contentContainerStyle={styles.addressPickerList}
                        ItemSeparatorComponent={() => <View style={styles.addressSeparator} />}
                    />
                </View>
            </View>
        </Modal>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Text style={styles.centerMessage}>Please login to continue</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleHeaderBack} activeOpacity={0.7} disabled={isCheckoutLocked}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {isReviewStep ? (
                    <>
                        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <MapPin size={20} color="#6366F1" />
                                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                                </View>
                                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/pages/addresses" as any)} activeOpacity={0.7} disabled={isCheckoutLocked}>
                                    <Plus size={16} color="#6366F1" />
                                    <Text style={styles.addButtonText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                            {renderSelectedAddress()}
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleRow}>
                                    <Package size={20} color="#6366F1" />
                                    <Text style={styles.sectionTitle}>Order Summary</Text>
                                </View>
                                <TouchableOpacity style={styles.editCartButton} onPress={() => router.back()} activeOpacity={0.7} disabled={isCheckoutLocked}>
                                    <Edit3 size={16} color="#6366F1" />
                                    <Text style={styles.editCartButtonText}>Edit</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.orderSummaryCard}>
                                <FlatList data={items} renderItem={renderCartItem} keyExtractor={(item) => item.cartKey || item.product._id} scrollEnabled={false} ItemSeparatorComponent={() => <View style={styles.cartItemSeparator} />} />
                                <View style={styles.orderTotals}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Subtotal</Text>
                                        <Text style={styles.totalValue}>{formatMoney(cartTotal, currency)}</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Delivery Fee</Text>
                                        <Text style={styles.totalValueMuted}>Choose shipping next</Text>
                                    </View>
                                    <View style={[styles.totalRow, styles.finalTotalRow]}>
                                        <Text style={styles.finalTotalLabel}>Due now</Text>
                                        <Text style={styles.finalTotalValue}>{formatMoney(cartTotal, currency)}</Text>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    </>
                ) : (
                    <>
                        {shippingMethods.length > 0 && (
                            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
                                <Text style={styles.sectionTitle}>Shipping Method</Text>
                                <View style={styles.paymentMethods}>
                                    {shippingMethods.map((method: ShippingMethod) => (
                                        <TouchableOpacity key={method._id} style={[styles.paymentMethod, selectedShippingId === method._id && styles.paymentMethodSelected]} onPress={() => setSelectedShippingId(method._id)} disabled={isCheckoutLocked}>
                                            <View style={styles.paymentMethodText}>
                                                <Text style={[styles.paymentMethodTitle, selectedShippingId === method._id && styles.paymentMethodTitleSelected]}>{method.name}</Text>
                                                <Text style={styles.paymentMethodSubtitle}>{method.estimatedDays || method.description || "Delivery option"}</Text>
                                            </View>
                                            <Text style={styles.totalValue}>{formatMoney(method.amount, currency)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
                            <View style={styles.sectionTitleRow}>
                                <CreditCard size={20} color="#6366F1" />
                                <Text style={styles.sectionTitle}>Payment Method</Text>
                            </View>
                            <View style={styles.paymentMethods}>
                                {paymentMethods.map((method) => {
                                    const Icon = getPaymentIcon(method)
                                    const isSelected = selectedPaymentCode === method.code
                                    return (
                                        <TouchableOpacity key={method.code} style={[styles.paymentMethod, isSelected && styles.paymentMethodSelected]} onPress={() => setSelectedPaymentCode(method.code)} activeOpacity={0.7} disabled={isCheckoutLocked}>
                                            <View style={styles.paymentMethodInfo}>
                                                <Icon size={20} color={isSelected ? "#10B981" : "#6B7280"} />
                                                <View style={styles.paymentMethodText}>
                                                    <Text style={[styles.paymentMethodTitle, isSelected && styles.paymentMethodTitleSelected]}>{method.name}</Text>
                                                    <Text style={styles.paymentMethodSubtitle}>{method.description}</Text>
                                                </View>
                                            </View>
                                            {isSelected && <Check size={16} color="#10B981" />}
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </Animated.View>
                    </>
                )}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.bottomSection}>
                <View style={styles.orderTotal}>
                    <Text style={styles.orderTotalLabel}>{isReviewStep ? "Subtotal" : "Total Amount"}</Text>
                    <Text style={styles.orderTotalValue}>{formatMoney(isReviewStep ? cartTotal : finalTotal, currency)}</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        { backgroundColor: isReviewStep ? (canContinue ? colors.primary : "#E5E7EB") : (canPlaceOrder ? colors.primary : "#E5E7EB") },
                    ]}
                    onPress={isReviewStep ? handleContinue : handlePlaceOrder}
                    disabled={isReviewStep ? !canContinue : !canPlaceOrder}
                    activeOpacity={0.9}
                >
                    <Text style={[styles.placeOrderButtonText, (isReviewStep ? !canContinue : !canPlaceOrder) && styles.placeOrderButtonTextDisabled]}>
                        {isReviewStep ? "Continue" : isProcessing ? "Processing..." : selectedPayment?.gateway === "paystack" ? "Pay & Place Order" : "Place Order"}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
            {renderAddressPicker()}
            {renderPaymentModal()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
    centerMessage: { marginTop: 80, textAlign: "center", color: "#6B7280" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1F2937" },
    headerSpacer: { width: 32 },
    container: { flex: 1 },
    section: { backgroundColor: "#fff", marginTop: 12, paddingHorizontal: 20, paddingVertical: 20 },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
    addButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#EEF2FF", borderRadius: 8 },
    addButtonText: { fontSize: 14, fontWeight: "600", color: "#6366F1" },
    emptyAddresses: { alignItems: "center", paddingVertical: 32 },
    emptyText: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
    emptySubtext: { fontSize: 14, color: "#6B7280" },
    addressCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 16, backgroundColor: "#FAFAFA" },
    addressCardSelected: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
    addressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    addressInfo: { flex: 1 },
    addressNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    addressName: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
    defaultBadge: { fontSize: 12, fontWeight: "500", color: "#10B981", backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    addressPhone: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
    selectedIndicator: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center" },
    addressText: { fontSize: 14, color: "#6B7280", lineHeight: 20 },
    addressSeparator: { height: 12 },
    selectedAddressCard: { borderWidth: 1, borderColor: "#E0E7FF", borderRadius: 14, padding: 14, backgroundColor: "#F8FAFF" },
    selectedAddressTop: { flexDirection: "row", alignItems: "flex-start" },
    addressIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginRight: 12 },
    selectedAddressInfo: { flex: 1 },
    changeAddressButton: { marginTop: 14, minHeight: 42, borderRadius: 10, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
    changeAddressText: { fontSize: 14, fontWeight: "700", color: "#4F46E5" },
    addAddressButton: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#4F46E5", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
    addAddressButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    addressPickerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.45)" },
    addressPickerBackdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    addressPickerSheet: { maxHeight: "78%", backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    addressPickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#EEF0F4" },
    addressPickerTitle: { fontSize: 19, fontWeight: "800", color: "#111827" },
    closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
    addressPickerList: { padding: 16, paddingBottom: 28 },
    editCartButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#EEF2FF", borderRadius: 8 },
    editCartButtonText: { fontSize: 14, fontWeight: "600", color: "#6366F1" },
    orderSummaryCard: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 16, backgroundColor: "#FAFAFA" },
    cartItem: { flexDirection: "row", alignItems: "center", gap: 12 },
    cartItemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#F3F4F6" },
    cartItemInfo: { flex: 1 },
    cartItemName: { fontSize: 14, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
    cartItemDetails: { fontSize: 12, color: "#6B7280" },
    cartItemTotal: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    cartItemSeparator: { height: 12 },
    orderTotals: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    totalLabel: { fontSize: 14, color: "#6B7280" },
    totalValue: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
    totalValueMuted: { fontSize: 13, fontWeight: "600", color: "#8B95A5" },
    finalTotalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
    finalTotalLabel: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
    finalTotalValue: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
    paymentMethods: { marginTop: 16, gap: 12 },
    paymentMethod: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#FAFAFA" },
    paymentMethodSelected: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
    paymentMethodInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    paymentMethodText: { flex: 1 },
    paymentMethodTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
    paymentMethodTitleSelected: { color: "#10B981" },
    paymentMethodSubtitle: { fontSize: 14, color: "#6B7280" },
    bottomSpacing: { height: 130 },
    bottomSection: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
    orderTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    orderTotalLabel: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
    orderTotalValue: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
    placeOrderButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
    placeOrderButtonDisabled: { backgroundColor: "#E5E7EB" },
    placeOrderButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    placeOrderButtonTextDisabled: { color: "#9CA3AF" },
    paymentModal: { flex: 1, width: "100%", height: "100%", backgroundColor: "#fff" },
    paymentHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
    paymentHeaderTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
    paymentWebView: { flex: 1, width: "100%" },
    webViewLoader: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", gap: 12 },
    webViewLoaderText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
    verifyingOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(17, 24, 39, 0.62)", gap: 12 },
    verifyingText: { fontSize: 15, fontWeight: "800", color: "#fff" },
})
