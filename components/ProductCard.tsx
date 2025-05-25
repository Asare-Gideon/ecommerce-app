"use client"

import { useTheme } from "@/constants/theme"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import type { Product } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 2

interface ProductCardProps {
  product: Product
  onPress?: (product: Product) => void
  showPrice?: boolean
}

export default function ProductCard({ product, onPress, showPrice = true }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
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




  const isNew = () => {
    if (!product.createdAt) return false
    const productDate = new Date(product.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - productDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }

  const showNewBadge = product.createdAt ? isNew() : product._id.charCodeAt(0) % 3 === 0

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(product)} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[0].url }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.badgesContainer}>
            {showNewBadge && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}

            {/* {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>-{discountPercentage}%</Text>
              </View>
            )} */}
          </View>

          <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={18}
              color={isWishlisted ? colors.primary : "#666"}
            />
          </TouchableOpacity>
        </View>

        {showPrice && (
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.title}
            </Text>
            <View style={styles.priceRow}>
              <View style={styles.priceContainer}>
                <Text style={[styles.price, { color: colors.primary }]}>₵{product.price?.toFixed(2)}</Text>
                {/* {hasDiscount && <Text style={styles.originalPrice}>₵{displayProduct.originalPrice?.toFixed(2)}</Text>} */}
              </View>
              <TouchableOpacity
                style={[styles.addToCartButton, { backgroundColor: colors.primary }]}
                onPress={handleAddToCart}
              >
                <Ionicons name="add" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
    backgroundColor: "#F8F9FA",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgesContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  newBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  newBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  discountBadge: {
    backgroundColor: "#FF3D00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  originalPrice: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
  },
  addToCartButton: {
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
})

