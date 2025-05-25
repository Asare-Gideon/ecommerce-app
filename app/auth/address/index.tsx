"use client"

import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowLeft, Building2, Home, MapPin, Navigation } from "lucide-react-native"
import { useState } from "react"
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

type FormData = {
    streetAddress: string
    apartment: string
    city: string
    zipCode: string
    country: string
}

type FormErrors = {
    streetAddress?: string
    city?: string
    zipCode?: string
    country?: string
}

export default function AddressScreen() {
    const { colors } = useTheme()
    const [formData, setFormData] = useState<FormData>({
        streetAddress: "",
        apartment: "",
        city: "",
        zipCode: "",
        country: "",
    })
    const [errors, setErrors] = useState<FormErrors>({})

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.streetAddress) {
            newErrors.streetAddress = "Street address is required"
        }

        if (!formData.city) {
            newErrors.city = "City is required"
        }

        if (!formData.zipCode) {
            newErrors.zipCode = "ZIP code is required"
        }

        if (!formData.country) {
            newErrors.country = "Country is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSaveAddress = () => {
        if (validateForm()) {
            // Save address and navigate to home
            //   router.replace("/(tabs)/home")
        }
    }

    const handleUseCurrentLocation = () => {
        // This would normally request location permissions and get the user's location
        // For demo purposes, we'll just show a success message
        setFormData({
            streetAddress: "123 Main Street",
            apartment: "",
            city: "New York",
            zipCode: "10001",
            country: "United States",
        })
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <StatusBar style="dark" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>

                    <Text style={styles.title}>Your Address</Text>
                    <Text style={styles.description}>Please provide your shipping address details.</Text>

                    {/* Current Location Button */}
                    <TouchableOpacity
                        style={[styles.locationButton, { borderColor: colors.primary }]}
                        onPress={handleUseCurrentLocation}
                    >
                        <Navigation size={20} color={colors.primary} style={styles.locationIcon} />
                        <Text style={[styles.locationText, { color: colors.primary }]}>Use Current Location</Text>
                    </TouchableOpacity>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.streetAddress ? styles.inputError : null]}>
                                <MapPin size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Street Address"
                                    value={formData.streetAddress}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, streetAddress: text })
                                        if (errors.streetAddress) {
                                            setErrors({ ...errors, streetAddress: undefined })
                                        }
                                    }}
                                />
                            </View>
                            {errors.streetAddress && <Text style={styles.errorText}>{errors.streetAddress}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Home size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Apartment, Suite, etc. (optional)"
                                    value={formData.apartment}
                                    onChangeText={(text) => setFormData({ ...formData, apartment: text })}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.city ? styles.inputError : null]}>
                                <Building2 size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    value={formData.city}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, city: text })
                                        if (errors.city) {
                                            setErrors({ ...errors, city: undefined })
                                        }
                                    }}
                                />
                            </View>
                            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                        </View>

                        <View style={styles.rowContainer}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <View style={[styles.inputWrapper, errors.zipCode ? styles.inputError : null]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="ZIP Code"
                                        keyboardType="numeric"
                                        value={formData.zipCode}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, zipCode: text })
                                            if (errors.zipCode) {
                                                setErrors({ ...errors, zipCode: undefined })
                                            }
                                        }}
                                    />
                                </View>
                                {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                            </View>

                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <View style={[styles.inputWrapper, errors.country ? styles.inputError : null]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Country"
                                        value={formData.country}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, country: text })
                                            if (errors.country) {
                                                setErrors({ ...errors, country: undefined })
                                            }
                                        }}
                                    />
                                </View>
                                {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
                            </View>
                        </View>
                    </View>

                    {/* Spacer to push button to bottom */}
                    <View style={styles.spacer} />

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSaveAddress}>
                            <Text style={styles.buttonText}>Save Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 24,
    },
    header: {
        marginBottom: 20,
        height: 80,
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingLeft: 10
    },
    backButton: {
        padding: 8,
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 32,
        lineHeight: 24,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 30,
        paddingVertical: 12,
        marginBottom: 24,
    },
    locationIcon: {
        marginRight: 8,
    },
    locationText: {
        fontSize: 16,
        fontWeight: "500",
    },
    formContainer: {
        width: "100%",
    },
    inputContainer: {
        marginBottom: 20,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 15,
        paddingHorizontal: 16,
        height: 54,
        backgroundColor: "#FAFAFA",
    },
    inputError: {
        borderColor: "#FF3B30",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 16,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 16,
    },
    spacer: {
        flex: 1,
        minHeight: 40,
    },
    bottomSection: {
        width: "100%",
    },
    button: {
        height: 54,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
})
