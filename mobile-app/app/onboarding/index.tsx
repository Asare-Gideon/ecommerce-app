"use client"

import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowRight } from "lucide-react-native"
import { useRef, useState } from "react"
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const { width, height } = Dimensions.get("window")
const img = require("../../assets/images/onboarding3.png")

// Onboarding data
const onboardingData = [
    {
        id: "1",
        title: "Personalized Based On Where You Are",
        description: "Location services enhance accuracy, personalize your experience, and show local trends.",
    },
    {
        id: "2",
        title: "Discover Latest Fashion Trends",
        description: "Browse through our curated collection of the latest styles and fashion items.",
    },
    {
        id: "3",
        title: "Fast & Secure Checkout",
        description: "Enjoy a seamless shopping experience with our quick and secure payment options.",
    },
]


export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)
    const { colors } = useTheme()
    const { setFirstVisit } = useAuth()

    const handleGetStarted = () => {
        if (currentIndex < onboardingData.length - 1) {
            // Go to next slide
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            })
        } else {
            router.replace("/(tabs)")
            setFirstVisit(false)
        }
    }

    const handleScroll = (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.x
        const index = Math.round(scrollPosition / width)
        setCurrentIndex(index)
    }

    const renderOnboardingItem = ({ item }: { item: (typeof onboardingData)[0] }) => {
        return (
            <View style={styles.slideContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.description}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.imageSection}>
                <Image
                    source={img}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Gradient overlay that fades the bottom of image into white */}
                <LinearGradient colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.5)", "#ffffff"]} style={styles.gradient} />
            </View>

            {/* Swipeable Content Section */}
            <View style={styles.contentSection}>
                <View>

                    <FlatList
                        ref={flatListRef}
                        data={onboardingData}
                        renderItem={renderOnboardingItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onScroll={handleScroll}
                        decelerationRate="fast"
                        snapToAlignment="center"
                        snapToInterval={width}
                        contentContainerStyle={{ marginBottom: 20 }}

                    />

                    {/* Fixed Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            {onboardingData.map((_, index) => (
                                <View
                                    key={index}
                                    style={[styles.progressIndicator, { backgroundColor: index == currentIndex ? colors.primary : "#E0E0E0", width: index == currentIndex ? 18 : 5 }]}
                                />
                            ))}
                        </View>
                    </View>

                </View>

                {/* Get Started Button */}
                <TouchableOpacity style={[styles.button, { borderColor: "gray" }]} onPress={handleGetStarted} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>{currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
                    <View style={styles.arrowContainer}>
                        <ArrowRight size={18} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    imageSection: {
        height: height * 0.62,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.2,
    },
    contentSection: {
        flex: 1,
        paddingTop: 45,
        paddingBottom: 30,
    },
    slideContainer: {
        width: width,
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "left",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        textAlign: "left",
        lineHeight: 22,
    },
    progressContainer: {
        alignItems: "center",
        marginBottom: 40,
        alignSelf: "flex-start",
        marginLeft: 30,
    },
    progressBar: {
        flexDirection: "row",
        alignItems: "center",
        height: 6,
        borderRadius: 10,
    },
    progressIndicator: {
        height: 5,
        borderRadius: 10,
        marginRight: 6
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        marginHorizontal: 24,
        borderWidth: 1.5,
        position: "relative",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    arrowContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#2463eb",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        right: 2,
    },
})

