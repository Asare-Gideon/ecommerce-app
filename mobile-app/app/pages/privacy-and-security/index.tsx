"use client"

import { CustomAlert } from "@/components/ui/custom-alert"
import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { router } from "expo-router"
import {
    ArrowLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Key,
    Lock,
    Shield,
    Trash2,
    User,
    UserX,
} from "lucide-react-native"
import { useState } from "react"
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const POLICY_ITEMS = [
    {
        title: "Account details",
        text: "Your name, phone, email, and saved addresses are used to manage your account and deliver orders.",
        icon: User,
        color: "#6366F1",
        background: "#EEF2FF",
    },
    {
        title: "Orders and payments",
        text: "Order records, payment status, and delivery details are kept so you can track purchases and get support.",
        icon: Shield,
        color: "#10B981",
        background: "#F0FDF4",
    },
    {
        title: "Your control",
        text: "When signed in, you can change your password or permanently delete your account from this page.",
        icon: Lock,
        color: "#EF4444",
        background: "#FEF2F2",
    },
]

export default function PrivacySecurityScreen() {
    const { isAuthenticated, logout } = useAuth()
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [showDeleteAccountAlert, setShowDeleteAccountAlert] = useState(false)
    const [isDeletingAccount, setIsDeletingAccount] = useState(false)
    const [feedbackAlert, setFeedbackAlert] = useState<{
        visible: boolean
        type: "success" | "error"
        title: string
        message: string
    }>({
        visible: false,
        type: "success",
        title: "",
        message: "",
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    const closePasswordModal = () => {
        setShowChangePasswordModal(false)
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowPasswords({ current: false, new: false, confirm: false })
    }

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Alert.alert("Error", "Please fill in all password fields")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert("Error", "New passwords do not match")
            return
        }

        try {
            await api.put("/user/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
            closePasswordModal()
            setFeedbackAlert({
                visible: true,
                type: "success",
                title: "Password Changed",
                message: "Your password has been updated successfully.",
            })
        } catch (error: any) {
            setFeedbackAlert({
                visible: true,
                type: "error",
                title: "Unable to Change Password",
                message: error.response?.data?.message || "Please check your current password and try again.",
            })
        }
    }

    const handleDeleteAccount = async () => {
        if (isDeletingAccount) return

        setIsDeletingAccount(true)
        try {
            await api.delete("/user/delete-account")
            setShowDeleteAccountAlert(false)
            await logout()
            setFeedbackAlert({
                visible: true,
                type: "success",
                title: "Account Deleted",
                message: "Your account has been permanently deleted.",
            })
        } catch (error: any) {
            setFeedbackAlert({
                visible: true,
                type: "error",
                title: "Unable to Delete Account",
                message: error.response?.data?.message || "Please try again in a moment.",
            })
        } finally {
            setIsDeletingAccount(false)
        }
    }

    const renderHeader = () => (
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.72}>
                <ArrowLeft size={24} color="#111111" strokeWidth={2.4} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy & Policy</Text>
            <View style={styles.headerSpacer} />
        </Animated.View>
    )

    const renderPolicySection = () => (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
            <Text style={styles.sectionLabel}>Simple Policy</Text>
            <View style={styles.card}>
                {POLICY_ITEMS.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <View key={item.title} style={[styles.policyItem, index !== POLICY_ITEMS.length - 1 && styles.rowBorder]}>
                            <View style={[styles.policyIcon, { backgroundColor: item.background }]}>
                                <Icon size={20} color={item.color} strokeWidth={2.2} />
                            </View>
                            <View style={styles.policyCopy}>
                                <Text style={styles.policyTitle}>{item.title}</Text>
                                <Text style={styles.policyText}>{item.text}</Text>
                            </View>
                        </View>
                    )
                })}
            </View>
        </Animated.View>
    )

    const renderAccountControls = () => {
        if (!isAuthenticated) {
            return (
                <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>Account Controls</Text>
                    <View style={styles.authCard}>
                        <Text style={styles.authTitle}>Sign in to manage your account</Text>
                        <Text style={styles.authText}>
                            Password changes and account deletion are available after you sign in.
                        </Text>
                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={() => router.push("/auth/login" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.authButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )
        }

        return (
            <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.section}>
                <Text style={styles.sectionLabel}>Account Controls</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={[styles.actionRow, styles.rowBorder]}
                        onPress={() => setShowChangePasswordModal(true)}
                        activeOpacity={0.72}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
                            <Key size={20} color="#6366F1" strokeWidth={2.2} />
                        </View>
                        <View style={styles.actionCopy}>
                            <Text style={styles.actionTitle}>Change Password</Text>
                            <Text style={styles.actionText}>Update your account password.</Text>
                        </View>
                        <ChevronRight size={20} color="#8A8A8E" strokeWidth={2.2} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionRow}
                        onPress={() => setShowDeleteAccountAlert(true)}
                        activeOpacity={0.72}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: "#FEF2F2" }]}>
                            <UserX size={20} color="#EF4444" strokeWidth={2.2} />
                        </View>
                        <View style={styles.actionCopy}>
                            <Text style={[styles.actionTitle, styles.dangerText]}>Delete Account</Text>
                            <Text style={styles.actionText}>Permanently remove your account.</Text>
                        </View>
                        <Trash2 size={20} color="#EF4444" strokeWidth={2.2} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    }

    const renderPasswordField = (
        label: string,
        key: keyof typeof passwordData,
        visibleKey: keyof typeof showPasswords,
        placeholder: string,
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder={placeholder}
                    value={passwordData[key]}
                    onChangeText={(text) => setPasswordData((prev) => ({ ...prev, [key]: text }))}
                    secureTextEntry={!showPasswords[visibleKey]}
                    placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords((prev) => ({ ...prev, [visibleKey]: !prev[visibleKey] }))}
                    activeOpacity={0.72}
                >
                    {showPasswords[visibleKey] ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </TouchableOpacity>
            </View>
        </View>
    )

    const renderChangePasswordModal = () => (
        <Modal transparent visible={showChangePasswordModal} animationType="fade" statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <Animated.View entering={FadeInUp.springify()} style={styles.passwordModal}>
                    <Text style={styles.modalTitle}>Change Password</Text>
                    <Text style={styles.modalText}>Choose a new password for your account.</Text>

                    <View style={styles.passwordInputs}>
                        {renderPasswordField("Current Password", "currentPassword", "current", "Enter current password")}
                        {renderPasswordField("New Password", "newPassword", "new", "Enter new password")}
                        {renderPasswordField("Confirm New Password", "confirmPassword", "confirm", "Confirm new password")}
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={closePasswordModal} activeOpacity={0.8}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleChangePassword} activeOpacity={0.8}>
                            <Text style={styles.confirmButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            {renderHeader()}

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {renderPolicySection()}
                {renderAccountControls()}
            </ScrollView>

            {renderChangePasswordModal()}
            <CustomAlert
                visible={showDeleteAccountAlert}
                type="warning"
                title="Delete Account"
                message="This permanently removes your account and signs you out. This action cannot be undone."
                primaryButton={{
                    text: isDeletingAccount ? "Deleting..." : "Delete",
                    onPress: handleDeleteAccount,
                    style: "destructive",
                }}
                secondaryButton={{
                    text: "Cancel",
                    onPress: () => setShowDeleteAccountAlert(false),
                }}
            />
            <CustomAlert
                visible={feedbackAlert.visible}
                type={feedbackAlert.type}
                title={feedbackAlert.title}
                message={feedbackAlert.message}
                primaryButton={{
                    text: "OK",
                    onPress: () => {
                        const wasDeleted = feedbackAlert.type === "success" && feedbackAlert.title === "Account Deleted"
                        setFeedbackAlert((current) => ({ ...current, visible: false }))
                        if (wasDeleted) {
                            router.replace("/(tabs)" as any)
                        }
                    },
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F1F2",
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F6",
    },
    headerTitle: {
        color: "#111111",
        fontSize: 19,
        fontWeight: "700",
        lineHeight: 24,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    section: {
        marginBottom: 26,
    },
    sectionLabel: {
        color: "#666666",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
        lineHeight: 16,
        marginBottom: 12,
        textTransform: "uppercase",
    },
    card: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F1F1F2",
    },
    policyItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
    },
    policyIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 13,
    },
    policyCopy: {
        flex: 1,
    },
    policyTitle: {
        color: "#111111",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 21,
    },
    policyText: {
        color: "#666666",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 21,
        marginTop: 4,
    },
    authCard: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#FFFFFF",
    },
    authTitle: {
        color: "#111111",
        fontSize: 17,
        fontWeight: "800",
        lineHeight: 23,
        marginBottom: 6,
    },
    authText: {
        color: "#666666",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 21,
        marginBottom: 16,
    },
    authButton: {
        minHeight: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
    },
    authButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
    actionRow: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 13,
    },
    actionCopy: {
        flex: 1,
        minWidth: 0,
    },
    actionTitle: {
        color: "#111111",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 21,
    },
    actionText: {
        color: "#666666",
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
        marginTop: 2,
    },
    dangerText: {
        color: "#EF4444",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    passwordModal: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 20,
        padding: 22,
        backgroundColor: "#FFFFFF",
    },
    modalTitle: {
        color: "#111111",
        fontSize: 20,
        fontWeight: "800",
        textAlign: "center",
        lineHeight: 26,
    },
    modalText: {
        color: "#666666",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
        lineHeight: 20,
        marginTop: 6,
        marginBottom: 20,
    },
    passwordInputs: {
        gap: 14,
        marginBottom: 22,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        color: "#374151",
        fontSize: 14,
        fontWeight: "700",
    },
    passwordInputContainer: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: "#111111",
        fontSize: 15,
    },
    eyeButton: {
        padding: 12,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#F9FAFB",
    },
    cancelButtonText: {
        color: "#374151",
        fontSize: 15,
        fontWeight: "800",
    },
    confirmButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
    },
    confirmButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
})
