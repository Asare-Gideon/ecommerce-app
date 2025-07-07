"use client"

import { CustomAlert } from "@/components/ui/custom-alert"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import {
    ArrowLeft,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    MapPin,
    Package,
    Star,
    Truck,
    X,
    XCircle,
} from "lucide-react-native"
import { useEffect, useState } from "react"
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import ReAnimated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Mock order data matching the actual schema
const MOCK_ORDER = {
    _id: "140605156",
    user: "user123",
    products: [
        {
            product: {
                _id: "prod1",
                title: "Wireless Bluetooth Headphones Premium Quality",
                images: ["https://via.placeholder.com/40x40/FF6B6B/fff?text=WH"],
                price: 199.99,
            },
            quantity: 1,
            chosenColors: ["Black"],
            rated: false, // Track if this product has been rated
        },
        {
            product: {
                _id: "prod2",
                title: "Phone Case Premium Protection Ultra Slim",
                images: ["https://via.placeholder.com/40x40/4ECDC4/fff?text=PC"],
                price: 29.99,
            },
            quantity: 2,
            chosenColors: ["Blue"],
            rated: true, // Already rated
        },
        {
            product: {
                _id: "prod3",
                title: "USB-C Cable Fast Charging",
                images: ["https://via.placeholder.com/40x40/45B7D1/fff?text=UC"],
                price: 19.99,
            },
            quantity: 1,
            chosenColors: ["White"],
            rated: false,
        },
        {
            product: {
                _id: "prod4",
                title: "Power Bank 20000mAh",
                images: ["https://via.placeholder.com/40x40/F39C12/fff?text=PB"],
                price: 49.99,
            },
            quantity: 1,
            chosenColors: ["Black"],
            rated: false,
        },
    ],
    totalAmount: 329.95,
    status: "delivered", // Current status from schema
    paymentMethod: "card",
    paymentStatus: "paid",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
    transactionId: "TXN123456789",
    shippingAddress: {
        _id: "addr123",
        fullName: "Leslie Alexander",
        phone: "(406) 555-0120",
        email: "lesliealexander@acme.com",
        address: "123 Main Street, Apt 4B",
        city: "New York",
        state: "NY",
        zipCode: "10001",
    },
    deliveredAt: "2024-01-18T14:30:00Z",
    canceledReason: null,
}

// Define the order progress steps based on schema status enum
const ORDER_PROGRESS_STEPS = [
    {
        status: "pending",
        title: "Order Placed",
        description: "Your order has been received and is being processed",
        icon: Package,
    },
    {
        status: "processing",
        title: "Processing",
        description: "Item is currently undergoing preparations to ship",
        icon: Clock,
    },
    {
        status: "completed",
        title: "Completed",
        description: "Order has been prepared and ready for delivery",
        icon: CheckCircle,
    },
    {
        status: "delivered",
        title: "Delivered",
        description: "Package has been delivered to your address",
        icon: Truck,
    },
]

// Function to get current step index based on status
const getCurrentStepIndex = (status: string) => {
    const statusOrder = ["pending", "processing", "completed", "delivered"]
    return statusOrder.indexOf(status)
}

// Function to generate progress steps with completion status
const generateProgressSteps = (
    currentStatus: string,
    createdAt: string,
    updatedAt: string,
    deliveredAt?: string,
    canceledReason?: string,
) => {
    if (currentStatus === "canceled") {
        return [
            {
                id: "1",
                status: "pending",
                title: "Order Placed",
                description: "Your order was received",
                timestamp: createdAt,
                completed: true,
                icon: Package,
            },
            {
                id: "2",
                status: "canceled",
                title: "Order Canceled",
                description: canceledReason || "Order was canceled",
                timestamp: updatedAt,
                completed: true,
                current: true,
                canceled: true,
                icon: XCircle,
            },
        ]
    }

    const currentIndex = getCurrentStepIndex(currentStatus)

    return ORDER_PROGRESS_STEPS.map((step, index) => ({
        id: (index + 1).toString(),
        status: step.status,
        title: step.title,
        description: step.description,
        icon: step.icon,
        completed: index <= currentIndex,
        current: index === currentIndex,
        timestamp:
            index === 0
                ? createdAt
                : index === currentIndex
                    ? updatedAt
                    : step.status === "delivered" && deliveredAt
                        ? deliveredAt
                        : null,
    }))
}

const CANCELLATION_REASONS = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Product no longer needed",
    "Delivery taking too long",
    "Other",
]

const getStatusColor = (status: string) => {
    switch (status) {
        case "pending":
            return "#F59E0B"
        case "processing":
            return "#6366F1"
        case "shipped":
            return "#8B5CF6"
        case "delivered":
            return "#10B981"
        case "canceled":
            return "#EF4444"
        default:
            return "#6B7280"
    }
}

export default function OrderDetailsScreen() {
    const { isAuthenticated } = useAuth()
    const [showCancelForm, setShowCancelForm] = useState(false)
    const [showRatingBottomSheet, setShowRatingBottomSheet] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [cancelReason, setCancelReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const [rating, setRating] = useState(0)
    const [reviewComment, setReviewComment] = useState("")
    const [showCancelAlert, setShowCancelAlert] = useState(false)
    const [expandedItems, setExpandedItems] = useState(false)
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT))

    useEffect(() => {
        if (showRatingBottomSheet) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [showRatingBottomSheet])

    const order = MOCK_ORDER
    const canCancel = ["pending", "processing"].includes(order.status)
    const canRate = order.status === "delivered"
    const isCanceled = order.status === "canceled"

    // Generate dynamic progress steps
    const progressSteps = generateProgressSteps(
        order.status,
        order.createdAt,
        order.updatedAt,
        order.deliveredAt,
        // order.canceledReason,
    )

    const handleCancelOrder = () => {
        if (!cancelReason) return
        setShowCancelAlert(true)
    }

    const confirmCancelOrder = () => {
        setShowCancelAlert(false)
        setShowCancelForm(false)
        console.log("Order cancelled:", { reason: cancelReason === "Other" ? customReason : cancelReason })
    }

    const handleRateProduct = (product: any) => {
        setSelectedProduct(product)
        setShowRatingBottomSheet(true)
    }

    const handleSubmitRating = () => {
        if (rating === 0) return
        console.log("Rating submitted:", {
            orderId: order._id,
            productId: selectedProduct.product._id,
            rating,
            comment: reviewComment,
        })

        // Reset form
        setRating(0)
        setReviewComment("")
        setShowRatingBottomSheet(false)
        setSelectedProduct(null)
    }

    const renderStars = (rating: number, size = 16, interactive = false, onPress?: (rating: number) => void) => (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    onPress={() => interactive && onPress?.(star)}
                    disabled={!interactive}
                    activeOpacity={interactive ? 0.7 : 1}
                >
                    <Star
                        size={size}
                        color={star <= rating ? "#F59E0B" : "#E5E7EB"}
                        fill={star <= rating ? "#F59E0B" : "transparent"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    )

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.headerSpacer} />
        </ReAnimated.View>
    )

    const renderOrderItems = () => (
        <ReAnimated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>
            {/* Order Info Header */}
            <View style={styles.orderInfoHeader}>
                <View style={styles.orderInfoLeft}>
                    <Text style={styles.orderNumber}>#{order._id}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
                </View>
            </View>

            {/* Products Header */}
            <TouchableOpacity style={styles.itemsHeader} onPress={() => setExpandedItems(!expandedItems)} activeOpacity={0.7}>
                <View style={styles.itemsHeaderLeft}>
                    <View style={styles.productImages}>
                        {order.products.slice(0, 3).map((item, index) => (
                            <View key={item.product._id} style={[styles.productImageContainer, { zIndex: 3 - index }]}>
                                <Image source={{ uri: item.product.images[0] }} style={styles.productImage} />
                            </View>
                        ))}
                        {order.products.length > 3 && (
                            <View style={styles.moreProductsIndicator}>
                                <Text style={styles.moreProductsText}>+{order.products.length - 3}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.itemsInfo}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                            {order.products[0].product.title}
                            {order.products.length > 1 && ` +${order.products.length - 1} more`}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                            {order.products.length} items • ${order.totalAmount.toFixed(2)}
                        </Text>
                    </View>
                </View>
                {expandedItems ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
            </TouchableOpacity>

            {expandedItems && (
                <View style={styles.itemsContent}>
                    {order.products.map((item, index) => (
                        <View key={item.product._id} style={styles.orderItem}>
                            <Image source={{ uri: item.product.images[0] }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.product.title}
                                </Text>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemMeta}>Color: {item.chosenColors[0]}</Text>
                                    <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
                                </View>
                            </View>
                            <View style={styles.itemActions}>
                                <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
                                {canRate && (
                                    <TouchableOpacity
                                        style={[styles.rateProductButton, item.rated && styles.rateProductButtonRated]}
                                        onPress={() => !item.rated && handleRateProduct(item)}
                                        disabled={item.rated}
                                        activeOpacity={0.7}
                                    >
                                        <Star
                                            size={14}
                                            color={item.rated ? "#10B981" : "#F59E0B"}
                                            fill={item.rated ? "#10B981" : "transparent"}
                                        />
                                        <Text style={[styles.rateProductButtonText, item.rated && styles.rateProductButtonTextRated]}>
                                            {item.rated ? "Rated" : "Rate"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ReAnimated.View>
    )

    const renderOrderProgress = () => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.card}>
            <Text style={styles.sectionTitle}>{isCanceled ? "Order Status" : "Order Progress"}</Text>
            <View style={styles.progressContainer}>
                {progressSteps.map((step: any, index: number) => {
                    const IconComponent = step.icon
                    return (
                        <View key={step.id} style={styles.progressStep}>
                            <View style={styles.progressLeft}>
                                <View
                                    style={[
                                        styles.progressIcon,
                                        step.completed && !step.canceled && styles.progressIconCompleted,
                                        step.current && !step.canceled && styles.progressIconCurrent,
                                        step.canceled && styles.progressIconCanceled,
                                        !step.completed && !step.current && styles.progressIconPending,
                                    ]}
                                >
                                    <IconComponent size={16} color={step.completed || step.current ? "#fff" : "#9CA3AF"} />
                                </View>
                                {index < progressSteps.length - 1 && (
                                    <View
                                        style={[
                                            styles.progressLine,
                                            step.completed && !step.canceled && styles.progressLineCompleted,
                                            step.canceled && styles.progressLineCanceled,
                                            !step.completed && styles.progressLinePending,
                                        ]}
                                    />
                                )}
                            </View>
                            <View style={styles.progressContent}>
                                <Text
                                    style={[
                                        styles.progressTitle,
                                        step.completed && !step.canceled && styles.progressTitleCompleted,
                                        step.current && !step.canceled && styles.progressTitleCurrent,
                                        step.canceled && styles.progressTitleCanceled,
                                        !step.completed && !step.current && styles.progressTitlePending,
                                    ]}
                                >
                                    {step.title}
                                </Text>
                                <Text
                                    style={[
                                        styles.progressDescription,
                                        step.canceled && styles.progressDescriptionCanceled,
                                        !step.completed && !step.current && styles.progressDescriptionPending,
                                    ]}
                                >
                                    {step.description}
                                </Text>
                                {step.timestamp && (
                                    <Text style={styles.progressTime}>
                                        {new Date(step.timestamp).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        </ReAnimated.View>
    )

    const renderShippingInfo = () => (
        <ReAnimated.View entering={FadeInUp.delay(300).springify()} style={styles.card}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.shippingContent}>
                <View style={styles.shippingItem}>
                    <MapPin size={16} color="#6B7280" />
                    <View style={styles.shippingDetails}>
                        <Text style={styles.shippingLabel}>Delivery Address</Text>
                        <Text style={styles.shippingValue}>{order.shippingAddress.fullName}</Text>
                        <Text style={styles.shippingAddress}>
                            {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode}
                        </Text>
                    </View>
                </View>
            </View>
        </ReAnimated.View>
    )

    const renderActionButtons = () => (
        <ReAnimated.View entering={FadeInUp.delay(400).springify()} style={styles.actionButtons}>
            {canCancel && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCancelForm(true)} activeOpacity={0.8}>
                    <XCircle size={18} color="#EF4444" />
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
            )}
            {isCanceled && (
                <View style={styles.canceledContainer}>
                    <XCircle size={18} color="#EF4444" />
                    <Text style={styles.canceledText}>This order has been canceled</Text>
                </View>
            )}
            {!canCancel && !isCanceled && (
                <View style={styles.noActionsContainer}>
                    <Text style={styles.noActionsText}>
                        {canRate ? "Rate individual products above" : "No actions available for this order"}
                    </Text>
                </View>
            )}
        </ReAnimated.View>
    )

    const renderCancelForm = () => (
        <Modal visible={showCancelForm} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.cancelModal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Cancel Order</Text>
                        <TouchableOpacity onPress={() => setShowCancelForm(false)} activeOpacity={0.7}>
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalSubtitle}>Please select a reason for cancellation:</Text>

                    <ScrollView style={styles.reasonsList} showsVerticalScrollIndicator={false}>
                        {CANCELLATION_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[styles.reasonOption, cancelReason === reason && styles.reasonOptionSelected]}
                                onPress={() => setCancelReason(reason)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.radioButton, cancelReason === reason && styles.radioButtonSelected]}>
                                    {cancelReason === reason && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={[styles.reasonText, cancelReason === reason && styles.reasonTextSelected]}>{reason}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {cancelReason === "Other" && (
                        <TextInput
                            style={styles.customReasonInput}
                            placeholder="Please specify your reason..."
                            value={customReason}
                            onChangeText={setCustomReason}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowCancelForm(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalCancelText}>Keep Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalConfirmButton, !cancelReason && styles.modalConfirmButtonDisabled]}
                            onPress={handleCancelOrder}
                            disabled={!cancelReason}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.modalConfirmText}>Cancel Order</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const handleCloseRating = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowRatingBottomSheet(false)
        })
    }

    const renderRatingBottomSheet = () => {
        if (!showRatingBottomSheet) return null

        return (
            <Modal transparent visible={showRatingBottomSheet} animationType="none">
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={styles.bottomSheetBackdrop} onPress={handleCloseRating} />
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.bottomSheetHeader}>
                            <TouchableOpacity onPress={handleCloseRating} style={styles.headerButton}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.bottomSheetTitle}>Rate Product</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        <ScrollView style={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
                            {selectedProduct && (
                                <View style={styles.ratingProductInfo}>
                                    <Image source={{ uri: selectedProduct.product.images[0] }} style={styles.ratingProductImage} />
                                    <Text style={styles.ratingProductTitle}>{selectedProduct.product.title}</Text>
                                </View>
                            )}

                            <View style={styles.ratingSection}>
                                <Text style={styles.ratingLabel}>Your Rating</Text>
                                {renderStars(rating, 32, true, setRating)}
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Your Review</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Share your thoughts about this product..."
                                    value={reviewComment}
                                    onChangeText={setReviewComment}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.bottomSheetFooter}>
                            <TouchableOpacity
                                style={[styles.bottomSheetSubmitButton, rating === 0 && styles.bottomSheetSubmitButtonDisabled]}
                                onPress={handleSubmitRating}
                                disabled={rating === 0}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.bottomSheetSubmitText}>Submit Review</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Text>Please login to view order details</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {renderHeader()}

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {renderOrderItems()}
                {renderOrderProgress()}
                {renderShippingInfo()}
                {renderActionButtons()}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {renderCancelForm()}
            {renderRatingBottomSheet()}

            <CustomAlert
                visible={showCancelAlert}
                type="warning"
                title="Cancel Order"
                message={`Are you sure you want to cancel this order? This action cannot be undone.`}
                primaryButton={{
                    text: "Yes, Cancel",
                    onPress: confirmCancelOrder,
                    style: "destructive",
                }}
                secondaryButton={{
                    text: "Keep Order",
                    onPress: () => setShowCancelAlert(false),
                }}
            />
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
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
    },
    headerSpacer: {
        width: 32,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        padding: 16,
        paddingBottom: 8,
    },
    // Order Info Header
    orderInfoHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    orderInfoLeft: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 14,
        color: "#6B7280",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    // Order Items Styles
    itemsHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    itemsHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    productImages: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
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
    itemsInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    itemSubtitle: {
        fontSize: 12,
        color: "#6B7280",
    },
    itemsContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    orderItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: "#F3F4F6",
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1F2937",
        marginBottom: 4,
    },
    itemDetails: {
        flexDirection: "row",
        gap: 12,
    },
    itemMeta: {
        fontSize: 12,
        color: "#6B7280",
    },
    itemActions: {
        alignItems: "flex-end",
        gap: 8,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1F2937",
    },
    rateProductButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#FFFBEB",
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    rateProductButtonRated: {
        backgroundColor: "#ECFDF5",
        borderColor: "#A7F3D0",
    },
    rateProductButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#F59E0B",
    },
    rateProductButtonTextRated: {
        color: "#10B981",
    },
    // Progress Styles
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressStep: {
        flexDirection: "row",
        alignItems: "flex-start",
        minHeight: 60,
    },
    progressLeft: {
        alignItems: "center",
        marginRight: 16,
    },
    progressIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    progressIconCompleted: {
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },
    progressIconCurrent: {
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
    },
    progressIconPending: {
        backgroundColor: "#F9FAFB",
        borderColor: "#E5E7EB",
        opacity: 0.6,
    },
    progressIconCanceled: {
        backgroundColor: "#EF4444",
        borderColor: "#EF4444",
    },
    progressLine: {
        width: 2,
        flex: 1,
        backgroundColor: "#E5E7EB",
        marginTop: 8,
    },
    progressLineCompleted: {
        backgroundColor: "#10B981",
    },
    progressLinePending: {
        backgroundColor: "#E5E7EB",
        opacity: 0.4,
    },
    progressLineCanceled: {
        backgroundColor: "#EF4444",
    },
    progressContent: {
        flex: 1,
        paddingTop: 4,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 4,
    },
    progressTitleCompleted: {
        color: "#1F2937",
    },
    progressTitleCurrent: {
        color: "#6366F1",
        fontWeight: "700",
    },
    progressTitlePending: {
        color: "#9CA3AF",
        opacity: 0.7,
    },
    progressTitleCanceled: {
        color: "#EF4444",
        fontWeight: "700",
    },
    progressDescription: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 16,
        marginBottom: 4,
    },
    progressDescriptionPending: {
        opacity: 0.5,
    },
    progressDescriptionCanceled: {
        color: "#EF4444",
    },
    progressTime: {
        fontSize: 11,
        color: "#9CA3AF",
    },
    // Shipping Info Styles
    shippingContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    shippingItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    shippingDetails: {
        marginLeft: 12,
        flex: 1,
    },
    shippingLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 4,
    },
    shippingValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    shippingAddress: {
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 16,
    },
    // Action Buttons Styles
    actionButtons: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    cancelButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#EF4444",
    },
    canceledContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    canceledText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#EF4444",
    },
    noActionsContainer: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 20,
    },
    noActionsText: {
        fontSize: 14,
        color: "#9CA3AF",
        fontStyle: "italic",
        textAlign: "center",
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    cancelModal: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 20,
    },
    reasonsList: {
        maxHeight: 280,
        marginBottom: 20,
    },
    reasonOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    reasonOptionSelected: {
        borderColor: "#6366F1",
        backgroundColor: "#EEF2FF",
    },
    radioButton: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    radioButtonSelected: {
        borderColor: "#6366F1",
    },
    radioButtonInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6366F1",
    },
    reasonText: {
        fontSize: 14,
        color: "#374151",
        flex: 1,
    },
    reasonTextSelected: {
        color: "#6366F1",
        fontWeight: "500",
    },
    customReasonInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: "#1F2937",
        marginBottom: 20,
        minHeight: 80,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    modalConfirmButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        alignItems: "center",
    },
    modalConfirmButtonDisabled: {
        backgroundColor: "#E5E7EB",
    },
    modalConfirmText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    // Bottom Sheet Styles
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    bottomSheetBackdrop: {
        flex: 1,
    },
    bottomSheet: {
        height: SCREEN_HEIGHT * 0.75,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    bottomSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerButton: {
        padding: 4,
        minWidth: 40,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    bottomSheetContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    bottomSheetFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        backgroundColor: "#fff",
    },
    bottomSheetSubmitButton: {
        paddingVertical: 16,
        backgroundColor: "#6366F1",
        borderRadius: 12,
        alignItems: "center",
    },
    bottomSheetSubmitButtonDisabled: {
        backgroundColor: "#E5E7EB",
    },
    bottomSheetSubmitText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    ratingProductInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    ratingProductImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#F3F4F6",
    },
    ratingProductTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
    },
    ratingSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 8,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1F2937",
        minHeight: 100,
    },
    bottomSpacing: {
        height: 20,
    },
})

