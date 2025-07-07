"use client"

import CategoryTabsShimmer from "@/components/CategoryTabsShimmer"
import CategoryTabs from "@/components/home/CategoryTabs"
import ProductCard from "@/components/ProductCard"
import SearchBar from "@/components/SearchBar"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import { useWishlist } from "@/hooks/useWishlist"
import { router } from "expo-router"
import { Heart, ShoppingBag, Trash2 } from "lucide-react-native"
import {
    Alert,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import Animated, { FadeInDown, FadeInUp, Layout, SlideOutLeft } from "react-native-reanimated"

const { width } = Dimensions.get("window")

export default function WishlistScreen() {
    const { wishlistItems, toggleWishlist, clearWishlist, isInWishlist } = useWishlist()
    const { addToCart } = useCart()
    const {
        categories,
        isLoading,
    } = useProducts()

    const navigateToProductDetails = (productId: string) => {
        router.push({
            pathname: "/pages/product-details/" as any,
            params: { productId } as any,
        })
    }

    const handleProductPress = (product: any) => {
        navigateToProductDetails(product._id)
    }

    const handleSearchPress = () => {
        router.push({
            pathname: "/pages/explore/" as any,
            params: { focusSearch: true } as any,
        })
    }

    const handleCategoryPress = (categoryId: string) => {
        router.push({
            pathname: "/pages/explore/" as any,
            params: { category: categoryId === "all" ? undefined : categoryId } as any,
        })
    }

    const handleFilterPress = () => {
        router.push({
            pathname: "/pages/explore/" as any,
            params: { openFilters: true } as any,
        })
    }


    const handleClearWishlist = () => {
        Alert.alert("Clear Wishlist", "Are you sure you want to remove all items from your wishlist?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Clear All",
                style: "destructive",
                onPress: clearWishlist,
            },
        ])
    }

    const renderEmptyState = () => (
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Heart size={60} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptyText}>
                Save items you love by tapping the heart icon.{"\n"}
                They'll appear here for easy access.
            </Text>
            <Animated.View entering={FadeInUp.delay(400).springify()}>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/")} activeOpacity={0.8}>
                    <ShoppingBag size={18} color="#fff" style={styles.shopButtonIcon} />
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </Animated.View>
        </Animated.View>
    )

    const renderProductItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            exiting={SlideOutLeft.springify()}
            layout={Layout.springify()}
            style={styles.productCardContainer}
        >
            <ProductCard product={item} onPress={() => handleProductPress(item)} />
        </Animated.View>
    )

    return (
        <View style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.headerTitle}>Wishlist</Text>
                    </View>
                    <TouchableOpacity disabled={wishlistItems.length === 0} style={styles.clearButton} onPress={handleClearWishlist} activeOpacity={0.8}>
                        <Trash2 size={18} color={wishlistItems.length === 0 ? "#D1D5DB" : "#6366F1"} />
                        <Text style={[styles.clearButtonText, { color: wishlistItems.length === 0 ? "#D1D5DB" : "#6366F1" }]}>clear</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            <View>

                <SearchBar onPress={handleSearchPress} onFilterPress={handleFilterPress} editable={false} />

                <View style={{ marginTop: 5 }}>
                    {isLoading ? (
                        <CategoryTabsShimmer />
                    ) : (
                        <CategoryTabs
                            categories={[
                                { name: "All", _id: "all" },
                                ...categories.map((category) => ({ name: category.name, _id: category._id })),
                            ]}
                            activeCategory="all"
                            onCategoryPress={handleCategoryPress}
                        />
                    )}
                </View>
            </View>



            {/* Content */}
            <View style={styles.container}>
                {wishlistItems.length > 0 ? (
                    <FlatList
                        data={wishlistItems}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item._id}
                        numColumns={2}
                        contentContainerStyle={styles.productsList}
                        columnWrapperStyle={styles.productsRow}
                        showsVerticalScrollIndicator={false}

                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                ) : (
                    renderEmptyState()
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingTop: 10,
    },
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        width: "100%",
    },
    header: {
        backgroundColor: "#FAFAFA",
        paddingBottom: 16,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        flexDirection: "row",
        justifyContent: "space-between",

    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#1F2937",
        letterSpacing: -0.3,
    },
    countBadge: {
        backgroundColor: "#6366F1",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    countText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    floatingClearButton: {
    },
    clearButton: {
        backgroundColor: "#fff",
        justifyContent: "center",
        flexDirection: "row",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: "center",

    },
    clearButtonText: {
        color: "#6366F1",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 6,
    },
    productsList: {
        marginTop: 20,
        paddingBottom: 100, // Account for tab bar
    },
    productsRow: {
        justifyContent: "space-between",
    },
    productCardContainer: {
        flex: 1,
        marginHorizontal: 4,
    },
    separator: {
        height: 16,
    },
    emptyContainer: {
        flex: 0.7,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderStyle: "dashed",
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
        marginBottom: 28,
    },
    shopButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6366F1",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        shadowColor: "#6366F1",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    shopButtonIcon: {
        marginRight: 6,
    },
    shopButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
})

