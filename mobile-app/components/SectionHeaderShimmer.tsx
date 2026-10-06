"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Animated } from "react-native"

export default function SectionHeaderShimmer() {
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
      <Animated.View style={[styles.shimmerTitle, { opacity: shimmerOpacity }]} />
      <Animated.View style={[styles.shimmerSeeAll, { opacity: shimmerOpacity }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  shimmerTitle: {
    height: 18,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    width: 120,
  },
  shimmerSeeAll: {
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    width: 50,
  },
})
