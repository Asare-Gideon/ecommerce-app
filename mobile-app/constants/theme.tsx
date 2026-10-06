"use client"

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

export function useTheme() {
    return {
        colors: lightColors,
        isDark: false,
    }
}
