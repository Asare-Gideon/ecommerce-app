"use client"

import { useAuth } from "@/hooks/useAuth"
import { useAlert } from "@/lib/alert-context"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react-native"
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
    fullName: string
    email: string
    password: string
    confirmPassword: string
    agreeToTerms: boolean
}

type FormErrors = {
    phoneNumber?: string
    fullName?: string
    email?: string
    password?: string
    confirmPassword?: string
    agreeToTerms?: string
}

export default function RegisterScreen() {
    const { colors } = useTheme()
    const { register, isLoading, error, clearError } = useAuth()

    const [formData, setFormData] = useState<FormData>({
        phoneNumber: "",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { showAlert } = useAlert()

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

        // Full name validation
        if (!formData.fullName) {
            newErrors.fullName = "Full name is required"
        }

        // Email validation (optional)
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = "You must agree to the terms"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSignUp = async () => {
        if (validateForm()) {
            try {
                // Split full name into first name and last name
                const nameParts = formData.fullName.trim().split(" ")
                const firstName = nameParts[0]
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

                await register({
                    phone: formData.phoneNumber,
                    firstName,
                    lastName,
                    email: formData.email || undefined,
                    password: formData.password,
                })

                router.push({
                    pathname: "/auth/login",
                    params: {
                        registeredPhone: formData.phoneNumber,
                        registeredPassword: formData.password,
                    }
                })
                showAlert("success", "Registration successful! Please login.")
            } catch (error) {
                // showAlert("error", "Registration failed. Please try again.")
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
                    <Text style={styles.title}>Sign Up</Text>
                    <Text style={styles.description}>Create an account to start shopping with us.</Text>

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
                            <View style={[styles.inputWrapper, errors.fullName ? styles.inputError : null]}>
                                <User size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, fullName: text })
                                        if (errors.fullName) {
                                            setErrors({ ...errors, fullName: undefined })
                                        }
                                    }}
                                />
                            </View>
                            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.email ? styles.inputError : null]}>
                                <Mail size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email (Optional)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.email}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, email: text })
                                        if (errors.email) {
                                            setErrors({ ...errors, email: undefined })
                                        }
                                    }}
                                />
                            </View>
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : null]}>
                                <Lock size={20} color="#999" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    secureTextEntry={!showConfirmPassword}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, confirmPassword: text })
                                        if (errors.confirmPassword) {
                                            setErrors({ ...errors, confirmPassword: undefined })
                                        }
                                    }}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    {showConfirmPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                        </View>

                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => {
                                    setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })
                                    if (errors.agreeToTerms) {
                                        setErrors({ ...errors, agreeToTerms: undefined })
                                    }
                                }}
                            >
                                <View
                                    style={[styles.checkboxInner, formData.agreeToTerms ? { backgroundColor: colors.primary } : {}]}
                                />
                            </TouchableOpacity>
                            <Text style={styles.termsText}>
                                I Have Read And Agree To{" "}
                                <Text style={[styles.termsLink, { color: colors.primary }]}>User Agreement & Privacy Policy</Text>
                            </Text>
                        </View>
                        {errors.agreeToTerms && <Text style={[styles.errorText, { marginLeft: 0 }]}>{errors.agreeToTerms}</Text>}
                    </View>

                    {/* Spacer to push button to bottom */}
                    <View style={styles.spacer} />

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push("/auth/login" as any)} >
                                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
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
    termsContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: 8,
        marginBottom: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#999",
        marginRight: 12,
        marginTop: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxInner: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    termsLink: {
        fontWeight: "500",
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
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    loginText: {
        fontSize: 14,
        color: "#666",
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "600",
    },
})

