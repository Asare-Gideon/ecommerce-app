"use client"

import CategoryTabsShimmer from "@/components/CategoryTabsShimmer"
import FilterBottomSheet from "@/components/FilterBottomSheet"
import ProductCard from "@/components/ProductCard"
import ProductCardShimmer from "@/components/ProductCardShimmer"
import SectionHeaderShimmer from "@/components/SectionHeaderShimmer"
import CategoryTabs from "@/components/home/CategoryTabs"
import { useProducts } from "@/hooks/useProducts"
import type { Product, ProductFilters } from "@/types/product"
import { Feather, Ionicons } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { useTheme } from "../../../constants/theme"

const { width } = Dimensions.get("window")

export default function CategoryScreen() {
    const { products, popularProducts, categories, isLoading, isLoadingMore, hasMore, defaultFilters, applyFilters, handleLoadMore, } =
        useProducts()
    const { focusSearch, openFilters, showPopular, category } = useLocalSearchParams()

    const [activeCategory, setActiveCategory] = useState<string>((category as string) || "all")
    const [showFilters, setShowFilters] = useState(false)
    const [currentFilters, setCurrentFilters] = useState<ProductFilters>({})
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<"newest" | "price" | "popular">("newest")
    const { colors } = useTheme()

    const searchInputRef = useRef<TextInput>(null)
    const fabScale = useRef(new Animated.Value(1)).current
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const isSearchingRef = useRef(false)

    useEffect(() => {
        if (focusSearch) {
            setTimeout(() => {
                searchInputRef.current?.focus()
            }, 100)
        }
        if (openFilters) {
            setShowFilters(true)
        }
        if (showPopular) {
            applyFilters({ sort: "popular" })
            setSortBy("popular")

        }
        if (category) {
            console.log("category", category)
            setActiveCategory(category as string)
            const newFilters: ProductFilters = {
                ...defaultFilters,
                category: category as string === "all" ? undefined : category as string,
            }
            setCurrentFilters(newFilters)
            applyFilters(newFilters)
        }
    }, [focusSearch, openFilters, showPopular, category])

    const handleCategoryPress = useCallback(
        (categoryId: string) => {
            setActiveCategory(categoryId)
            const newFilters: ProductFilters = {
                ...defaultFilters,
                category: categoryId === "all" ? undefined : categoryId,
            }
            setCurrentFilters(newFilters)
            applyFilters(newFilters)
        },
        [defaultFilters, applyFilters],
    )

    const navigateToProductDetails = useCallback((product: Product) => {
        router.push({
            pathname: "/pages/product-details/" as any,
            params: { productId: product._id } as any,
        })
    }, [])

    const handleApplyFilters = useCallback(
        (filters: ProductFilters) => {
            const newFilters: ProductFilters = {
                ...filters,
                category: activeCategory === "all" ? undefined : activeCategory,
                search: searchQuery || undefined,
            }
            setCurrentFilters(newFilters)
            applyFilters(newFilters)
            setShowFilters(false)
        },
        [activeCategory, searchQuery, applyFilters],
    )

    const debouncedSearch = useCallback(
        (text: string) => {
            if (isSearchingRef.current) return

            isSearchingRef.current = true
            const newFilters: ProductFilters = {
                ...defaultFilters,
                search: text || undefined,
            }
            setCurrentFilters(newFilters)
            applyFilters(newFilters)

            setTimeout(() => {
                isSearchingRef.current = false
            }, 100)
        },
        [defaultFilters, applyFilters],
    )

    const handleSearch = useCallback(
        (text: string) => {
            setSearchQuery(text)

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }

            (searchTimeoutRef as any).current = setTimeout(() => {
                debouncedSearch(text)
            }, 500) // Increased delay to 500ms
        },
        [debouncedSearch],
    )

    const handleClearSearch = useCallback(() => {
        setSearchQuery("")
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        debouncedSearch("")
    }, [debouncedSearch])

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const onEndReached = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            handleLoadMore()
        }
    }, [isLoadingMore, hasMore, handleLoadMore])

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => (
            <ProductCard key={item._id} product={item} onPress={() => navigateToProductDetails(item)} showPrice />
        ),
        [navigateToProductDetails],
    )

    const renderFooter = useCallback(() => {
        if (!isLoadingMore) return null
        return (
            <View style={styles.loadingFooter}>
                <ProductCardShimmer />
                <ProductCardShimmer />
            </View>
        )
    }, [isLoadingMore])

    const animateFab = useCallback(() => {
        Animated.sequence([
            Animated.timing(fabScale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(fabScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start()
    }, [fabScale])

    const categoryList = useMemo(
        () => [{ name: "All", _id: "all" }, ...categories.map((cat) => ({ name: cat.name, _id: cat._id }))],
        [categories],
    )

    const renderHeader = useMemo(
        () => (
            <>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Search products..."
                            placeholderTextColor="#9E9E9E"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            returnKeyType="search"
                            autoCorrect={false}
                            autoCapitalize="none"
                            blurOnSubmit={false}
                            selectTextOnFocus={false}
                            keyboardType="default"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color="#9E9E9E" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Categories */}
                {isLoading ? (
                    <SectionHeaderShimmer />
                ) : (
                    null
                )}

                {isLoading ? (
                    <CategoryTabsShimmer />
                ) : (
                    <View style={{ marginVertical: 5 }}>
                        <CategoryTabs
                            categories={categoryList}
                            activeCategory={activeCategory}
                            onCategoryPress={handleCategoryPress}
                        />
                    </View>
                )}

                {/* Results Header */}
                {!isLoading && (
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsText}>{searchQuery ? `Results for "${searchQuery}"` : `${categories.find((cat) => cat._id === activeCategory)?.name || "All"} Products`}</Text>
                        <Text style={styles.resultsCount}>
                            {products.length} {products.length === 1 ? "item" : "items"}
                        </Text>
                    </View>
                )}
            </>
        ),
        [
            searchQuery,
            handleSearch,
            handleClearSearch,
            isLoading,
            categoryList,
            activeCategory,
            handleCategoryPress,
            products.length,
        ],
    )

    const emptyComponent = useMemo(() => {
        if (isLoading) {
            return (
                <View style={styles.shimmerContainer}>
                    <ProductCardShimmer />
                    <ProductCardShimmer />
                    <ProductCardShimmer />
                    <ProductCardShimmer />
                </View>
            )
        }
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No products found</Text>
                <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
        )
    }, [isLoading])

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Products</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={isLoading ? [] : products || []}
                renderItem={renderProduct}
                keyExtractor={(item) => item._id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.1}
                columnWrapperStyle={styles.row}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                removeClippedSubviews={false}
                ListEmptyComponent={emptyComponent}
                getItemLayout={undefined} // Disable getItemLayout for dynamic content
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
            />

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <Animated.View style={[styles.fabRight, { transform: [{ scale: fabScale }] }]}>
                    <TouchableOpacity
                        style={[styles.fab, styles.filterFab, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            animateFab()
                            setShowFilters(true)
                        }}
                    >
                        <Feather name="sliders" size={24} color="#FFF" />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <FilterBottomSheet
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={currentFilters}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    headerRight: {
        width: 32,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        height: 44,
    },
    clearButton: {
        padding: 4,
    },
    flatListContent: {
        paddingBottom: 100, // Space for FABs
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    seeAll: {
        fontSize: 14,
        color: "#666",
    },
    resultsHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        marginBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    resultsText: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    resultsCount: {
        fontSize: 14,
        color: "#666",
    },
    row: {
        justifyContent: "space-between",
        paddingHorizontal: 8,
    },
    loadingFooter: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 8,
        marginTop: 16,
    },
    shimmerContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
    },
    fabContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 30,
        pointerEvents: "box-none",
    },
    fabRight: {
        alignItems: "center",
        alignSelf: "flex-end",
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    filterFab: {
        alignSelf: "flex-end",
    },
    fabLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#666",
        marginTop: 4,
    },
})

