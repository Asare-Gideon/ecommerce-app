"use client"

import type React from "react"

import { useTheme } from "@/constants/theme"
import { useProducts } from "@/hooks/useProducts"
import type { ProductFilters } from "@/types/product"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.85

interface FilterBottomSheetProps {
  visible: boolean
  onClose: () => void
  onApplyFilters: (filters: ProductFilters) => void
  currentFilters: ProductFilters
}

interface DropdownSectionProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  icon?: string
}

const DropdownSection = ({ title, isOpen, onToggle, children, icon }: DropdownSectionProps) => {
  const { colors } = useTheme()

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity style={styles.dropdownHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.dropdownTitleContainer}>
          {icon && <Ionicons name={icon as any} size={20} color={colors.primary} style={styles.dropdownIcon} />}
          <Text style={styles.dropdownTitle}>{title}</Text>
        </View>
        <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
      </TouchableOpacity>
      {isOpen && <Animated.View style={styles.dropdownContent}>{children}</Animated.View>}
    </View>
  )
}

export default function FilterBottomSheet({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterBottomSheetProps) {
  const { colors } = useTheme()
  const [slideAnim] = useState(new Animated.Value(BOTTOM_SHEET_HEIGHT))
  const [filters, setFilters] = useState<ProductFilters>({})
  const { categories } = useProducts()

  // Dropdown states - first two open by default
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    colors: false,
    sizes: false,
    price: false,
    sort: false,
    stock: false,
  })

  const brands = ["Nike", "Adidas", "Puma", "Reebok", "Under Armour", "New Balance", "Apple", "Samsung"]
  const colors_options = ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Purple", "Orange", "Brown"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]

  const sortOptions = [
    { label: "Price: Low to High", value: "price", icon: "trending-up" },
    { label: "Newest First", value: "createdAt", icon: "time" },
    { label: "Most Popular", value: "popular", icon: "heart" },
    { label: "Best Selling", value: "sold", icon: "trophy" },
    { label: "Brand A-Z", value: "brand", icon: "text" },
    { label: "Name A-Z", value: "title", icon: "list" },
  ]

  // Create categories list with "All" option
  const categoryOptions = [{ _id: "all", name: "All" }, ...categories]

  // Sync filters with currentFilters when modal opens
  useEffect(() => {
    if (visible) {
      setFilters({ ...currentFilters })
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, currentFilters])

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: BOTTOM_SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  const handleApply = () => {
    onApplyFilters(filters)
  }

  const handleReset = () => {
    setFilters({})
  }

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key: keyof ProductFilters, value: string) => {
    setFilters((prev) => {
      const currentArray = (prev[key] as string[]) || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray.length > 0 ? newArray : undefined }
    })
  }

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category && filters.category !== "all") count++
    if (filters.brand) count++
    if (filters.colors?.length) count++
    if (filters.sizes?.length) count++
    if (filters.minPrice || filters.maxPrice) count++
    if (filters.sort) count++
    if (filters.onlyStock || filters.lowStocks || filters.outStocks) count++
    return count
  }

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === "all") {
      updateFilter("category", undefined)
    } else {
      updateFilter("category", categoryId)
    }
  }

  const isCategorySelected = (categoryId: string) => {
    if (categoryId === "all") {
      return !filters.category || filters.category === "all"
    }
    return filters.category === categoryId
  }

  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Filters</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
              <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <DropdownSection
              title="Category"
              icon="grid-outline"
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              <View style={styles.optionsGrid}>
                {categoryOptions.map((category) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.optionChip,
                      isCategorySelected(category._id) && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleCategorySelect(category._id)}
                  >
                    <Text style={[styles.optionChipText, isCategorySelected(category._id) && { color: "#FFF" }]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>

            {/* Brand Filter */}
            <DropdownSection
              title="Brand"
              icon="business-outline"
              isOpen={openSections.brand}
              onToggle={() => toggleSection("brand")}
            >
              <View style={styles.optionsGrid}>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.optionChip,
                      filters.brand === brand && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => updateFilter("brand", filters.brand === brand ? undefined : brand)}
                  >
                    <Text style={[styles.optionChipText, filters.brand === brand && { color: "#FFF" }]}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>

            {/* Colors Filter */}
            <DropdownSection
              title="Colors"
              icon="color-palette-outline"
              isOpen={openSections.colors}
              onToggle={() => toggleSection("colors")}
            >
              <View style={styles.colorGrid}>
                {colors_options.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, filters.colors?.includes(color) && styles.colorOptionSelected]}
                    onPress={() => toggleArrayFilter("colors", color)}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color.toLowerCase() }]} />
                    <Text
                      style={[
                        styles.colorText,
                        filters.colors?.includes(color) && { color: colors.primary, fontWeight: "600" },
                      ]}
                    >
                      {color}
                    </Text>
                    {filters.colors?.includes(color) && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>

            {/* Sizes Filter */}
            <DropdownSection
              title="Sizes"
              icon="resize-outline"
              isOpen={openSections.sizes}
              onToggle={() => toggleSection("sizes")}
            >
              <View style={styles.sizeGrid}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeOption,
                      filters.sizes?.includes(size) && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => toggleArrayFilter("sizes", size)}
                  >
                    <Text style={[styles.sizeText, filters.sizes?.includes(size) && { color: "#FFF" }]}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>

            {/* Price Range */}
            <DropdownSection
              title="Price Range"
              icon="pricetag-outline"
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <View style={styles.priceContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceLabel}>Min Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    value={filters.minPrice?.toString() || ""}
                    onChangeText={(text) => updateFilter("minPrice", text ? Number.parseFloat(text) : undefined)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceSeparator}>
                  <Text style={styles.priceSeparatorText}>to</Text>
                </View>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceLabel}>Max Price</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="1000"
                    value={filters.maxPrice?.toString() || ""}
                    onChangeText={(text) => updateFilter("maxPrice", text ? Number.parseFloat(text) : undefined)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </DropdownSection>

            {/* Sort By */}
            <DropdownSection
              title="Sort By"
              icon="swap-vertical-outline"
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <View style={styles.sortContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.sortOption, filters.sort === option.value && styles.sortOptionSelected]}
                    onPress={() => updateFilter("sort", option.value)}
                  >
                    <View style={styles.sortOptionLeft}>
                      <Ionicons
                        name={option.icon as any}
                        size={20}
                        color={filters.sort === option.value ? colors.primary : "#666"}
                      />
                      <Text
                        style={[
                          styles.sortOptionText,
                          filters.sort === option.value && { color: colors.primary, fontWeight: "600" },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={filters.sort === option.value ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={filters.sort === option.value ? colors.primary : "#CCC"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>

            {/* Stock Filters */}
            <DropdownSection
              title="Stock Status"
              icon="cube-outline"
              isOpen={openSections.stock}
              onToggle={() => toggleSection("stock")}
            >
              <View style={styles.stockContainer}>
                {[
                  { key: "onlyStock", label: "In Stock Only", icon: "checkmark-circle" },
                  { key: "lowStocks", label: "Low Stock", icon: "warning" },
                  { key: "outStocks", label: "Out of Stock", icon: "close-circle" },
                ].map((stock) => (
                  <TouchableOpacity
                    key={stock.key}
                    style={[
                      styles.stockOption,
                      filters[stock.key as keyof ProductFilters] && styles.stockOptionSelected as any,
                    ]}
                    onPress={() =>
                      updateFilter(stock.key as keyof ProductFilters, !filters[stock.key as keyof ProductFilters])
                    }
                  >
                    <View style={styles.stockOptionLeft}>
                      <Ionicons
                        name={stock.icon as any}
                        size={20}
                        color={filters[stock.key as keyof ProductFilters] ? colors.primary : "#666"}
                      />
                      <Text
                        style={[
                          styles.stockOptionText,
                          filters[stock.key as keyof ProductFilters] && { color: colors.primary, fontWeight: "600" } as any,
                        ]}
                      >
                        {stock.label}
                      </Text>
                    </View>
                    <Ionicons
                      name={filters[stock.key as keyof ProductFilters] ? "checkbox" : "checkbox-outline"}
                      size={20}
                      color={filters[stock.key as keyof ProductFilters] ? colors.primary : "#CCC"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </DropdownSection>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  filterBadge: {
    marginLeft: 8,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dropdownContainer: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFF",
  },
  dropdownTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownIcon: {
    marginRight: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  dropdownContent: {
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  colorGrid: {
    gap: 12,
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  colorOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  colorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  sizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeOption: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  priceSeparator: {
    paddingTop: 20,
  },
  priceSeparatorText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  sortContainer: {
    gap: 4,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    marginBottom: 4,
  },
  sortOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  sortOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 12,
  },
  stockContainer: {
    gap: 4,
  },
  stockOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
    marginBottom: 4,
  },
  stockOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  stockOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stockOptionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#FFF",
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

