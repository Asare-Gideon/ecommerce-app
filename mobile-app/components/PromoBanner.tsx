import { useTheme } from "@/constants/theme"
import type { Banner } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface PromoBannerProps {
  title: string
  subtitle: string
  banner?: Banner
  onPress?: () => void
}

export default function PromoBanner({ title, subtitle, banner, onPress }: PromoBannerProps) {
  const { colors } = useTheme()
  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }

    if (!banner?.link) return

    if (/^https?:\/\//.test(banner.link)) {
      Linking.openURL(banner.link)
      return
    }

    router.push(banner.link as any)
  }

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.primary }]} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.content}>
        <Text style={styles.title}>{banner?.title || banner?.name || title}</Text>
        <Text style={styles.subtitle}>{banner?.subtitle || subtitle}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    height: 80,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
})
