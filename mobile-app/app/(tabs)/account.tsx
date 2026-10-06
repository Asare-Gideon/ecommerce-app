"use client";

import type React from "react";

import { CustomAlert } from "@/components/ui/custom-alert";
import { useAuth } from "@/hooks/useAuth";
import { useOrdersStore } from "@/store/orders";
import { router } from "expo-router";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Edit3,
  HelpCircle,
  LogOut,
  MapPin,
  Package,
  Shield,
  Star,
  User,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface ProfileRowProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  badge?: string | number;
  destructive?: boolean;
}

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const ProfileRow = ({
  icon,
  title,
  onPress,
  badge,
  destructive = false,
}: ProfileRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.72}>
    <View style={styles.rowLeft}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={[styles.rowTitle, destructive && styles.dangerText]}>
        {title}
      </Text>
    </View>

    <View style={styles.rowRight}>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      {!destructive ? (
        <ChevronRight size={22} color="#8A8A8E" strokeWidth={2.4} />
      ) : null}
    </View>
  </TouchableOpacity>
);

const ToggleRow = ({ icon, title, value, onValueChange }: ToggleRowProps) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowTitle}>{title}</Text>
    </View>

    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#E0E0E0", true: "#AFCBFA" }}
      thumbColor={value ? "#56A9F6" : "#111111"}
      ios_backgroundColor="#E0E0E0"
    />
  </View>
);

const ProfileSection = ({
  title,
  children,
  delay = 200,
}: ProfileSectionProps) => (
  <Animated.View
    entering={FadeInUp.delay(delay).springify()}
    style={styles.section}
  >
    <Text style={styles.sectionLabel}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </Animated.View>
);

const RowSeparator = () => <View style={styles.rowSeparator} />;

export default function AccountScreen() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { orders, fetchOrders } = useOrdersStore();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Profile user";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=96&background=111111&color=fff`;
  const activeOrderCount = useMemo(
    () =>
      orders.filter((order) =>
        ["pending", "processing", "completed"].includes(order.status),
      ).length,
    [orders],
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(user);
    }
  }, [fetchOrders, isAuthenticated, user, user?._id, user?.id]);

  const handleLogin = () => {
    router.push("/auth/login" as any);
  };

  const handleSignup = () => {
    router.push("/auth/signup" as any);
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Navigate to edit profile screen");
  };

  const handleNotifications = () => {
    router.push("/pages/notifications" as any);
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    logout();
    router.replace("/auth/login" as any);
  };

  const cancelLogout = () => {
    setShowLogoutAlert(false);
  };

  const renderProfileCard = () => {
    if (isLoading) {
      return (
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.profileCard}
        >
          <View style={styles.avatarPlaceholder} />
          <View style={styles.profileCopy}>
            <View style={styles.loadingLineLarge} />
            <View style={styles.loadingLineSmall} />
          </View>
        </Animated.View>
      );
    }

    if (!isAuthenticated) {
      return (
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.authCard}
        >
          <View style={styles.authIcon}>
            <User size={30} color="#111111" strokeWidth={2.2} />
          </View>
          <View style={styles.authCopy}>
            <Text style={styles.authTitle}>Sign in to your profile</Text>
            <Text style={styles.authSubtitle}>
              Manage orders, addresses, notifications, and support.
            </Text>
          </View>
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLogin}
              activeOpacity={0.82}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignup}
              activeOpacity={0.82}
            >
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={styles.profileCard}
      >
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.profileCopy}>
          <Text style={styles.profileName} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.profileMeta} numberOfLines={1}>
            {user?.email || user?.phone || "Your store profile"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
          activeOpacity={0.74}
        >
          <Edit3 size={18} color="#111111" strokeWidth={2.4} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleNotifications}
            activeOpacity={0.74}
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
          >
            <Bell size={30} color="#111111" strokeWidth={2.5} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {renderProfileCard()}

        <ProfileSection title="Settings" delay={180}>
          <ToggleRow
            icon={<Bell size={22} color="#111111" strokeWidth={2.25} />}
            title="Push notifications"
            value={pushNotificationsEnabled}
            onValueChange={setPushNotificationsEnabled}
          />
        </ProfileSection>

        {isAuthenticated ? (
          <>
            <ProfileSection title="Shopping" delay={260}>
              <ProfileRow
                icon={<Package size={22} color="#111111" strokeWidth={2.25} />}
                title="My orders"
                badge={activeOrderCount || undefined}
                onPress={() => router.push("/pages/orders" as any)}
              />
              <RowSeparator />
              <ProfileRow
                icon={<MapPin size={22} color="#111111" strokeWidth={2.25} />}
                title="Addresses"
                onPress={() => router.push("/pages/addresses" as any)}
              />
              <RowSeparator />
              <ProfileRow
                icon={<Star size={22} color="#111111" strokeWidth={2.25} />}
                title="Reviews & ratings"
                onPress={() => router.push("/pages/reviews" as any)}
              />
            </ProfileSection>

            <ProfileSection title="Support" delay={340}>
              <ProfileRow
                icon={
                  <HelpCircle size={22} color="#111111" strokeWidth={2.25} />
                }
                title="Help & support"
                onPress={() => router.push("/pages/help-and-support" as any)}
              />
              <RowSeparator />
              <ProfileRow
                icon={<BookOpen size={22} color="#111111" strokeWidth={2.25} />}
                title="Blog"
                onPress={() => router.push("/pages/blogs" as any)}
              />
              <RowSeparator />

              <ProfileRow
                icon={<Shield size={22} color="#111111" strokeWidth={2.25} />}
                title="Terms & privacy"
                onPress={() =>
                  router.push("/pages/privacy-and-security" as any)
                }
              />
            </ProfileSection>
          </>
        ) : (
          <ProfileSection title="Support" delay={260}>
            <ProfileRow
              icon={<BookOpen size={22} color="#111111" strokeWidth={2.25} />}
              title="Blog"
              onPress={() => router.push("/pages/blogs" as any)}
            />
            <RowSeparator />
            <ProfileRow
              icon={<HelpCircle size={22} color="#111111" strokeWidth={2.25} />}
              title="Help & support"
              onPress={() => router.push("/pages/help-and-support" as any)}
            />
            <RowSeparator />
            <ProfileRow
              icon={<Shield size={22} color="#111111" strokeWidth={2.25} />}
              title="Terms & privacy"
              onPress={() => router.push("/pages/privacy-and-security" as any)}
            />
          </ProfileSection>
        )}

        {isAuthenticated ? (
          <Animated.View
            entering={FadeInUp.delay(420).springify()}
            style={styles.logoutWrap}
          >
            <ProfileRow
              icon={<LogOut size={22} color="#EF4444" strokeWidth={2.25} />}
              title="Logout"
              destructive
              onPress={handleLogout}
            />
          </Animated.View>
        ) : null}
      </ScrollView>

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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 118,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerTitle: {
    color: "#111111",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    letterSpacing: 0,
  },
  notificationButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 13,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 28,
    padding: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F2F2F3",
  },
  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EFEFF1",
  },
  profileCopy: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  profileName: {
    color: "#111111",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  profileMeta: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 2,
  },
  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F6",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingLineLarge: {
    width: "66%",
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EFEFF1",
    marginBottom: 10,
  },
  loadingLineSmall: {
    width: "44%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F3F3F4",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 28,
    padding: 18,
    marginBottom: 10,
  },
  authIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F6",
    marginBottom: 14,
  },
  authCopy: {
    marginBottom: 16,
  },
  authTitle: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginBottom: 5,
  },
  authSubtitle: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  authButtons: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F6",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "800",
  },
  section: {
    marginTop: 28,
  },
  sectionLabel: {
    color: "#666",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    lineHeight: 17,
    marginBottom: 13,
    textTransform: "uppercase",
  },
  sectionCard: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 28,
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  rowTitle: {
    flex: 1,
    color: "#191919",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 12,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EEEEEE",
    marginLeft: 92,
  },
  badge: {
    minWidth: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  logoutWrap: {
    overflow: "hidden",
    marginTop: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#F4D7D7",
    backgroundColor: "#FFFFFF",
  },
  dangerText: {
    color: "#EF4444",
  },
});
