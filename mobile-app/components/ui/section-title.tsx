"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { ChevronRight } from "lucide-react-native"
import { useTheme } from "@/constants/theme"

interface SectionTitleProps {
  title: string
  actionText?: string
  onAction?: () => void
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, actionText = "See All", onAction }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={[styles.actionText, { color: colors.primary }]}>{actionText}</Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 2,
  },
})

export default SectionTitle
