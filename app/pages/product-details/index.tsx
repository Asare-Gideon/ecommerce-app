"use client"

import { useTheme } from "@/constants/theme"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import { useWishlist } from "@/hooks/useWishlist"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
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
import { WebView } from "react-native-webview"

const { width, height } = Dimensions.get("window")
const THUMBNAIL_SIZE = 48
const MAIN_IMAGE_HEIGHT = height * 0.5

export default function ProductDetailsScreen() {
    const { productId } = useLocalSearchParams()
    const { colors } = useTheme()
    const { addToCart } = useCart()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const { product, fetchProductById, isLoading, products, fetchProducts } = useProducts()

    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [selectedSize, setSelectedSize] = useState<string>("")
    const [selectedColor, setSelectedColor] = useState<string>("")
    const [quantity, setQuantity] = useState(1)
    const [webViewHeight, setWebViewHeight] = useState(150)
    const [heightCalculated, setHeightCalculated] = useState(false)
    const [showFullDescription, setShowFullDescription] = useState(false)

    // Animation values
    const sizeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current
    const colorAnimations = useRef<{ [key: string]: Animated.Value }>({}).current
    const addToCartScale = useRef(new Animated.Value(1)).current

    useEffect(() => {
        fetchProductById(productId as string)
        fetchProducts() // Fetch all products for similar products
    }, [])

    useEffect(() => {
        if (product) {
            // Reset height calculation when product changes
            setHeightCalculated(false)
            setWebViewHeight(150)

            // Initialize animations for sizes
            product.sizes.forEach((size) => {
                if (!sizeAnimations[size]) {
                    sizeAnimations[size] = new Animated.Value(0)
                }
            })

            // Initialize animations for colors
            product.colors.forEach((color, index) => {
                if (!colorAnimations[color]) {
                    colorAnimations[color] = new Animated.Value(0)
                }
            })
        }
    }, [product])

    const scrollY = useRef(new Animated.Value(0)).current
    const isWishlisted = product ? isInWishlist(product._id) : false

    const handleWishlistToggle = () => {
        if (product) {
            toggleWishlist(product)
        }
    }

    const handleAddToCart = () => {
        if (product && selectedSize) {
            // Only require size, not color
            // Animate button press
            Animated.sequence([
                Animated.timing(addToCartScale, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(addToCartScale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start()

            addToCart(product, quantity)
            console.log(
                `Added ${quantity} ${product.title} to cart - Size: ${selectedSize}, Color: ${selectedColor || "Default"}`,
            )
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

    const handleSizeSelect = (size: string) => {
        setSelectedSize(size)

        // Animate selection
        Object.keys(sizeAnimations).forEach((s) => {
            Animated.timing(sizeAnimations[s], {
                toValue: s === size ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start()
        })
    }

    const handleColorSelect = (color: string) => {
        setSelectedColor(color)

        // Animate selection
        Object.keys(colorAnimations).forEach((c) => {
            Animated.timing(colorAnimations[c], {
                toValue: c === color ? 1 : 0,
                duration: 200,
                useNativeDriver: false,
            }).start()
        })
    }

    const calculateAverageRating = () => {
        if (!product?.ratings.length) return 0
        const sum = product.ratings.reduce((acc, rating) => acc + rating.rating, 0)
        return (sum / product.ratings.length).toFixed(1)
    }

    const getOriginalPrice = () => {
        return Math.round(product!.price * 1.2)
    }

    const getDiscountPercentage = () => {
        if (!product) return 0
        const originalPrice = getOriginalPrice()
        return Math.round(((originalPrice - product.price) / originalPrice) * 100)
    }

    // Function to determine if color is light (for checkmark color)
    const isLightColor = (color: string) => {
        const lightColors = [
            "white",
            "yellow",
            "cyan",
            "lime",
            "lightblue",
            "lightgreen",
            "lightyellow",
            "lightcyan",
            "lightgray",
            "lightgrey",
            "beige",
            "ivory",
            "snow",
        ]
        return (
            lightColors.some((lightColor) => color.toLowerCase().includes(lightColor)) ||
            color.toLowerCase() === "#ffffff" ||
            color.toLowerCase() === "#fff" ||
            (color.toLowerCase().startsWith("#f") && color.length === 7)
        )
    }

    // Get similar products (same category, excluding current product)
    const getSimilarProducts = () => {
        if (!product || !products) return []
        return products
            .filter(
                (p) =>
                    p._id !== product._id &&
                    (typeof product.category === "string"
                        ? p.category === product.category
                        : p.category === product.category._id || p.category.name === product.category.name),
            )
            .slice(0, 10) // Limit to 10 similar products
    }

    // Enhanced HTML content for WebView with better height calculation
    const getHTMLContent = (description: string) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        overflow-x: hidden;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 15px;
                        line-height: 1.6;
                        color: ${colors.text};
                        background-color: transparent;
                        padding: 8px 0;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    p { 
                        margin: 0 0 8px 0; 
                        word-wrap: break-word;
                    }
                    h1, h2, h3, h4, h5, h6 { 
                        color: ${colors.text}; 
                        margin: 12px 0 6px 0;
                        font-weight: 600;
                        word-wrap: break-word;
                    }
                    ul, ol { 
                        margin: 6px 0; 
                        padding-left: 16px; 
                    }
                    li { 
                        margin: 2px 0; 
                        word-wrap: break-word;
                    }
                    a { 
                        color: ${colors.primary}; 
                        text-decoration: none; 
                        word-wrap: break-word;
                    }
                    strong, b { 
                        color: ${colors.text}; 
                    }
                    img { 
                        max-width: 100%; 
                        height: auto; 
                        display: block;
                    }
                    .content {
                        padding: 0;
                        margin: 0;
                        width: 100%;
                    }
                    /* Ensure no hidden content */
                    * {
                        max-width: 100% !important;
                    }
                </style>
            </head>
            <body>
                <div class="content">
                    ${description}
                </div>
                <script>
                    function calculateAndSendHeight() {
                        // Multiple height calculation methods
                        const bodyHeight = document.body.scrollHeight;
                        const documentHeight = document.documentElement.scrollHeight;
                        const contentHeight = document.querySelector('.content').scrollHeight;
                        const offsetHeight = document.body.offsetHeight;
                        
                        // Use the maximum height to ensure all content is visible
                        const maxHeight = Math.max(bodyHeight, documentHeight, contentHeight, offsetHeight);
                        
                        // Add extra padding to ensure no content is cut off
                        const finalHeight = maxHeight + 20;
                        
                        console.log('Heights:', {
                            bodyHeight,
                            documentHeight,
                            contentHeight,
                            offsetHeight,
                            finalHeight
                        });
                        
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'height',
                            height: finalHeight
                        }));
                    }
                    
                    // Calculate height multiple times with different delays
                    function scheduleHeightCalculations() {
                        calculateAndSendHeight();
                        setTimeout(calculateAndSendHeight, 100);
                        setTimeout(calculateAndSendHeight, 300);
                        setTimeout(calculateAndSendHeight, 500);
                        setTimeout(calculateAndSendHeight, 1000);
                        setTimeout(calculateAndSendHeight, 2000);
                    }
                    
                    // Start calculations when DOM is ready
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', scheduleHeightCalculations);
                    } else {
                        scheduleHeightCalculations();
                    }
                    
                    // Also calculate on window load
                    window.addEventListener('load', scheduleHeightCalculations);
                    
                    // Monitor for content changes
                    const observer = new MutationObserver(function(mutations) {
                        setTimeout(calculateAndSendHeight, 100);
                    });
                    
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        characterData: true
                    });
                    
                    // Handle image loads
                    document.addEventListener('load', function(e) {
                        if (e.target.tagName === 'IMG') {
                            setTimeout(calculateAndSendHeight, 100);
                        }
                    }, true);
                </script>
            </body>
            </html>
        `
    }

    const truncatedDescription = product?.description
        ? product.description.replace(/<[^>]*>/g, "").substring(0, 150) + "..."
        : ""

    if (isLoading) {
        return <ProductDetailsShimmer />
    }

    if (!product) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.gray[400]} />
                    <Text style={[styles.errorText, { color: colors.gray[600] }]}>Product not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <LinearGradient colors={[colors.primary, colors.primary]} style={styles.gradientButton}>
                            <Text style={styles.backButtonText}>Go Back</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    const averageRating = calculateAverageRating()
    const originalPrice = getOriginalPrice()
    const discountPercentage = getDiscountPercentage()
    const similarProducts = getSimilarProducts()
    const totalPrice = product.price * quantity

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                    <View style={[styles.headerButtonBackground, { backgroundColor: colors.gray[100] }]}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/cart" as any)}>
                    <View style={[styles.headerButtonBackground, { backgroundColor: colors.gray[100] }]}>
                        <Ionicons name="heart-outline" size={22} color={colors.text} />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                {/* Full Width Image Section */}
                <View style={styles.imageSection}>
                    <Image
                        source={{ uri: product.images[selectedImageIndex]?.url }}
                        style={styles.fullWidthImage}
                        resizeMode="cover"
                    />

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
                            <Text style={styles.discountText}>-{discountPercentage}%</Text>
                        </View>
                    )}

                    {/* Wishlist Button on Image */}
                    <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
                        <View
                            style={[
                                styles.wishlistButtonBackground,
                                { backgroundColor: colors.card },
                                isWishlisted && { backgroundColor: colors.error },
                            ]}
                        >
                            <Ionicons
                                name={isWishlisted ? "heart" : "heart-outline"}
                                size={22}
                                color={isWishlisted ? "#ffffff" : colors.gray[600]}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Image Thumbnails at Bottom */}
                    <View style={styles.thumbnailContainer}>
                        {product.images.map((image, index) => (
                            <TouchableOpacity
                                key={image.name}
                                style={[styles.thumbnail, selectedImageIndex === index && { borderColor: colors.primary }]}
                                onPress={() => handleImageSelect(index)}
                            >
                                <Image source={{ uri: image.url }} style={styles.thumbnailImage} resizeMode="cover" />
                                {selectedImageIndex === index && (
                                    <View style={[styles.thumbnailOverlay, { backgroundColor: colors.primary }]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.productInfo}>
                    {/* Brand and Rating */}
                    <View style={styles.brandRatingContainer}>
                        <View style={[styles.brandBadge, { backgroundColor: colors.primary + "20" }]}>
                            <Text style={[styles.brandText, { color: colors.primary }]}>{product.brand}</Text>
                        </View>
                        <View style={styles.ratingContainer}>
                            <View style={[styles.starBackground, { backgroundColor: colors.success }]}>
                                <Ionicons name="star" size={14} color="#ffffff" />
                            </View>
                            <Text style={[styles.ratingText, { color: colors.gray[600] }]}>
                                {averageRating} ({product.ratings.length})
                            </Text>
                        </View>
                    </View>

                    {/* Product Title */}
                    <Text style={[styles.productTitle, { color: colors.text }]}>{product.title}</Text>
                    <Text style={[styles.soldCount, { color: colors.gray[500] }]}>{product.sold} Sold</Text>

                    {/* Price and Quantity Row */}
                    <View style={styles.priceQuantityContainer}>
                        <View style={styles.priceContainer}>
                            <Text style={[styles.priceLabel, { color: colors.gray[600] }]}>Price</Text>
                            <View style={styles.priceRow}>
                                <Text style={[styles.currentPrice, { color: colors.primary }]}>₵{product.price.toLocaleString()}</Text>
                                <Text style={[styles.originalPrice, { color: colors.gray[400] }]}>
                                    ₵{originalPrice.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.quantityContainer}>
                            <Text style={[styles.quantityLabel, { color: colors.gray[600] }]}>Quantity</Text>
                            <View
                                style={[styles.quantityControls, { backgroundColor: colors.gray[100], borderColor: colors.border }]}
                            >
                                <TouchableOpacity
                                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                                    onPress={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.gray[400] : colors.text} />
                                </TouchableOpacity>
                                <View style={[styles.quantityDisplay, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.quantityButton, quantity >= product.quantity && styles.quantityButtonDisabled]}
                                    onPress={() => handleQuantityChange(1)}
                                    disabled={quantity >= product.quantity}
                                >
                                    <Ionicons
                                        name="add"
                                        size={18}
                                        color={quantity >= product.quantity ? colors.gray[400] : colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.stockText, { color: colors.gray[500] }]}>{product.quantity} items available</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.descriptionSection}>
                        <Text style={[styles.descriptionTitle, { color: colors.text }]}>Description</Text>
                        {showFullDescription ? (
                            <View style={[styles.descriptionContainer, { height: webViewHeight }]}>
                                <WebView
                                    source={{ html: getHTMLContent(product.description) }}
                                    style={styles.webView}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    onMessage={(event) => {
                                        try {
                                            const data = JSON.parse(event.nativeEvent.data)
                                            if (data.type === "height" && data.height > 0) {
                                                const newHeight = Math.max(data.height, 100)
                                                if (newHeight !== webViewHeight) {
                                                    setWebViewHeight(newHeight)
                                                    setHeightCalculated(true)
                                                }
                                            }
                                        } catch (error) {
                                            // Fallback for non-JSON messages
                                            const height = Number.parseInt(event.nativeEvent.data)
                                            if (height > 0 && height !== webViewHeight) {
                                                setWebViewHeight(Math.max(height + 20, 100))
                                                setHeightCalculated(true)
                                            }
                                        }
                                    }}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    startInLoadingState={false}
                                    onLoadEnd={() => {
                                        // Additional fallback if height calculation fails
                                        setTimeout(() => {
                                            if (!heightCalculated && webViewHeight <= 150) {
                                                // Estimate height based on content length
                                                const estimatedHeight = Math.max(product.description.length * 0.5, 200)
                                                setWebViewHeight(Math.min(estimatedHeight, 800))
                                            }
                                        }, 2000)
                                    }}
                                    onError={() => {
                                        // Fallback height on error
                                        setWebViewHeight(200)
                                    }}
                                />
                            </View>
                        ) : (
                            <Text style={[styles.descriptionText, { color: colors.gray[600] }]}>{truncatedDescription}</Text>
                        )}
                        <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                            <Text style={[styles.readMoreButton, { color: colors.primary }]}>
                                {showFullDescription ? "Read Less" : "Read More"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Size Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={[styles.selectionTitle, { color: colors.text }]}>Size</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sizeContainer}>
                            {product.sizes.map((size) => {
                                const animatedValue = sizeAnimations[size] || new Animated.Value(0)
                                const backgroundColor = animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [colors.card, colors.primary],
                                })
                                const textColor = animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [colors.text, "#ffffff"],
                                })

                                return (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => handleSizeSelect(size)}
                                        style={styles.sizeButtonContainer}
                                    >
                                        <Animated.View style={[styles.sizeButton, { backgroundColor, borderColor: colors.border }]}>
                                            <Animated.Text style={[styles.sizeText, { color: textColor }]}>{size}</Animated.Text>
                                        </Animated.View>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* Color Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={[styles.selectionTitle, { color: colors.text }]}>Colour</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorContainer}>
                            {product.colors.map((color, index) => {
                                const animatedValue = colorAnimations[color] || new Animated.Value(0)
                                const borderWidth = animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [2, 3],
                                })
                                const scale = animatedValue.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.05],
                                })

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleColorSelect(color)}
                                        style={styles.colorButtonContainer}
                                    >
                                        <Animated.View
                                            style={[
                                                styles.colorButton,
                                                {
                                                    backgroundColor: color.toLowerCase(),
                                                    borderWidth,
                                                    borderColor: selectedColor === color ? colors.primary : colors.border,
                                                    transform: [{ scale }],
                                                },
                                            ]}
                                        >
                                            {selectedColor === color && (
                                                <Ionicons name="checkmark" size={18} color={isLightColor(color) ? "#000000" : "#ffffff"} />
                                            )}
                                        </Animated.View>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.additionalInfo}>
                        <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + "15" }]}>
                                    <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.gray[600] }]}>Category</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {typeof product.category === "string" ? product.category : product.category.name}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                                <View style={[styles.infoIconContainer, { backgroundColor: colors.success + "15" }]}>
                                    <Ionicons name="cube-outline" size={18} color={colors.success} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.gray[600] }]}>In Stock</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{product.quantity} items</Text>
                                </View>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIconContainer, { backgroundColor: "#f59e0b15" }]}>
                                    <Ionicons name="trending-up-outline" size={18} color="#f59e0b" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.infoLabel, { color: colors.gray[600] }]}>Sold</Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>{product.sold} items</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <View style={styles.similarProductsSection}>
                            <Text style={[styles.similarProductsTitle, { color: colors.text }]}>Similar Products</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.similarProductsContainer}
                            >
                                {similarProducts.map((similarProduct) => (
                                    <TouchableOpacity
                                        key={similarProduct._id}
                                        style={[styles.similarProductCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={() => router.push(`/product/${similarProduct._id}` as any)}
                                    >
                                        <Image
                                            source={{ uri: similarProduct.images[0]?.url }}
                                            style={styles.similarProductImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.similarProductInfo}>
                                            <Text style={[styles.similarProductTitle, { color: colors.text }]} numberOfLines={2}>
                                                {similarProduct.title}
                                            </Text>
                                            <Text style={[styles.similarProductBrand, { color: colors.gray[600] }]}>
                                                {similarProduct.brand}
                                            </Text>
                                            <View style={styles.similarProductPriceRow}>
                                                <Text style={[styles.similarProductPrice, { color: colors.primary }]}>
                                                    ₵{similarProduct.price.toLocaleString()}
                                                </Text>
                                                <View style={styles.similarProductRating}>
                                                    <Ionicons name="star" size={12} color={colors.success} />
                                                    <Text style={[styles.similarProductRatingText, { color: colors.gray[500] }]}>
                                                        {similarProduct.ratings.length > 0
                                                            ? (
                                                                similarProduct.ratings.reduce((acc, r) => acc + r.rating, 0) /
                                                                similarProduct.ratings.length
                                                            ).toFixed(1)
                                                            : "0.0"}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Bottom Spacing for Fixed Button */}
                    <View style={styles.bottomSpacing} />
                </View>
            </ScrollView>

            {/* Fixed Bottom Section */}
            <View
                style={[styles.fixedButtonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <View style={styles.totalPriceSection}>
                    <Text style={[styles.totalPriceLabel, { color: colors.gray[600] }]}>Total Price</Text>
                    <Text style={[styles.totalPriceValue, { color: colors.text }]}>₵{totalPrice.toLocaleString()}</Text>
                </View>
                <Animated.View style={[styles.buyNowButtonContainer, { transform: [{ scale: addToCartScale }] }]}>
                    <TouchableOpacity
                        style={[styles.buyNowButton, !selectedSize && styles.disabledButton]}
                        onPress={handleAddToCart}
                        disabled={!selectedSize} // Only require size
                    >
                        <LinearGradient
                            colors={!selectedSize ? [colors.gray[400], colors.gray[500]] : ["#14B8A6", "#0D9488"]}
                            style={styles.buyNowGradient}
                        >
                            <Text style={styles.buyNowText}>Buy Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    )
}

// Shimmer Loading Component
function ProductDetailsShimmer() {
    const { colors } = useTheme()
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1200,
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
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header Shimmer */}
            <View style={[styles.header, { backgroundColor: colors.background, }]}>
                <Animated.View
                    style={[styles.shimmerHeaderButton, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                />
                <Animated.View
                    style={[styles.shimmerHeaderTitle, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                />
                <Animated.View
                    style={[styles.shimmerHeaderButton, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                />
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Image Shimmer */}
                <View style={styles.imageSection}>
                    <Animated.View
                        style={[styles.shimmerFullImage, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                    />
                    <View style={styles.thumbnailContainer}>
                        {[1, 2, 3, 4].map((item) => (
                            <Animated.View
                                key={item}
                                style={[styles.shimmerThumbnail, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                            />
                        ))}
                    </View>
                </View>

                {/* Product Info Shimmer */}
                <View style={styles.productInfo}>
                    <View style={styles.brandRatingContainer}>
                        <Animated.View
                            style={[styles.shimmerBrand, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                        />
                        <Animated.View
                            style={[styles.shimmerRating, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                        />
                    </View>
                    <Animated.View
                        style={[styles.shimmerTitle, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                    />
                    <Animated.View
                        style={[styles.shimmerPrice, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                    />
                    <Animated.View
                        style={[styles.shimmerDescription, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                    />
                </View>
            </ScrollView>

            {/* Fixed Button Shimmer */}
            <View
                style={[styles.fixedButtonContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <Animated.View
                    style={[styles.shimmerTotalPrice, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]}
                />
                <Animated.View style={[styles.shimmerButton, { backgroundColor: colors.gray[200], opacity: shimmerOpacity }]} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    headerButton: {
        padding: 4,
    },
    headerButtonBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    scrollView: {
        flex: 1,
    },
    imageSection: {
        position: "relative",
    },
    fullWidthImage: {
        width: width,
        height: MAIN_IMAGE_HEIGHT,
    },
    discountBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
    },
    discountText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    wishlistButton: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    wishlistButtonBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    thumbnailContainer: {
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
    },
    thumbnail: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.5)",
        position: "relative",
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
    },
    thumbnailOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    productInfo: {
        padding: 18,
    },
    brandRatingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    brandBadge: {
        paddingHorizontal: 18,
        paddingVertical: 4,
        borderRadius: 14,
    },
    brandText: {
        fontSize: 14,
        fontWeight: "600",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    starBackground: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 6,
    },
    ratingText: {
        fontSize: 15,
        fontWeight: "500",
    },
    productTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
        lineHeight: 28,
    },
    soldCount: {
        fontSize: 12,
        marginBottom: 16,
    },
    priceQuantityContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    priceContainer: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 15,
        marginBottom: 6,
        fontWeight: "500",
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    currentPrice: {
        fontSize: 24,
        fontWeight: "700",
        marginRight: 10,
    },
    originalPrice: {
        fontSize: 16,
        textDecorationLine: "line-through",
    },
    quantityContainer: {
        flex: 1,
        alignItems: "flex-end",
        marginTop: -40
    },
    quantityLabel: {
        fontSize: 15,
        marginBottom: 10,
        fontWeight: "500",
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 4,
    },
    quantityButton: {
        padding: 10,
        minWidth: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityButtonDisabled: {
        opacity: 0.5,
    },
    quantityDisplay: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 3,
        minWidth: 42,
        alignItems: "center",
    },
    quantityText: {
        fontSize: 16,
        fontWeight: "600",
    },
    stockText: {
        fontSize: 12,
    },
    featuresContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 2,
    },
    featureText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    descriptionSection: {
        marginBottom: 18,
    },
    descriptionTitle: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    descriptionContainer: {
        overflow: "hidden",
        marginBottom: 8,
    },
    webView: {
        backgroundColor: "transparent",
    },
    readMoreButton: {
        fontSize: 14,
        fontWeight: "600",
    },
    selectionSection: {
        marginBottom: 18,
    },
    selectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        marginBottom: 12,
    },
    sizeContainer: {
        paddingRight: 16,
    },
    sizeButtonContainer: {
        marginRight: 10,
    },
    sizeButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: 50,
        alignItems: "center",
    },
    sizeText: {
        fontSize: 15,
        fontWeight: "600",
    },
    colorContainer: {
        paddingRight: 16,
    },
    colorButtonContainer: {
        marginRight: 14,
    },
    colorButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    additionalInfo: {
        marginBottom: 18,
    },
    infoCard: {
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: "600",
    },
    similarProductsSection: {
        marginBottom: 18,
    },
    similarProductsTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    similarProductsContainer: {
        paddingRight: 18,
    },
    similarProductCard: {
        width: 160,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        overflow: "hidden",
    },
    similarProductImage: {
        width: "100%",
        height: 120,
    },
    similarProductInfo: {
        padding: 12,
    },
    similarProductTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        lineHeight: 18,
    },
    similarProductBrand: {
        fontSize: 12,
        marginBottom: 6,
    },
    similarProductPriceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    similarProductPrice: {
        fontSize: 16,
        fontWeight: "700",
    },
    similarProductRating: {
        flexDirection: "row",
        alignItems: "center",
    },
    similarProductRatingText: {
        fontSize: 12,
        marginLeft: 2,
    },
    bottomSpacing: {
        height: 90,
    },
    fixedButtonContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderTopWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    totalPriceSection: {
        flex: 1,
        marginRight: 16,
    },
    totalPriceLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    totalPriceValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    buyNowButtonContainer: {
        flex: 2,
    },
    buyNowButton: {
        borderRadius: 10,
        overflow: "hidden",
        width: "100%",
    },
    buyNowGradient: {
        width: "100%",
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        opacity: 0.6,
    },
    buyNowText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
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
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        borderRadius: 10,
    },
    gradientButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    // Shimmer Styles
    shimmerHeaderButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    shimmerHeaderTitle: {
        width: 140,
        height: 22,
        borderRadius: 6,
    },
    shimmerFullImage: {
        width: width,
        height: MAIN_IMAGE_HEIGHT,
    },
    shimmerThumbnail: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        borderRadius: 8,
    },
    shimmerBrand: {
        width: 80,
        height: 24,
        borderRadius: 12,
    },
    shimmerRating: {
        width: 70,
        height: 20,
        borderRadius: 10,
    },
    shimmerTitle: {
        width: "85%",
        height: 26,
        borderRadius: 6,
        marginBottom: 18,
    },
    shimmerPrice: {
        width: 130,
        height: 24,
        borderRadius: 6,
        marginBottom: 26,
    },
    shimmerDescription: {
        width: "100%",
        height: 100,
        borderRadius: 12,
    },
    shimmerTotalPrice: {
        width: 100,
        height: 40,
        borderRadius: 8,
    },
    shimmerButton: {
        flex: 1.5,
        height: 48,
        borderRadius: 12,
        marginLeft: 16,
    },
})

