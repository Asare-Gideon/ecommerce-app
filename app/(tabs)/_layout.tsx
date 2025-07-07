"use client"

import { useTheme } from "@/constants/theme"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import { Tabs } from "expo-router"
import { Heart, Home, ShoppingBag, User } from "lucide-react-native"
import { useEffect } from "react"
import { Platform, Text, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

// Badge component
const Badge = ({ count }: { count: number }) => {
  if (count === 0) return null

  return (
    <View
      style={{
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {count > 99 ? "99+" : count.toString()}
      </Text>
    </View>
  )
}

// Animated tab icon component with badge support
const AnimatedTabIcon = ({
  icon: Icon,
  color,
  focused,
  badgeCount,
}: {
  icon: any
  color: string
  focused: boolean
  badgeCount?: number
}) => {
  const scale = useSharedValue(focused ? 1 : 0.8)
  const translateY = useSharedValue(focused ? -2 : 0)

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 20,
      stiffness: 200,
    })
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 20,
      stiffness: 200,
    })
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }))

  return (
    <View style={{ position: "relative" }}>
      <Animated.View style={animatedStyle}>
        <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      </Animated.View>
      {badgeCount !== undefined && <Badge count={badgeCount} />}
    </View>
  )
}

export default function TabsLayout() {
  const { requireAuth } = useAuth()
  const { colors } = useTheme()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  // Require authentication for all tab screens
  useEffect(() => {
    requireAuth()
  }, [])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1", // Modern indigo color
        tabBarInactiveTintColor: "#9CA3AF", // Subtle gray
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 4,
          backgroundColor: "#FFFFFF",
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 17,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          ...Platform.select({
            android: {
              elevation: 8,
            },
          }),
        },
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        // Remove the custom tabBarButton to restore navigation functionality
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={Heart} color={color} focused={focused} badgeCount={wishlistCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="carts"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon={ShoppingBag} color={color} focused={focused} badgeCount={cartCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ color, focused }) => <AnimatedTabIcon icon={User} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  )
}

