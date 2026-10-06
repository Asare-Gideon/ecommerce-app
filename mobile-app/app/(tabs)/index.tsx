"use client"

import BannerSliderShimmer from "@/components/BannerSliderShimmer"
import CategoryTabsShimmer from "@/components/CategoryTabsShimmer"
import BannerSlider from "@/components/home/BannerSlider"
import CategoryTabs from "@/components/home/CategoryTabs"
import PopularProductCard from "@/components/home/PopularProductCard"
import PopularProductShimmer from "@/components/PopularProductShimmer"
import ProductCard from "@/components/ProductCard"
import ProductCardShimmer from "@/components/ProductCardShimmer"
import PromoBanner from "@/components/PromoBanner"
import SearchBar from "@/components/SearchBar"
import SectionHeaderShimmer from "@/components/SectionHeaderShimmer"
import { useAuth } from "@/hooks/useAuth"
import { useProducts } from "@/hooks/useProducts"
import { useBlogStore } from "@/store/blog"
import { useNotificationStore } from "@/store/notifications"
import type { Blog } from "@/types/blog"
import type { Product } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useMemo, useState } from "react"
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const { width } = Dimensions.get("window")

type HomeFeedItem =
  | { type: "products"; id: string; products: Product[] }
  | { type: "blog"; id: string; blog: Blog }

const stripHtml = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()

export default function HomeScreen() {
  const {
    products,
    popularProducts,
    categories,
    banners,
    promoBanner,
    isLoading,
    isLoadingMore,
    hasMore,
    handleLoadMore,
    fetchProducts,
    fetchPopularProducts,
    fetchCategories,
    fetchBanners,
    fetchPromoBanner,
  } = useProducts(false)
  const { user, isAuthenticated } = useAuth()
  const { homeBlog, fetchHomeBlog } = useBlogStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshHomeData = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setIsRefreshing(true)
      }
      try {
        await Promise.all([
          fetchProducts(true),
          fetchPopularProducts(),
          fetchCategories(),
          fetchBanners(),
          fetchPromoBanner(),
          fetchHomeBlog(),
          isAuthenticated ? fetchNotifications() : Promise.resolve(),
        ])
      } finally {
        if (showRefresh) {
          setIsRefreshing(false)
        }
      }
    },
    [fetchProducts, fetchPopularProducts, fetchCategories, fetchBanners, fetchPromoBanner, fetchHomeBlog, fetchNotifications, isAuthenticated],
  )

  useFocusEffect(
    useCallback(() => {
      refreshHomeData()
    }, [refreshHomeData]),
  )

  function getGreeting(): string {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning!";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  }


  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: "/pages/explore/" as any,
      params: { category: categoryId === "all" ? undefined : categoryId } as any,
    })
  }

  const handleSearchPress = () => {
    router.push({
      pathname: "/pages/explore/" as any,
      params: { focusSearch: true } as any,
    })
  }

  const handleFilterPress = () => {
    router.push({
      pathname: "/pages/explore/" as any,
      params: { openFilters: true } as any,
    })
  }

  const navigateToProductDetails = (productId: string) => {
    router.push({
      pathname: "/pages/product-details/" as any,
      params: { productId } as any,
    })

  }

  const navigateToCategory = () => {
    router.push({
      pathname: "/pages/explore/" as any,
      params: { showPopular: true } as any,
    })
  }

  const onEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      handleLoadMore()
    }
  }, [isLoadingMore, hasMore, handleLoadMore])

  const feedItems = useMemo<HomeFeedItem[]>(() => {
    const rows: HomeFeedItem[] = []
    for (let index = 0; index < products.length; index += 2) {
      rows.push({
        type: "products",
        id: `products-${index}`,
        products: products.slice(index, index + 2),
      })
      if (homeBlog && index === 2) {
        rows.push({ type: "blog", id: `blog-${homeBlog._id}`, blog: homeBlog })
      }
    }

    if (homeBlog && products.length <= 2) {
      rows.push({ type: "blog", id: `blog-${homeBlog._id}`, blog: homeBlog })
    }

    return rows
  }, [homeBlog, products])

  const renderPopularProduct = ({ item }: { item: Product }) => (
    <PopularProductCard product={item} onPress={() => navigateToProductDetails(item._id)} />
  )

  const renderFooter = () => {
    if (!isLoadingMore) return null
    return (
      <View style={styles.loadingFooter}>
        <ProductCardShimmer />
        <ProductCardShimmer />
      </View>
    )
  }

  const renderHomeBlogCard = (blog: Blog) => {
    const excerpt = stripHtml(blog.content)

    return (
      <TouchableOpacity
        style={styles.blogCard}
        activeOpacity={0.86}
        onPress={() => router.push({ pathname: "/pages/blogs/details" as any, params: { id: blog._id } as any })}
      >
        <Image source={{ uri: blog.thumbnail }} style={styles.blogImage} />
        <View style={styles.blogContent}>
          <View style={styles.blogMetaRow}>
            <Text style={styles.blogEyebrow}>Blog</Text>
            <Ionicons name="sparkles-outline" size={12} color="#6366F1" />
          </View>
          <Text style={styles.blogTitle} numberOfLines={2}>{blog.title}</Text>
          <Text style={styles.blogExcerpt} numberOfLines={1}>{excerpt}</Text>
          <View style={styles.blogButton}>
            <Text style={styles.blogButtonText}>Read article</Text>
            <Ionicons name="arrow-forward" size={14} color="#111111" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFeedItem = ({ item }: { item: HomeFeedItem }) => {
    if (item.type === "blog") {
      return renderHomeBlogCard(item.blog)
    }

    return (
      <View style={styles.row}>
        {item.products.map((product) => (
          <ProductCard key={product._id} product={product} onPress={() => navigateToProductDetails(product._id)} />
        ))}
        {item.products.length === 1 ? <View style={styles.productPlaceholder} /> : null}
      </View>
    )
  }

  const renderHeader = () => (
    <>
      {isLoading ? (
        <BannerSliderShimmer />
      ) : (
        <BannerSlider
          banners={
            banners || [
              {
                _id: "1",
                image: "https://images.unsplash.com/photo-1583744946564-b52d01a7b321",
                title: "Get Your Special Sale",
                subtitle: "Up to 40%",
                buttonText: "Shop Now",
                link: "/sale",
              },
            ]
          }
        />
      )}

      {/* Categories */}
      {isLoading ? (
        <SectionHeaderShimmer />
      ) : (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={navigateToCategory}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {isLoading ? (
        <SectionHeaderShimmer />
      ) : (
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Popular Product</Text>
          <TouchableOpacity onPress={navigateToCategory}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.popularProductsSection}>
        {isLoading ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <PopularProductShimmer />}
            contentContainerStyle={styles.popularProductsContainer}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={(popularProducts || []).slice(0, 6)}
            keyExtractor={(item) => item._id}
            renderItem={renderPopularProduct}
            contentContainerStyle={styles.popularProductsContainer}
          />
        )}
      </View>

      {!isLoading && (
        <View style={{ marginTop: -20, marginBottom: 35 }}>
          <PromoBanner title="Get Your Special Sale" subtitle="Up to 40%" banner={promoBanner || undefined} />
        </View>
      )}

      {/* Recent Products Header */}
      {isLoading ? (
        <SectionHeaderShimmer />
      ) : (
        <View style={[styles.sectionHeader, { marginTop: -20 }]}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          <TouchableOpacity onPress={() => router.push("/pages/explore/" as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hello {user ? user?.firstName : "Guest"}</Text>
            <Text style={styles.subGreeting}>{getGreeting()}</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/pages/notifications" as any)}>
            <Ionicons name="notifications-outline" size={25} color="#000" />
            {unreadCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar - Navigate to CategoryScreen */}
      <SearchBar onPress={handleSearchPress} onFilterPress={handleFilterPress} editable={false} />

      {/* Main Content with FlatList for infinite scroll */}
      <FlatList
        data={isLoading ? [] : feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => refreshHomeData(true)} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.shimmerContainer}>
              <ProductCardShimmer />
              <ProductCardShimmer />
              <ProductCardShimmer />
              <ProductCardShimmer />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatListContent: {
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  subGreeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 0,
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
  popularProductsSection: {
    marginBottom: 20,
  },
  popularProductsContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    flexDirection: "row",
  },
  productPlaceholder: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 16,
  },
  shimmerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    marginTop: 10,
  },
  blogCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F7F6FF",
    borderWidth: 1,
    borderColor: "#DDD9FF",
    flexDirection: "row",
    minHeight: 108,
  },
  blogImage: {
    width: 98,
    minHeight: 108,
    backgroundColor: "#F5F5F5",
  },
  blogContent: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    justifyContent: "center",
  },
  blogMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
  },
  blogEyebrow: {
    color: "#6366F1",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  blogTitle: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  blogExcerpt: {
    color: "#5F5F73",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 15,
    marginTop: 3,
    marginBottom: 6,
  },
  blogButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  blogButtonText: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "700",
  },
})
