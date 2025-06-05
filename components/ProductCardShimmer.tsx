"use client"

import { useEffect, useRef } from "react"
import { Animated, Dimensions, StyleSheet, View } from "react-native"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 2

export default function ProductCardShimmer() {
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
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.shimmerImage, { opacity: shimmerOpacity }]} />
          <View style={styles.shimmerWishlist} />
        </View>

        <View style={styles.productInfo}>
          <Animated.View style={[styles.shimmerTitle, { opacity: shimmerOpacity }]} />
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Animated.View style={[styles.shimmerPrice, { opacity: shimmerOpacity }]} />
              <Animated.View style={[styles.shimmerOriginalPrice, { opacity: shimmerOpacity }]} />
            </View>
            <View style={styles.shimmerButton} />
          </View>
        </View>
      </View>
    </View>
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
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.85,
    position: "relative",
    backgroundColor: "#F8F9FA",
  },
  shimmerImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  shimmerWishlist: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    width: 28,
    height: 28,
  },
  productInfo: {
    padding: 12,
  },
  shimmerTitle: {
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flex: 1,
  },
  shimmerPrice: {
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 4,
    width: "60%",
  },
  shimmerOriginalPrice: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    width: "40%",
  },
  shimmerButton: {
    borderRadius: 12,
    width: 28,
    height: 28,
    backgroundColor: "#E0E0E0",
  },
})
