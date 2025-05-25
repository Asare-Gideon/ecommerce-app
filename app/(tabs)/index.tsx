"use client"

import BannerSlider from "@/components/home/BannerSlider"
import CategoryTabs from "@/components/home/CategoryTabs"
import PopularProductCard from "@/components/home/PopularProductCard"
import ProductCard from "@/components/ProductCard"
import PromoBanner from "@/components/PromoBanner"
import SearchBar from "@/components/SearchBar"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { useProducts } from "@/hooks/useProducts"
import type { Product } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import {
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


const { width } = Dimensions.get("window")

interface HomeScreenProps {
  navigation: any
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { products, popularProducts, categories, banners, isLoading, applyFilters, totalCount } = useProducts()
  const { user } = useAuth()



  const { cartCount } = useCart()
  const [activeCategory, setActiveCategory] = useState("all")

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category)
    if (category === "all") {
      applyFilters({ category: undefined })
    } else {
      applyFilters({ category })
    }
  }

  const navigateToProductDetails = (product: Product) => {
    navigation.navigate("ProductDetails", { product })
  }

  const navigateToCategory = () => {
    navigation.navigate("CategoryScreen")
  }

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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/auth/login")}>
            <Ionicons name="notifications-outline" size={25} color="#000" />
          </TouchableOpacity>

        </View>
      </View>

      {/* Search Bar */}
      <SearchBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Slider */}
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

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={navigateToCategory}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <CategoryTabs
          categories={[{ name: "All", _id: "all" }, ...categories.map((category) => ({ name: category.name, _id: category._id }))]}
          activeCategory={activeCategory}
          onCategoryPress={handleCategoryPress}
        />

        {/* Popular Products - Horizontal Scroll */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Popular Product</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllProducts")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.popularProductsSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={(popularProducts || []).slice(0, 6)}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PopularProductCard product={item} onPress={() => navigateToProductDetails(item)} />
            )}
            contentContainerStyle={styles.popularProductsContainer}
          />
        </View>
        <View style={{ marginTop: -20, marginBottom: 35 }}>
          <PromoBanner title="Get Your Special Sale" subtitle="Up to 40%" onPress={() => navigation.navigate("Sale")} />
        </View>

        {/* Recent Products - Grid */}
        <View style={[styles.sectionHeader, { marginTop: -20 }]}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate("AllProducts")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onPress={() => navigateToProductDetails(product)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
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
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "#FF5722",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
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
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    marginTop: 10
  },
})

