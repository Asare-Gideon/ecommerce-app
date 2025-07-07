"use client"

import type React from "react"

import { CustomAlert } from "@/components/ui/custom-alert"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import {
    Bell,
    ChevronRight,
    Edit3,
    HelpCircle,
    LogOut,
    MapPin,
    Package,
    Shield,
    Star,
    User
} from "lucide-react-native"
import { useState } from "react"
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

interface MenuItemProps {
    icon: React.ReactNode
    title: string
    subtitle?: string
    onPress: () => void
    showChevron?: boolean
    badge?: string | number
}

const MenuItem = ({ icon, title, subtitle, onPress, showChevron = true, badge }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>{icon}</View>
            <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{title}</Text>
                {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
            </View>
        </View>
        <View style={styles.menuItemRight}>
            {badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            )}
            {showChevron && <ChevronRight size={20} color="#9CA3AF" />}
        </View>
    </TouchableOpacity>
)

export default function AccountScreen() {
    const { user, logout, isAuthenticated, isLoading } = useAuth()
    const [showLogoutAlert, setShowLogoutAlert] = useState(false)

    const handleLogin = () => {
        router.push("/auth/login" as any)
    }

    const handleSignup = () => {
        router.push("/auth/register" as any)
    }

    const handleEditProfile = () => {
        Alert.alert("Edit Profile", "Navigate to edit profile screen")
    }


    const handleAddresses = () => {
        router.push("/pages/addresses" as any)
    }

    const handleNotifications = () => {
        router.push("/pages/notifications" as any)
    }


    const handleReviews = () => {
        router.push("/pages/reviews" as any)
    }

    const handleSettings = () => {
        router.push("/pages/settings" as any)
    }

    const handlePrivacy = () => {
        Alert.alert("Privacy & Security", "Navigate to privacy screen")
    }

    const handleHelp = () => {
        Alert.alert("Help & Support", "Navigate to help screen")
    }

    const handleLogout = () => {
        setShowLogoutAlert(true)
    }

    const confirmLogout = () => {
        setShowLogoutAlert(false)
        logout()
        router.replace("/auth/login" as any)
    }

    const cancelLogout = () => {
        setShowLogoutAlert(false)
    }

    const renderProfileSection = () => {
        if (!isAuthenticated) {
            return (
                <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.profileSection}>
                    <View style={styles.loginCard}>
                        <View style={styles.loginIconContainer}>
                            <User size={50} color="#6366F1" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.loginTitle}>Welcome to Your Account</Text>
                        <Text style={styles.loginSubtitle}>Sign in to access your orders, wishlist, and more</Text>
                        <View style={styles.loginButtons}>
                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.signupButton} onPress={handleSignup} activeOpacity={0.8}>
                                <Text style={styles.signupButtonText}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )
        }

        return (
            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.profileSection}>
                <View style={styles.profileCard}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri: `https://ui-avatars.com/api/?name=${`${user?.firstName} ${user?.lastName}` || "User"}&size=80&background=6366F1&color=fff`,
                                }}
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{`${user?.firstName} ${user?.lastName}` || "User Name"}</Text>
                            <Text style={styles.userPhone}>{user?.phone || "+1 234 567 8900"}</Text>
                            <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile} activeOpacity={0.7}>
                        <Edit3 size={16} color="#6366F1" />
                        <Text style={styles.editProfileText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Fixed Header with Centered Title */}
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>
            </Animated.View>

            {/* Fixed Profile Section */}
            {renderProfileSection()}

            {/* Scrollable Content */}
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Menu Sections - Only show if authenticated */}
                {isAuthenticated && (
                    <>
                        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.menuSection}>
                            <Text style={styles.sectionTitle}>Orders & Shopping</Text>
                            <View style={styles.menuCard}>
                                <MenuItem
                                    icon={<Package size={22} color="#6366F1" />}
                                    title="My Orders"
                                    subtitle="Track your orders"
                                    onPress={() => router.push("/pages/orders" as any)}
                                    badge="3"
                                />
                                <View style={styles.menuSeparator} />
                                <MenuItem
                                    icon={<Star size={22} color="#F59E0B" />}
                                    title="Reviews & Ratings"
                                    subtitle="Rate your purchases"
                                    onPress={() => router.push("/pages/reviews" as any)}
                                />
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.menuSection}>
                            <Text style={styles.sectionTitle}>Account Settings</Text>
                            <View style={styles.menuCard}>
                                <MenuItem
                                    icon={<MapPin size={22} color="#10B981" />}
                                    title="Addresses"
                                    subtitle="Manage delivery addresses"
                                    onPress={() => router.push("/pages/addresses" as any)}
                                />
                                <View style={styles.menuSeparator} />
                                <MenuItem
                                    icon={<Bell size={22} color="#F97316" />}
                                    title="Notifications"
                                    subtitle="Manage your notifications"
                                    onPress={() => router.push("/pages/notifications" as any)}
                                    badge="2"
                                />
                            </View>
                        </Animated.View>
                    </>
                )}

                {/* Support & Settings - Always visible */}
                <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Support & Settings</Text>
                    <View style={styles.menuCard}>
                        {/* <MenuItem
                            icon={<Settings size={22} color="#6B7280" />}
                            title="Settings"
                            subtitle="App preferences"
                            onPress={handleSettings}
                        /> */}
                        <View style={styles.menuSeparator} />
                        <MenuItem
                            icon={<Shield size={22} color="#059669" />}
                            title="Privacy & Security"
                            subtitle="Manage your privacy"
                            onPress={() => router.push("/pages/privacy-and-security" as any)}
                        />
                        <View style={styles.menuSeparator} />
                        <MenuItem
                            icon={<HelpCircle size={22} color="#3B82F6" />}
                            title="Help & Support"
                            subtitle="Get help and contact us"
                            onPress={() => router.push("/pages/help-and-support" as any)}
                        />
                    </View>
                </Animated.View>

                {/* Logout Section - Only show if authenticated */}
                {isAuthenticated && (
                    <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.logoutSection}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                            <LogOut size={22} color="#EF4444" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Logout Alert */}
            <CustomAlert
                visible={showLogoutAlert}
                type="warning"
                title="Logout"
                message="Are you sure you want to logout? You'll need to sign in again to access your account."
                primaryButton={{
                    text: "Logout",
                    onPress: confirmLogout,
                    style: "destructive",
                }}
                secondaryButton={{
                    text: "Cancel",
                    onPress: cancelLogout,
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 0,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
    },
    profileSection: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    profileCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#EEF2FF",
        elevation: 1,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#F3F4F6",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: "#6B7280",
    },
    editProfileButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#EEF2FF",
        borderRadius: 8,
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6366F1",
    },
    // Login Card Styles
    loginCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        elevation: 1,
    },
    loginIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    loginTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },
    loginSubtitle: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    loginButtons: {
        width: "100%",
        gap: 12,
    },
    loginButton: {
        backgroundColor: "#6366F1",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    signupButton: {
        backgroundColor: "#F9FAFB",
        paddingVertical: 14,
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
    scrollContainer: {
        flex: 1,
    },
    menuSection: {
        paddingHorizontal: 15,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 12,
    },
    menuCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    menuItemText: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    menuItemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    badge: {
        backgroundColor: "#EF4444",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    menuSeparator: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginLeft: 68,
    },
    logoutSection: {
        paddingHorizontal: 15,
        marginTop: 24,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FEE2E2",
        elevation: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
    },
    bottomSpacing: {
        height: 100,
    },
})

