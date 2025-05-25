import { useTheme } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

interface PromoBannerProps {
  title: string
  subtitle: string
  onPress?: () => void
}

export default function PromoBanner({ title, subtitle, onPress }: PromoBannerProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.primary }]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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

