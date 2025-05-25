"use client"

import { useAuth } from "@/hooks/useAuth"
import { useAlert } from "@/lib/alert-context"
import { useTheme } from "@react-navigation/native"
import { Link, router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowLeft, Eye, EyeOff, Lock, Phone } from "lucide-react-native"
import { useState } from "react"
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

type FormData = {
    phoneNumber: string
    password: string
}

type FormErrors = {
    phoneNumber?: string
    password?: string
}

export default function LoginScreen() {
    const { colors } = useTheme()
    const { login, isLoading, error, clearError } = useAuth()
    const { registeredPhone, registeredPassword } = useLocalSearchParams()
    const { showAlert } = useAlert()

    const [formData, setFormData] = useState<FormData>({
        phoneNumber: registeredPhone as string || "",
        password: registeredPassword as string || "",
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)

    // Clear any auth errors when component mounts
    useState(() => {
        clearError()
    })

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Phone validation
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required"
        } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
            newErrors.phoneNumber = "Please enter a valid phone number"
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleLogin = async () => {
        if (validateForm()) {
            try {
                await login({ phone: formData.phoneNumber, password: formData.password })
                router.replace({ pathname: "/(tabs)" })
                showAlert("success", "Login successful! Welcome back.")
            } catch (error) {
                showAlert("error", "Login failed. Please try again.")
            }
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <StatusBar style="dark" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.description}>Welcome back! Please enter your details to continue.</Text>

                    {/* Display auth error if any */}
                    {error && <Text style={styles.authError}>{error}</Text>}

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.phoneNumber ? styles.inputError : null]}>
                                <Phone size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    keyboardType="phone-pad"
                                    value={formData.phoneNumber}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, phoneNumber: text })
                                        if (errors.phoneNumber) {
                                            setErrors({ ...errors, phoneNumber: undefined })
                                        }
                                    }}
                                />
                            </View>
                            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.password ? styles.inputError : null]}>
                                <Lock size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    secureTextEntry={!showPassword}
                                    value={formData.password}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, password: text })
                                        if (errors.password) {
                                            setErrors({ ...errors, password: undefined })
                                        }
                                    }}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                                </TouchableOpacity>
                            </View>
                            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        <Link href="/auth/forgot-password" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.forgotPassword, { color: colors.primary }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    {/* Spacer to push button to bottom */}
                    <View style={styles.spacer} />

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                                <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingLeft: 10,
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
    authError: {
        color: "#FF3B30",
        backgroundColor: "#FFEEEE",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: "center",
    },
    formContainer: {
        width: "100%",
    },
    inputContainer: {
        marginBottom: 20,
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
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 16,
    },
    forgotPassword: {
        fontSize: 14,
        fontWeight: "500",
        textAlign: "right",
        marginTop: 8,
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
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    signupText: {
        fontSize: 14,
        color: "#666",
    },
    signupLink: {
        fontSize: 14,
        fontWeight: "600",
    },
})

