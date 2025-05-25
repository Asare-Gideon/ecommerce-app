"use client"

import { useTheme } from "@/constants/theme"
import type { Banner } from "@/types/product"
import { useEffect, useRef, useState } from "react"
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")
const BANNER_WIDTH = width - 32

interface BannerSliderProps {
  banners: Banner[]
}

export default function BannerSlider({ banners = [] }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList | null>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)
  const { colors } = useTheme()

  // Auto scroll
  useEffect(() => {
    if (banners.length <= 1) return

    (autoplayRef as any).current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      })
      setCurrentIndex(nextIndex)
    }, 3000)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }
  }, [currentIndex, banners.length])

  const renderItem = ({ item }: { item: Banner }) => {
    return (
      <View style={[styles.bannerContainer, { backgroundColor: colors.primary }]}>
        <Image
          source={{ uri: item.image || "https://images.unsplash.com/photo-1583744946564-b52d01a7b321" }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title || "Get Your Special Sale"}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle || "Up to 40%"}</Text>
          <TouchableOpacity style={styles.bannerButton}>
            <Text style={[styles.bannerButtonText, { color: colors.primary }]}>{item.buttonText || "Shop Now"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / BANNER_WIDTH)
    setCurrentIndex(index)
  }

  // If no banners, show a default one
  if (banners.length === 0) {
    banners = [
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

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={BANNER_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
      />

      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === currentIndex && { backgroundColor: colors.primary, width: 12, height: 8 }]} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 170,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    fontWeight: "600",
    fontSize: 12,
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
    width: 12,
    height: 8,
  },
})

