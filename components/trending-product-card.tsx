"use client"

import { useTheme } from "@/constants/theme"
import type { Product } from "@/types/product"
import { Heart, ShoppingCart, Star } from "lucide-react-native"
import type React from "react"
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface TrendingProductCardProps {
  product: Product
  onPress: (product: Product) => void
  onAddToCart: (product: Product) => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.55 // Reduced from 0.6

const TrendingProductCard: React.FC<TrendingProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const { colors } = useTheme()

  const handleFavoritePress = (e: any) => {
    e.stopPropagation()
    onToggleFavorite()
  }

  const handleAddToCartPress = (e: any) => {
    e.stopPropagation()
    onAddToCart(product)
  }

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(product)} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.images[0]?.url }} style={styles.image} />

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {product.isNew && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {product.discountPercentage && (
            <View style={[styles.badge, { backgroundColor: "#FF3B30", marginLeft: product.isNew ? 4 : 0 }]}>
              <Text style={styles.badgeText}>{`${product.discountPercentage}% OFF`}</Text>
            </View>
          )}
        </View>

        {/* Favorite button */}
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <Heart size={16} color={isFavorite ? "#FF3B30" : "#666"} fill={isFavorite ? "#FF3B30" : "transparent"} />
        </TouchableOpacity>

        {/* Add to cart button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCartPress}>
          <ShoppingCart size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {product.title}
        </Text>

        <View style={styles.priceRatingContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{`$${product.price.toFixed(2)}`}</Text>
            {product.discountPercentage && (
              <Text style={styles.originalPrice}>
                {`$${((product.price * 100) / (100 - product.discountPercentage)).toFixed(2)}`}
              </Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{`${product.averageRating?.toFixed(1) || "4.5"}`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160, // Reduced from 180
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgesContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  addToCartButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 12,
  },
  brand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E5",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 11,
    color: "#333",
    marginLeft: 3,
    fontWeight: "500",
  },
})

export default TrendingProductCard

