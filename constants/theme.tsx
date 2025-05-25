"use client"

import { useColorScheme } from "react-native"

// Define the theme colors
const lightColors = {
    primary: "#2463eb",
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#000000",
    border: "#E0E0E0",
    notification: "#FF3B30",
    error: "#FF3B30",
    success: "#34C759",
    gray: {
        100: "#F5F5F5",
        200: "#EEEEEE",
        300: "#E0E0E0",
        400: "#BDBDBD",
        500: "#9E9E9E",
        600: "#757575",
        700: "#616161",
        800: "#424242",
        900: "#212121",
    },
}

const darkColors = {
    primary: "#2463eb",
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    border: "#2C2C2C",
    notification: "#FF453A",
    error: "#FF453A",
    success: "#30D158",
    gray: {
        100: "#212121",
        200: "#424242",
        300: "#616161",
        400: "#757575",
        500: "#9E9E9E",
        600: "#BDBDBD",
        700: "#E0E0E0",
        800: "#EEEEEE",
        900: "#F5F5F5",
    },
}

export function useTheme() {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === "dark"

    return {
        colors: isDark ? darkColors : lightColors,
        isDark,
    }
}