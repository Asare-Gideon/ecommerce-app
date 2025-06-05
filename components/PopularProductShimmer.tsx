"use client"

import { useEffect, useRef } from "react"
import { Animated, Dimensions, StyleSheet, View } from "react-native"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.75

export default function PopularProductShimmer() {
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
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.shimmerImage, { opacity: shimmerOpacity }]} />
        </View>

        <View style={styles.productDetails}>
          <Animated.View style={[styles.shimmerTitle, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.shimmerDescription, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.shimmerPrice, { opacity: shimmerOpacity }]} />
          <View style={styles.shimmerButton} />
        </View>

        <View style={styles.shimmerWishlist} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    position: "relative",
    height: 120,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  shimmerImage: {
    width: 70,
    height: 70,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    paddingRight: 24,
  },
  shimmerTitle: {
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 6,
    width: "80%",
  },
  shimmerDescription: {
    height: 12,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
  },
  shimmerPrice: {
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
    width: "50%",
  },
  shimmerButton: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    width: 80,
    height: 28,
  },
  shimmerWishlist: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    backgroundColor: "#E0E0E0",
    borderRadius: 11,
  },
})
