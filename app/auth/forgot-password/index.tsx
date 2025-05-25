"use client"

import { useAuth } from "@/hooks/useAuth"
import { useAlert } from "@/lib/alert-context"
import { useTheme } from "@react-navigation/native"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ArrowLeft, Eye, EyeOff, Lock, Phone } from "lucide-react-native"
import { useRef, useState } from "react"
import {
    ActivityIndicator,
    Clipboard,
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
    verificationCode: string[]
    newPassword: string
    confirmPassword: string
}

type FormErrors = {
    phoneNumber?: string
    verificationCode?: string
    newPassword?: string
    confirmPassword?: string
}

// Steps in the forgot password flow
enum ResetStep {
    PHONE_NUMBER = 0,
    VERIFICATION_CODE = 1,
    NEW_PASSWORD = 2,
}

export default function ForgotPasswordScreen() {
    const { colors } = useTheme()
    const [formData, setFormData] = useState<FormData>({
        phoneNumber: "",
        verificationCode: ["", "", "", "", "", ""],
        newPassword: "",
        confirmPassword: "",
    })
    const { requestVerificationCode, isLoading, error, clearError, verifyCode, resetPassword } = useAuth()
    const [errors, setErrors] = useState<FormErrors>({})
    const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.PHONE_NUMBER)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { showAlert } = useAlert()

    // Refs for verification code inputs
    const codeInputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null, null])

    const validatePhoneNumber = (): boolean => {
        const newErrors: FormErrors = {}

        // Phone validation
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone number is required"
        } else if (!/^\d{10,15}$/.test(formData.phoneNumber.replace(/\D/g, ""))) {
            newErrors.phoneNumber = "Please enter a valid phone number"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateVerificationCode = (): boolean => {
        const newErrors: FormErrors = {}

        // Verification code validation
        const code = formData.verificationCode.join("")
        if (!code || code.length !== 6) {
            newErrors.verificationCode = "Please enter the complete verification code"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateNewPassword = (): boolean => {
        const newErrors: FormErrors = {}

        // Password validation
        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required"
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters"
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSendCode = async () => {
        if (validatePhoneNumber()) {
            try {
                await requestVerificationCode(formData.phoneNumber)
                setCurrentStep(ResetStep.VERIFICATION_CODE)
                showAlert("success", "Verification code sent successfully.")
            } catch (error) {
                showAlert("error", "Failed to send verification code. Please try again.")
            }
        }
    }

    const handleVerifyCode = async () => {
        if (validateVerificationCode()) {
            try {
                await verifyCode(formData.verificationCode.join(""))
                setCurrentStep(ResetStep.NEW_PASSWORD)
                showAlert("success", "Verification code verified successfully.")
            } catch (error) {
                showAlert("error", "Failed to verify code. Please try again.")
            }
        }
    }

    const handleResetPassword = async () => {
        if (validateNewPassword()) {
            try {
                await resetPassword({
                    password: formData.newPassword,
                    resetToken: formData.verificationCode.join(""),
                })
                setCurrentStep(ResetStep.NEW_PASSWORD)
                router.replace("/auth/login" as any)
                showAlert("success", "Password reset successfully.")
            } catch (error) {
                showAlert("error", "Failed to reset password. Please try again.")
            }

        }
    }

    const handleCodeChange = (text: string, index: number) => {
        const newVerificationCode = [...formData.verificationCode]
        newVerificationCode[index] = text

        setFormData({ ...formData, verificationCode: newVerificationCode })

        // Clear verification code error if it exists
        if (errors.verificationCode) {
            setErrors({ ...errors, verificationCode: undefined })
        }

        // Auto-focus to next input if a digit was entered
        if (text.length === 1 && index < 5) {
            codeInputRefs.current[index + 1]?.focus()
        }
    }

    // Handle backspace in verification code input
    const handleKeyPress = (e: any, index: number) => {
        // If backspace is pressed and current input is empty, focus previous input
        if (e.nativeEvent.key === "Backspace" && !formData.verificationCode[index] && index > 0) {
            codeInputRefs.current[index - 1]?.focus()
        }
    }

    // Handle paste for verification code
    const handleCodeInputFocus = async (index: number) => {
        try {
            const clipboardContent = await Clipboard.getString()

            // Check if clipboard contains what looks like a verification code
            if (clipboardContent && /^\d{6}$/.test(clipboardContent) && formData.verificationCode.join("") === "") {
                const codeArray = clipboardContent.split("")
                setFormData({ ...formData, verificationCode: codeArray })

                // Focus the last input after pasting
                setTimeout(() => {
                    codeInputRefs.current[5]?.focus()
                }, 100)
            }
        } catch (error) {
            showAlert("error", "Failed to read clipboard. Please try again.")
        }
    }

    const renderPhoneNumberStep = () => {
        return (
            <View style={styles.stepContent}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.description}>
                    Enter your phone number and we'll send you a code to reset your password.
                </Text>

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
                </View>

                <View style={styles.spacer} />

                <View style={styles.bottomSection}>
                    <TouchableOpacity disabled={isLoading} style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSendCode}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Code</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderVerificationCodeStep = () => {
        return (
            <View style={styles.stepContent}>
                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.description}>Enter the 6-digit verification code sent to {formData.phoneNumber}.</Text>

                <View style={styles.formContainer}>
                    <View style={styles.codeContainer}>
                        {formData.verificationCode.map((digit, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.codeInputBox,
                                    errors.verificationCode ? styles.inputError : null,
                                    digit ? styles.codeInputBoxFilled : {},
                                ]}
                            >
                                <TextInput
                                    ref={(ref) => (codeInputRefs.current[index] = ref as any)}
                                    style={styles.codeInputText}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    onFocus={() => handleCodeInputFocus(index)}
                                />
                            </View>
                        ))}
                    </View>
                    {errors.verificationCode && <Text style={styles.errorText}>{errors.verificationCode}</Text>}

                    <TouchableOpacity onPress={handleSendCode} style={styles.resendCodeContainer}>
                        <Text style={styles.resendCodeText}>Didn't receive the code? </Text>
                        <Text style={[styles.resendCodeLink, { color: colors.primary }]}>Resend Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.spacer} />

                <View style={styles.bottomSection}>
                    <TouchableOpacity disabled={isLoading} style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleVerifyCode}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify Code</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderNewPasswordStep = () => {
        return (
            <View style={styles.stepContent}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.description}>Create a new password for your account.</Text>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, errors.newPassword ? styles.inputError : null]}>
                            <Lock size={20} color="#999" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                secureTextEntry={!showPassword}
                                value={formData.newPassword}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, newPassword: text })
                                    if (errors.newPassword) {
                                        setErrors({ ...errors, newPassword: undefined })
                                    }
                                }}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
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
                </View>

                <View style={styles.spacer} />

                <View style={styles.bottomSection}>
                    <TouchableOpacity disabled={isLoading} style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleResetPassword}>
                        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    // Render the current step content
    const renderCurrentStep = () => {
        switch (currentStep) {
            case ResetStep.PHONE_NUMBER:
                return renderPhoneNumberStep()
            case ResetStep.VERIFICATION_CODE:
                return renderVerificationCodeStep()
            case ResetStep.NEW_PASSWORD:
                return renderNewPasswordStep()
            default:
                return null
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
                <TouchableOpacity
                    onPress={() => {
                        if (currentStep === ResetStep.PHONE_NUMBER) {
                            router.back()
                        } else {
                            setCurrentStep(currentStep - 1)
                        }
                    }}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.authError}>{error}</Text>}
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.container}>{renderCurrentStep()}</View>
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
    authError: {
        color: "#FF3B30",
        backgroundColor: "#FFEEEE",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: "center",
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
    stepContent: {
        flex: 1,
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
    codeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    codeInputBox: {
        width: 45,
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#FAFAFA",
        justifyContent: "center",
        alignItems: "center",
    },
    codeInputBoxFilled: {
        borderColor: "#999",
        backgroundColor: "#F5F5F5",
    },
    codeInputText: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        width: "100%",
        height: "100%",
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
    resendCodeContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    resendCodeText: {
        fontSize: 14,
        color: "#666",
    },
    resendCodeLink: {
        fontSize: 14,
        fontWeight: "600",
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

