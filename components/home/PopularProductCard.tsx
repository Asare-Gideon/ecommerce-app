"use client"

import { useTheme } from "@/constants/theme"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import type { Product } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

interface PopularProductCardProps {
  product: Product
  onPress?: (product: Product) => void
}

export default function PopularProductCard({ product, onPress }: PopularProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)
  const { colors } = useTheme()

  const isWishlisted = product?._id ? isInWishlist(product._id) : false

  const handleWishlistToggle = (e: any) => {
    e.stopPropagation()
    if (product) {
      toggleWishlist(product)
    }
  }

  const handleAddToCart = (e: any) => {
    e.stopPropagation()
    if (product) {
      addToCart(product, 1)
    }
  }




  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(product)} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: (product as any).images[0].url }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 13 }}>
            <Text style={styles.priceText}>₵{product.price?.toFixed(0)}</Text>
            <TouchableOpacity style={[styles.addToCartButton, { backgroundColor: colors.primary }]} onPress={handleAddToCart}>
              <Text style={[styles.addToCartText, { color: "#fff" }]}>Add to cart</Text>
            </TouchableOpacity></View>
        </View>

        <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
          <Ionicons
            name={isWishlisted ? "heart" : "heart-outline"}
            size={22}
            color={isWishlisted ? "#FF5722" : "#000"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 290,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    position: "relative",
    height: 145,
  },
  imageContainer: {
    width: 85,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  image: {
    width: 85,
    height: 110,
    backgroundColor: "#f9f9f9", // Light background for image area
    objectFit: "cover"
  },
  productDetails: {
    flex: 1,
    paddingRight: 24, // Space for wishlist button
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    lineHeight: 16,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },
  wishlistButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  addToCartButton: {
    backgroundColor: "#FFCA28",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginRight: -10
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
})

