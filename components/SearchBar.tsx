import { Feather, Ionicons } from "@expo/vector-icons"
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native"

interface SearchBarProps {
  onSearch?: (text: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={23} color="#9E9E9E" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#9E9E9E"
          onChangeText={onSearch}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="sliders" size={20} color="#000" />
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    height: 45,
  },
  filterButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: -6
  },
})

