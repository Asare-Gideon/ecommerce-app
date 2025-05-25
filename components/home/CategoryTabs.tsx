import { useTheme } from "@/constants/theme"
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native"

interface CategoryTabsProps {
  categories: { name: string, _id: string }[]
  activeCategory: string
  onCategoryPress: (categoryId: string) => void
}

export default function CategoryTabs({ categories, activeCategory, onCategoryPress }: CategoryTabsProps) {
  const { colors } = useTheme()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category._id}
          style={[styles.tab, activeCategory === category._id && { backgroundColor: colors.primary }]}
          onPress={() => onCategoryPress(category._id)}
        >
          <Text style={[styles.tabText, activeCategory === category._id && styles.activeTabText]}>{category.name}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#F5F5F5",
  },
  activeTab: {
    backgroundColor: "#FF5722",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#FFF",
  },
})

