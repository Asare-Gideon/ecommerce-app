"use client"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import {
    ArrowLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Key,
    Lock,
    Shield,
    Smartphone,
    Trash2,
    User,
    UserX
} from "lucide-react-native"
import { useState } from "react"
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import ReAnimated, { FadeInDown, FadeInUp } from "react-native-reanimated"

// Mock user security settings
const MOCK_SECURITY_SETTINGS = {
    twoFactorEnabled: true,
    biometricEnabled: false,
    loginNotifications: true,
    dataCollection: false,
    marketingEmails: true,
    lastPasswordChange: "2024-01-10T10:30:00Z",
    activeSessions: 3,
}

export default function PrivacySecurityScreen() {
    const { isAuthenticated } = useAuth()
    const [settings, setSettings] = useState(MOCK_SECURITY_SETTINGS)
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
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

    const handleToggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const handleChangePassword = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Alert.alert("Error", "Please fill in all password fields")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert("Error", "New passwords don't match")
            return
        }

        // Simulate password change
        Alert.alert("Success", "Password changed successfully", [
            {
                text: "OK",
                onPress: () => {
                    setShowChangePasswordModal(false)
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                },
            },
        ])
    }

    const handleDeleteAccount = () => {
        Alert.alert("Account Deleted", "Your account has been permanently deleted. We're sorry to see you go.", [
            {
                text: "OK",
                onPress: () => {
                    setShowDeleteAccountModal(false)
                    // Navigate to login or home
                    router.replace("/(tabs)")
                },
            },
        ])
    }

    const formatLastPasswordChange = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy & Security</Text>
            <View style={styles.headerSpacer} />
        </ReAnimated.View>
    )

    const renderSecuritySection = () => (
        <ReAnimated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
                <Shield size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.settingsList}>
                {/* Change Password */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => setShowChangePasswordModal(true)}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#EEF2FF" }]}>
                            <Key size={20} color="#6366F1" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Change Password</Text>
                            <Text style={styles.settingSubtitle}>
                                Last changed {formatLastPasswordChange(settings.lastPasswordChange)}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                {/* Active Sessions */}
                <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#F3E8FF" }]}>
                            <Smartphone size={20} color="#8B5CF6" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Active Sessions</Text>
                            <Text style={styles.settingSubtitle}>{settings.activeSessions} active devices</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </ReAnimated.View>
    )

    const renderPrivacySection = () => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
                <Lock size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Privacy</Text>
            </View>

            <View style={styles.settingsList}>
                {/* Login Notifications */}
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#EEF2FF" }]}>
                            <User size={20} color="#6366F1" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Login Notifications</Text>
                            <Text style={styles.settingSubtitle}>Get notified of new logins</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.loginNotifications}
                        onValueChange={() => handleToggleSetting("loginNotifications")}
                        trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Data Collection */}
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#FEF2F2" }]}>
                            <Shield size={20} color="#EF4444" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Data Collection</Text>
                            <Text style={styles.settingSubtitle}>Allow analytics and usage data</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.dataCollection}
                        onValueChange={() => handleToggleSetting("dataCollection")}
                        trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Marketing Emails */}
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#F0FDF4" }]}>
                            <User size={20} color="#10B981" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Marketing Emails</Text>
                            <Text style={styles.settingSubtitle}>Receive promotional emails</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.marketingEmails}
                        onValueChange={() => handleToggleSetting("marketingEmails")}
                        trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                        thumbColor="#fff"
                    />
                </View>
            </View>
        </ReAnimated.View>
    )

    const renderDangerZone = () => (
        <ReAnimated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
                <Trash2 size={20} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Danger Zone</Text>
            </View>

            <View style={styles.settingsList}>
                <TouchableOpacity
                    style={[styles.settingItem, styles.dangerItem]}
                    onPress={() => setShowDeleteAccountModal(true)}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: "#FEF2F2" }]}>
                            <UserX size={20} color="#EF4444" />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: "#EF4444" }]}>Delete Account</Text>
                            <Text style={styles.settingSubtitle}>Permanently delete your account and data</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </ReAnimated.View>
    )

    const renderChangePasswordModal = () => (
        <Modal transparent visible={showChangePasswordModal} animationType="fade" statusBarTranslucent={true}>
            <View style={styles.modalOverlay}>
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.passwordModal}>
                    <Text style={styles.modalTitle}>Change Password</Text>

                    <View style={styles.passwordInputs}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChangeText={(text) => setPasswordData((prev) => ({ ...prev, currentPassword: text }))}
                                    secureTextEntry={!showPasswords.current}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                                >
                                    {showPasswords.current ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onChangeText={(text) => setPasswordData((prev) => ({ ...prev, newPassword: text }))}
                                    secureTextEntry={!showPasswords.new}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                                >
                                    {showPasswords.new ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChangeText={(text) => setPasswordData((prev) => ({ ...prev, confirmPassword: text }))}
                                    secureTextEntry={!showPasswords.confirm}
                                    placeholderTextColor="#9CA3AF"
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                >
                                    {showPasswords.confirm ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowChangePasswordModal(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleChangePassword} activeOpacity={0.8}>
                            <Text style={styles.confirmButtonText}>Change Password</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const renderDeleteAccountModal = () => (
        <Modal transparent visible={showDeleteAccountModal} animationType="fade">
            <View style={styles.modalOverlay}>
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.deleteModal}>
                    <Text style={styles.deleteTitle}>Delete Account</Text>
                    <Text style={styles.deleteMessage}>
                        Are you sure you want to delete your account? This action cannot be undone and will permanently remove all
                        your data, orders, and personal information.
                    </Text>
                    <View style={styles.deleteActions}>
                        <TouchableOpacity
                            style={styles.deleteCancel}
                            onPress={() => setShowDeleteAccountModal(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.deleteCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteConfirm} onPress={handleDeleteAccount} activeOpacity={0.8}>
                            <Text style={styles.deleteConfirmText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                        <Shield size={60} color="#6366F1" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Sign in to manage security</Text>
                    <Text style={styles.authText}>
                        Create an account or sign in to access{"\n"}
                        your privacy and security settings
                    </Text>
                    <View style={styles.authButtons}>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.push("/auth/login" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={() => router.push("/auth/register" as any)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {renderSecuritySection()}
                {renderPrivacySection()}
                {renderDangerZone()}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {renderChangePasswordModal()}
            {renderDeleteAccountModal()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 32,
    },
    container: {
        flex: 1,
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
    },
    settingsList: {
        gap: 0,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    settingLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    dangerItem: {
        borderBottomColor: "#FEE2E2",
    },
    bottomSpacing: {
        height: 50,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    passwordModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 20,
        textAlign: "center",
    },
    passwordInputs: {
        gap: 16,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#1F2937",
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
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#6366F1",
        borderRadius: 8,
        alignItems: "center",
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    // Delete Modal
    deleteModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 40,
        maxWidth: 320,
    },
    deleteTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 12,
        textAlign: "center",
    },
    deleteMessage: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    deleteActions: {
        flexDirection: "row",
        gap: 12,
    },
    deleteCancel: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    deleteCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    deleteConfirm: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        alignItems: "center",
    },
    deleteConfirmText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
    },
    // Auth Required Styles
    authContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    authIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    authTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 12,
        textAlign: "center",
    },
    authText: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    authButtons: {
        width: "100%",
        gap: 12,
    },
    loginButton: {
        backgroundColor: "#6366F1",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    signupButton: {
        backgroundColor: "#F9FAFB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    signupButtonText: {
        color: "#374151",
        fontSize: 16,
        fontWeight: "600",
    },
})
