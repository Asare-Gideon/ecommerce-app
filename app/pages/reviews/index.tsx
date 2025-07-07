"use client"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import { ArrowLeft, Package, Star, User, X } from "lucide-react-native"
import { useEffect, useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    FlatList,
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
import ReAnimated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Mock reviews data
const MOCK_REVIEWS = [
    {
        _id: "rev1",
        user: {
            _id: "user1",
            firstName: "Sarah",
            lastName: "Johnson",
            avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&size=40&background=6366F1&color=fff",
        },
        product: {
            _id: "prod1",
            title: "Wireless Bluetooth Headphones",
            images: ["https://via.placeholder.com/60x60/FF6B6B/fff?text=WH"],
        },
        rating: 5,
        title: "Excellent sound quality!",
        comment:
            "These headphones exceeded my expectations. The sound quality is crystal clear and the battery life is amazing. Highly recommend!",
        images: [
            "https://via.placeholder.com/80x80/FF6B6B/fff?text=IMG1",
            "https://via.placeholder.com/80x80/4ECDC4/fff?text=IMG2",
        ],
        helpful: 12,
        unhelpful: 1,
        verified: true,
        createdAt: "2024-01-10T10:30:00Z",
    },
    {
        _id: "rev2",
        user: {
            _id: "user2",
            firstName: "Mike",
            lastName: "Chen",
            avatar: "https://ui-avatars.com/api/?name=Mike+Chen&size=40&background=10B981&color=fff",
        },
        product: {
            _id: "prod2",
            title: "Phone Case Premium",
            images: ["https://via.placeholder.com/60x60/4ECDC4/fff?text=PC"],
        },
        rating: 4,
        title: "Good protection",
        comment: "Solid case that provides good protection. The material feels premium but it's a bit bulky for my taste.",
        images: [],
        helpful: 8,
        unhelpful: 2,
        verified: true,
        createdAt: "2024-01-08T15:20:00Z",
    },
    {
        _id: "rev3",
        user: {
            _id: "user3",
            firstName: "Emma",
            lastName: "Davis",
            avatar: "https://ui-avatars.com/api/?name=Emma+Davis&size=40&background=F59E0B&color=fff",
        },
        product: {
            _id: "prod3",
            title: "USB-C Cable",
            images: ["https://via.placeholder.com/60x60/45B7D1/fff?text=UC"],
        },
        rating: 3,
        title: "Average quality",
        comment: "Works as expected but nothing special. The cable is sturdy enough for daily use.",
        images: [],
        helpful: 3,
        unhelpful: 0,
        verified: false,
        createdAt: "2024-01-05T09:15:00Z",
    },
]

// Mock orders to rate
const MOCK_ORDERS_TO_RATE = [
    {
        _id: "ord1",
        products: [
            {
                product: {
                    _id: "prod4",
                    title: "Power Bank 20000mAh",
                    images: ["https://via.placeholder.com/60x60/8B5CF6/fff?text=PB"],
                    price: 49.99,
                },
                quantity: 1,
            },
            {
                product: {
                    _id: "prod5",
                    title: "Wireless Charger",
                    images: ["https://via.placeholder.com/60x60/EF4444/fff?text=WC"],
                    price: 29.99,
                },
                quantity: 1,
            },
        ],
        totalAmount: 79.98,
        deliveredAt: "2024-01-12T14:30:00Z",
        status: "delivered",
    },
    {
        _id: "ord2",
        products: [
            {
                product: {
                    _id: "prod6",
                    title: "Bluetooth Speaker",
                    images: ["https://via.placeholder.com/60x60/F97316/fff?text=BS"],
                    price: 89.99,
                },
                quantity: 1,
            },
        ],
        totalAmount: 89.99,
        deliveredAt: "2024-01-08T16:45:00Z",
        status: "delivered",
    },
]

type TabType = "reviews" | "my-orders"
type FilterType = "all" | "5" | "4" | "3" | "2" | "1"

const FILTER_OPTIONS = [
    { key: "all" as FilterType, label: "All Reviews" },
    { key: "5" as FilterType, label: "5 Stars" },
    { key: "4" as FilterType, label: "4 Stars" },
    { key: "3" as FilterType, label: "3 Stars" },
    { key: "2" as FilterType, label: "2 Stars" },
    { key: "1" as FilterType, label: "1 Star" },
]

export default function ReviewsRatingScreen() {
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>("reviews")
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all")
    const [showRatingBottomSheet, setShowRatingBottomSheet] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [rating, setRating] = useState(0)
    const [reviewComment, setReviewComment] = useState("")

    // Use React Native's Animated API like in your working component
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

    const translateX = useSharedValue(0)
    const scrollViewRef = useRef<ScrollView>(null)

    const tabs: { key: TabType; label: string }[] = [
        { key: "reviews", label: "All Reviews" },
        { key: "my-orders", label: "My Orders to Rate" },
    ]

    const tabIndicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        width: ((width - 48) / 2) * 0.6,
    }))

    const handleTabPress = (tab: TabType, index: number) => {
        setActiveTab(tab)
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true })
        const tabWidth = (width - 48) / 2
        translateX.value = withSpring(index * tabWidth + tabWidth * 0.2, {
            damping: 20,
            stiffness: 200,
        })
    }

    const handleRateOrder = (order: any, product: any) => {
        console.log("Rate button pressed!", { order: order._id, product: product._id })
        console.log("Setting showRatingBottomSheet to true")
        setSelectedOrder(order)
        setSelectedProduct(product)
        setShowRatingBottomSheet(true)
    }

    const handleSubmitRating = () => {
        if (rating === 0) return
        console.log("Rating submitted:", {
            orderId: selectedOrder._id,
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

    const filteredReviews = MOCK_REVIEWS.filter((review) => {
        const matchesFilter = selectedFilter === "all" || review.rating.toString() === selectedFilter
        return matchesFilter
    })

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

    const renderReviewItem = ({ item }: { item: any }) => (
        <ReAnimated.View entering={FadeInUp.springify()} style={styles.reviewCard}>
            {/* Review Header */}
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                    <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
                    <View style={styles.userDetails}>
                        <View style={styles.userNameRow}>
                            <Text style={styles.userName}>
                                {item.user.firstName} {item.user.lastName}
                            </Text>
                            {item.verified && (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>Verified</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.reviewDate}>
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </Text>
                    </View>
                </View>
                {renderStars(item.rating)}
            </View>
            {/* Product Info */}
            <View style={styles.productInfo}>
                <Image source={{ uri: item.product.images[0] }} style={styles.productImage} />
                <Text style={styles.productTitle} numberOfLines={1}>
                    {item.product.title}
                </Text>
            </View>
            {/* Review Content */}
            <View style={styles.reviewContent}>
                {item.title && <Text style={styles.reviewTitle}>{item.title}</Text>}
                <Text style={styles.reviewComment}>{item.comment}</Text>
            </View>
        </ReAnimated.View>
    )

    const renderOrderToRate = ({ item }: { item: any }) => (
        <ReAnimated.View entering={FadeInUp.springify()} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{item._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                        Delivered{" "}
                        {new Date(item.deliveredAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })}
                    </Text>
                </View>
                <View style={styles.orderTotal}>
                    <Text style={styles.totalAmount}>${item.totalAmount.toFixed(2)}</Text>
                </View>
            </View>
            <View style={styles.orderProducts}>
                {item.products.map((productItem: any) => (
                    <View key={productItem.product._id} style={styles.productToRate}>
                        <View style={styles.productToRateInfo}>
                            <Image source={{ uri: productItem.product.images[0] }} style={styles.productToRateImage} />
                            <View style={styles.productToRateDetails}>
                                <Text style={styles.productToRateTitle} numberOfLines={2}>
                                    {productItem.product.title}
                                </Text>
                                <Text style={styles.productToRatePrice}>
                                    ${productItem.product.price.toFixed(2)} × {productItem.quantity}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.rateButton}
                            onPress={() => handleRateOrder(item, productItem)}
                            activeOpacity={0.6}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Star size={16} color="#F59E0B" />
                            <Text style={styles.rateButtonText}>Rate</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ReAnimated.View>
    )

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reviews & Ratings</Text>
            <View />
        </ReAnimated.View>
    )

    const renderTabBar = () => (
        <ReAnimated.View entering={FadeInDown.delay(100).springify()} style={styles.tabContainer}>
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
            <ReAnimated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
        </ReAnimated.View>
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
            <Modal
                transparent
                visible={showRatingBottomSheet}
                animationType="none"
                statusBarTranslucent={true}
                presentationStyle="overFullScreen"
            >
                <View style={styles.bottomSheetOverlay}>
                    <TouchableOpacity style={styles.bottomSheetBackdrop} onPress={handleCloseRating} activeOpacity={1} />
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

    const renderEmptyState = (type: "reviews" | "orders") => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                {type === "reviews" ? (
                    <Star size={50} color="#D1D5DB" strokeWidth={1.5} />
                ) : (
                    <Package size={50} color="#D1D5DB" strokeWidth={1.5} />
                )}
            </View>
            <Text style={styles.emptyTitle}>{type === "reviews" ? "No reviews found" : "No orders to rate"}</Text>
            <Text style={styles.emptyText}>
                {type === "reviews" ? "Try adjusting your filter criteria" : "Complete some orders to rate your purchases"}
            </Text>
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
                    <Text style={styles.authTitle}>Sign in to view reviews</Text>
                    <Text style={styles.authText}>
                        Create an account or sign in to read reviews{"\n"}
                        and rate your purchases
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
            {renderTabBar()}

            {/* Replace horizontal ScrollView with conditional rendering */}
            <View style={styles.contentContainer}>
                {activeTab === "reviews" ? (
                    <View style={styles.tabContent}>
                        {filteredReviews.length > 0 ? (
                            <FlatList
                                data={filteredReviews}
                                renderItem={renderReviewItem}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={styles.reviewsList}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="handled"
                            />
                        ) : (
                            renderEmptyState("reviews")
                        )}
                    </View>
                ) : (
                    <View style={styles.tabContent}>
                        {MOCK_ORDERS_TO_RATE.length > 0 ? (
                            <FlatList
                                data={MOCK_ORDERS_TO_RATE}
                                renderItem={renderOrderToRate}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={styles.ordersList}
                                showsVerticalScrollIndicator={false}
                                ItemSeparatorComponent={() => <View style={styles.orderSeparator} />}
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="handled"
                            />
                        ) : (
                            renderEmptyState("orders")
                        )}

                        {renderRatingBottomSheet()}
                    </View>
                )}

            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerSpacer: {
        width: 32,
    },
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
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
    },
    tabContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    tabBar: {
        flexDirection: "row",
        paddingTop: 16,
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
        flex: 1,
    },
    reviewsList: {
        padding: 16,
        paddingBottom: 100,
    },
    ordersList: {
        padding: 16,
        paddingBottom: 100,
    },
    reviewCard: {
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
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    reviewUserInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    userName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    verifiedBadge: {
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    verifiedText: {
        fontSize: 10,
        fontWeight: "500",
        color: "#10B981",
    },
    reviewDate: {
        fontSize: 12,
        color: "#6B7280",
    },
    starsContainer: {
        flexDirection: "row",
        gap: 2,
    },
    productInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    productImage: {
        width: 32,
        height: 32,
        borderRadius: 6,
        marginRight: 8,
        backgroundColor: "#F3F4F6",
    },
    productTitle: {
        fontSize: 13,
        color: "#6B7280",
        flex: 1,
    },
    reviewContent: {
        marginBottom: 16,
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
    },
    reviewComment: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 12,
    },
    reviewSeparator: {
        height: 12,
    },
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
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    orderInfo: {
        flex: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: "#6B7280",
    },
    orderTotal: {
        alignItems: "flex-end",
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
    },
    orderProducts: {
        gap: 12,
    },
    productToRate: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    productToRateInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    productToRateImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: "#F3F4F6",
    },
    productToRateDetails: {
        flex: 1,
    },
    productToRateTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1F2937",
        marginBottom: 4,
    },
    productToRatePrice: {
        fontSize: 12,
        color: "#6B7280",
    },
    rateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#FFFBEB",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FDE68A",
        minWidth: 80,
        justifyContent: "center",
    },
    rateButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#F59E0B",
    },
    orderSeparator: {
        height: 12,
    },
    // Bottom Sheet Styles
    bottomSheetOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        zIndex: 9999,
    },
    bottomSheetBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
    },
    bottomSheet: {
        height: SCREEN_HEIGHT * 0.75,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10000,
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
        marginTop: 7
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

