"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { Tabs } from "expo-router"
import { Heart, Home, Search, User } from "lucide-react-native"
import { useEffect } from "react"

export default function TabsLayout() {
  const { requireAuth } = useAuth()
  const { colors } = useTheme()

  // Require authentication for all tab screens
  useEffect(() => {
    requireAuth()
  }, [])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4CD964",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ color, size }) => <Heart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}

