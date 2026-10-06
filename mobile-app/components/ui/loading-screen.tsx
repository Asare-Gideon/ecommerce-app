"use client"

import type React from "react"
import { View, ActivityIndicator, StyleSheet, Text } from "react-native"
import { useTheme } from "@/constants/theme"

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CD964" />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
})

export default LoadingScreen
