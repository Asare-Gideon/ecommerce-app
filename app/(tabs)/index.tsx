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
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import type { Product } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useCallback } from "react"
import {
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

const { width } = Dimensions.get("window")

interface HomeScreenProps {
  navigation: any
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    products,
    popularProducts,
    categories,
    banners,
    isLoading,
    isLoadingMore,
    hasMore,
    applyFilters,
    handleLoadMore,
    totalCount,
  } = useProducts()
  const { user } = useAuth()

  const { cartCount } = useCart()

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

  const renderPopularProduct = ({ item }: { item: Product }) => (
    <PopularProductCard product={item} onPress={() => navigateToProductDetails(item._id)} />
  )

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => navigateToProductDetails(item._id)} />
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
          <TouchableOpacity onPress={() => navigation.navigate("CategoryScreen", { showPopular: true })}>
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
          <PromoBanner title="Get Your Special Sale" subtitle="Up to 40%" onPress={() => navigation.navigate("Sale")} />
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
            <Text style={styles.subGreeting}>Good Morning!</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/pages/explore/" as any)}>
            <Ionicons name="notifications-outline" size={25} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar - Navigate to CategoryScreen */}
      <SearchBar onPress={handleSearchPress} onFilterPress={handleFilterPress} editable={false} />

      {/* Main Content with FlatList for infinite scroll */}
      <FlatList
        data={isLoading ? [] : products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.row}
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
    paddingBottom: 20,
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
})

