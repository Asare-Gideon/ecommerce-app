import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"

export default function StartupScreen() {
    const { firstVisit, hasHydrated } = useAuth()

    useEffect(() => {
        if (!hasHydrated) return

        router.replace(firstVisit ? "/onboarding" : "/(tabs)")
    }, [firstVisit, hasHydrated])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#6366F1" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
})
