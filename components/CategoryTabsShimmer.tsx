"use client"

import { useEffect, useRef } from "react"
import { StyleSheet, Animated, ScrollView } from "react-native"

export default function CategoryTabsShimmer() {
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Animated.View key={index} style={[styles.tab, { opacity: shimmerOpacity }]} />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  tab: {
    width: 80,
    height: 32,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    marginHorizontal: 4,
  },
})
