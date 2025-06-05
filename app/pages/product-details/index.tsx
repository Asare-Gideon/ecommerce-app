"use client"

import { useTheme } from "@/constants/theme"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import { useWishlist } from "@/hooks/useWishlist"
import { Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"


const { width, height } = Dimensions.get("window")
const THUMBNAIL_SIZE = 80
const MAIN_IMAGE_HEIGHT = height * 0.5

export default function ProductDetailsScreen() {
    const { productId } = useLocalSearchParams()
    const { colors } = useTheme()
    const { addToCart } = useCart()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const { product, fetchProductById, isLoading } = useProducts()

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedSize, setSelectedSize] = useState<string>("")
    const [selectedColor, setSelectedColor] = useState<string>("")
    const [quantity, setQuantity] = useState(1)


    useEffect(() => {
        fetchProductById(productId as string)
    }, [])


    const scrollY = useRef(new Animated.Value(0)).current

    // Fetch product data

    const isWishlisted = product ? isInWishlist(product._id) : false

    const handleWishlistToggle = () => {
        if (product) {
            toggleWishlist(product)
        }
    }

    const handleAddToCart = () => {
        if (product && selectedSize && selectedColor) {
            addToCart(product, quantity)
            console.log(`Added ${quantity} ${product.title} to cart - Size: ${selectedSize}, Color: ${selectedColor}`)
        }
    }

    const handleImageSelect = (index: number) => {
        setSelectedImageIndex(index)
    }

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change
        if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
            setQuantity(newQuantity)
        }
    }

    const calculateAverageRating = () => {
        if (!product?.ratings.length) return 0
        const sum = product.ratings.reduce((acc, rating) => acc + rating.rating, 0)
        return (sum / product.ratings.length).toFixed(1)
    }

    const getOriginalPrice = () => {
        // Simulate original price (20% higher than current price)
        return Math.round(product!.price * 1.2)
    }

    if (isLoading) {
        return <ProductDetailsShimmer />
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
                    <Text style={styles.errorText}>Product not found</Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    const averageRating = calculateAverageRating()
    const originalPrice = getOriginalPrice()

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Product Details</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/cart" as any)}>
                    <Ionicons name="bag-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {/* Image Gallery */}
                <View style={styles.imageGallery}>
                    {/* Thumbnail Images */}
                    <View style={styles.thumbnailContainer}>
                        {product.images.map((image, index) => (
                            <TouchableOpacity
                                key={image.name}
                                style={[styles.thumbnail, selectedImageIndex === index && styles.selectedThumbnail]}
                                onPress={() => handleImageSelect(index)}
                            >
                                <Image source={{ uri: image.url }} style={styles.thumbnailImage} resizeMode="cover" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Main Image */}
                    <View style={styles.mainImageContainer}>
                        <Image
                            source={{ uri: product.images[selectedImageIndex]?.url }}
                            style={styles.mainImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    {/* Brand and Rating */}
                    <View style={styles.brandRatingContainer}>
                        <Text style={styles.brandText}>{product.brand}</Text>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color="#FFA500" />
                            <Text style={styles.ratingText}>
                                {averageRating} ({product.ratings.length})
                            </Text>
                        </View>
                    </View>

                    {/* Product Title */}
                    <Text style={styles.productTitle}>{product.title}</Text>

                    {/* Price and Quantity */}
                    <View style={styles.priceQuantityContainer}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Price:</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.currentPrice}>{product.price}</Text>
                                <Text style={styles.originalPrice}>${originalPrice}</Text>
                            </View>
                        </View>

                        <View style={styles.quantityContainer}>
                            <Text style={styles.quantityLabel}>Quantity:</Text>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    <Ionicons name="remove" size={20} color={quantity <= 1 ? "#CCC" : "#000"} />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => handleQuantityChange(1)}
                                    disabled={quantity >= product.quantity}
                                >
                                    <Ionicons name="add" size={20} color={quantity >= product.quantity ? "#CCC" : "#000"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Size Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.selectionTitle}>Items Size:</Text>
                        <View style={styles.sizeContainer}>
                            {product.sizes.map((size) => (
                                <TouchableOpacity
                                    key={size}
                                    style={[styles.sizeButton, selectedSize === size && styles.selectedSizeButton]}
                                    onPress={() => setSelectedSize(size)}
                                >
                                    <Text style={[styles.sizeText, selectedSize === size && styles.selectedSizeText]}>{size}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Color Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.selectionTitle}>Items Color:</Text>
                        <View style={styles.colorContainer}>
                            {product.colors.map((color, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorButton,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={styles.descriptionTitle}>Description:</Text>
                        <Text style={styles.descriptionText}>{product.description}</Text>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.additionalInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Category:</Text>
                            <Text style={styles.infoValue}>
                                {typeof product.category === "string" ? product.category : product.category.name}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>In Stock:</Text>
                            <Text style={styles.infoValue}>{product.quantity} items</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Sold:</Text>
                            <Text style={styles.infoValue}>{product.sold} items</Text>
                        </View>
                    </View>

                    {/* Bottom Spacing for Fixed Button */}
                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>

            {/* Fixed Add to Cart Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                    style={[styles.addToCartButton, (!selectedSize || !selectedColor) && styles.disabledButton]}
                    onPress={handleAddToCart}
                    disabled={!selectedSize || !selectedColor}
                >
                    <Ionicons name="bag-add" size={20} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.addToCartText}>Add To Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

// Shimmer Loading Component
function ProductDetailsShimmer() {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        )

        shimmerAnimation.start()
        return () => shimmerAnimation.stop()
    }, [])

    const shimmerOpacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    })

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header Shimmer */}
            <View style={styles.header}>
                <View style={styles.shimmerHeaderButton} />
                <Animated.View style={[styles.shimmerHeaderTitle, { opacity: shimmerOpacity }]} />
                <View style={styles.shimmerHeaderButton} />
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Image Gallery Shimmer */}
                <View style={styles.imageGallery}>
                    <View style={styles.thumbnailContainer}>
                        {[1, 2, 3, 4].map((item) => (
                            <Animated.View key={item} style={[styles.shimmerThumbnail, { opacity: shimmerOpacity }]} />
                        ))}
                    </View>
                    <Animated.View style={[styles.shimmerMainImage, { opacity: shimmerOpacity }]} />
                </View>

                {/* Product Info Shimmer */}
                <View style={styles.productInfo}>
                    <Animated.View style={[styles.shimmerBrand, { opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.shimmerTitle, { opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.shimmerPrice, { opacity: shimmerOpacity }]} />
                    <Animated.View style={[styles.shimmerDescription, { opacity: shimmerOpacity }]} />
                </View>
            </ScrollView>

            {/* Fixed Button Shimmer */}
            <View style={styles.fixedButtonContainer}>
                <Animated.View style={[styles.shimmerButton, { opacity: shimmerOpacity }]} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    scrollView: {
        flex: 1,
    },
    imageGallery: {
        flexDirection: "row",
        height: MAIN_IMAGE_HEIGHT,
        backgroundColor: "#F8F9FA",
    },
    thumbnailContainer: {
        width: THUMBNAIL_SIZE + 20,
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    thumbnail: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "transparent",
        overflow: "hidden",
    },
    selectedThumbnail: {
        borderColor: "#000",
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
    },
    mainImageContainer: {
        flex: 1,
        paddingRight: 20,
        paddingVertical: 20,
    },
    mainImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    productInfo: {
        padding: 20,
    },
    brandRatingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    brandText: {
        fontSize: 16,
        color: "#E74C3C",
        fontWeight: "500",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: 16,
        color: "#666",
        marginLeft: 4,
    },
    productTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 20,
        lineHeight: 24,
    },
    priceQuantityContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 16,
        color: "#000",
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: "700",
        color: "#E74C3C",
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 18,
        color: "#999",
        textDecorationLine: "line-through",
    },
    quantityContainer: {
        flex: 1,
        alignItems: "flex-end",
    },
    quantityLabel: {
        fontSize: 16,
        color: "#000",
        marginBottom: 8,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
    },
    quantityButton: {
        padding: 12,
        minWidth: 44,
        alignItems: "center",
    },
    quantityText: {
        fontSize: 18,
        fontWeight: "600",
        paddingHorizontal: 20,
        minWidth: 40,
        textAlign: "center",
    },
    selectionSection: {
        marginBottom: 30,
    },
    selectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    sizeContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    sizeButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        backgroundColor: "#FFF",
    },
    selectedSizeButton: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    sizeText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
    },
    selectedSizeText: {
        color: "#FFF",
    },
    colorContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: "transparent",
    },
    selectedColorButton: {
        borderColor: "#000",
    },
    descriptionSection: {
        marginBottom: 30,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#666",
    },
    additionalInfo: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    infoLabel: {
        fontSize: 14,
        color: "#666",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    bottomSpacing: {
        height: 100,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    addToCartButton: {
        backgroundColor: "#000",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 8,
    },
    disabledButton: {
        backgroundColor: "#CCC",
    },
    buttonIcon: {
        marginRight: 8,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFF",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#FFF",
    },
    // Shimmer Styles
    shimmerHeaderButton: {
        width: 40,
        height: 40,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
    shimmerHeaderTitle: {
        width: 120,
        height: 20,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    shimmerThumbnail: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        marginBottom: 10,
    },
    shimmerMainImage: {
        flex: 1,
        backgroundColor: "#E0E0E0",
        borderRadius: 12,
        marginRight: 20,
        marginVertical: 20,
    },
    shimmerBrand: {
        width: 100,
        height: 16,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginBottom: 8,
    },
    shimmerTitle: {
        width: "80%",
        height: 24,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginBottom: 20,
    },
    shimmerPrice: {
        width: 120,
        height: 20,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginBottom: 30,
    },
    shimmerDescription: {
        width: "100%",
        height: 60,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
    },
    shimmerButton: {
        width: "100%",
        height: 48,
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
    },
})

