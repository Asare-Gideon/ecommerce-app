"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Dimensions } from "react-native"

const { width } = Dimensions.get("window")
const BANNER_WIDTH = width - 32

export default function BannerSliderShimmer() {
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
      <View style={styles.bannerContainer}>
        <Animated.View style={[styles.shimmerBanner, { opacity: shimmerOpacity }]} />
        <View style={styles.bannerContent}>
          <Animated.View style={[styles.shimmerTitle, { opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.shimmerSubtitle, { opacity: shimmerOpacity }]} />
          <View style={styles.shimmerButton} />
        </View>
      </View>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {[1, 2, 3].map((index) => (
          <View key={index} style={[styles.paginationDot, index === 1 && styles.paginationDotActive]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 160,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    position: "relative",
  },
  shimmerBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
    position: "absolute",
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    zIndex: 1,
  },
  shimmerTitle: {
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
    width: "60%",
  },
  shimmerSubtitle: {
    height: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 16,
    width: "40%",
  },
  shimmerButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    width: 80,
    height: 32,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDD",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#E0E0E0",
    width: 12,
    height: 8,
  },
})
