"use client"

import { useAuth } from "@/hooks/useAuth"
import api from "@/lib/api"
import { getUserId } from "@/lib/catalog"
import type { Address } from "@/types/user"
import { router } from "expo-router"
import { ArrowLeft, Check, Edit3, Home, Mail, MapPin, Phone, Plus, Star, Trash2, X } from "lucide-react-native"
import type { ComponentProps } from "react"
import { useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type AddressForm = Pick<Address, "address" | "city" | "state" | "country" | "postalCode" | "default" | "phoneNumber" | "email">

const emptyAddress: AddressForm = {
    address: "",
    city: "",
    state: "",
    country: "Ghana",
    postalCode: "",
    default: false,
    phoneNumber: "",
    email: "",
}

const toFormAddress = (address?: Address | null): AddressForm => ({
    address: address?.address || "",
    city: address?.city || "",
    state: address?.state || "",
    country: address?.country || "Ghana",
    postalCode: address?.postalCode || "",
    default: Boolean(address?.default),
    phoneNumber: address?.phoneNumber || "",
    email: address?.email || "",
})

const buildPayload = (form: AddressForm, userId?: string) => ({
    address: form.address.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    postalCode: form.postalCode.trim(),
    default: Boolean(form.default),
    phoneNumber: form.phoneNumber?.trim() || "",
    email: form.email?.trim() || "",
    ...(userId ? { user: userId } : {}),
})

const getAddressLine = (address: Address) =>
    [address.address, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ")

export default function AddressManagementScreen() {
    const { user, isAuthenticated } = useAuth()
    const insets = useSafeAreaInsets()
    const { height: windowHeight } = useWindowDimensions()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [form, setForm] = useState<AddressForm>(emptyAddress)
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
    const [showFormModal, setShowFormModal] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [defaultingId, setDefaultingId] = useState<string | null>(null)
    const [keyboardHeight, setKeyboardHeight] = useState(0)

    const isEditing = Boolean(selectedAddress?._id)
    const sheetMaxHeight = Math.max(280, windowHeight - keyboardHeight - insets.top - 12)
    const canSave = useMemo(
        () => Boolean(form.address.trim() && form.city.trim() && form.state.trim() && form.country.trim() && form.postalCode.trim()),
        [form],
    )

    const fetchAddresses = async (refresh = false) => {
        if (!isAuthenticated) {
            setIsFetching(false)
            return
        }

        try {
            refresh ? setIsRefreshing(true) : setIsFetching(true)
            const response = await api.get<Address[]>("/address/get-all")
            setAddresses(response.data || [])
        } catch (error: any) {
            Alert.alert("Addresses", error.response?.data?.message || "Unable to load your delivery addresses.")
        } finally {
            setIsFetching(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [isAuthenticated])

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
            setKeyboardHeight(event.endCoordinates.height)
        })
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardHeight(0)
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    const openAddModal = () => {
        setSelectedAddress(null)
        setForm(emptyAddress)
        setShowFormModal(true)
    }

    const openEditModal = (address: Address) => {
        setSelectedAddress(address)
        setForm(toFormAddress(address))
        setShowFormModal(true)
    }

    const closeFormModal = () => {
        if (isSaving) return
        setShowFormModal(false)
        setSelectedAddress(null)
        setForm(emptyAddress)
    }

    const handleSaveAddress = async () => {
        if (!canSave) {
            Alert.alert("Address Required", "Please fill in the address, city, region, country, and postal code.")
            return
        }

        try {
            setIsSaving(true)
            const payload = buildPayload(form, getUserId(user))
            if (isEditing && selectedAddress?._id) {
                await api.put<Address>(`/address/update/${selectedAddress._id}`, payload)
            } else {
                await api.post<Address>("/address/create", payload)
            }
            await fetchAddresses()
            closeFormModal()
        } catch (error: any) {
            Alert.alert("Address Not Saved", error.response?.data?.message || "Please check your details and try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSetDefault = async (address: Address) => {
        if (!address._id || address.default) return

        try {
            setDefaultingId(address._id)
            await api.put(`/address/update/${address._id}`, { default: true })
            setAddresses((current) => current.map((item) => ({ ...item, default: item._id === address._id })))
        } catch (error: any) {
            Alert.alert("Default Address", error.response?.data?.message || "Unable to set this address as default.")
        } finally {
            setDefaultingId(null)
        }
    }

    const handleDeleteAddress = (address: Address) => {
        Alert.alert("Delete Address", "Remove this delivery address from your account?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    if (!address._id) return
                    try {
                        setDeletingId(address._id)
                        await api.delete(`/address/delete/${address._id}`)
                        setAddresses((current) => current.filter((item) => item._id !== address._id))
                    } catch (error: any) {
                        Alert.alert("Delete Failed", error.response?.data?.message || "Unable to delete this address.")
                    } finally {
                        setDeletingId(null)
                    }
                },
            },
        ])
    }

    const renderHeader = () => (
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={23} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerTextBlock}>
                <Text style={styles.headerTitle}>Delivery Addresses</Text>
                <Text style={styles.headerSubtitle}>{addresses.length} saved</Text>
            </View>
            <TouchableOpacity style={styles.primaryIconButton} onPress={openAddModal} activeOpacity={0.85}>
                <Plus size={21} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    )

    const renderAddressItem = ({ item, index }: { item: Address; index: number }) => {
        const isDefaulting = defaultingId === item._id
        const isDeleting = deletingId === item._id

        return (
            <Animated.View entering={FadeInUp.delay(index * 60).springify()} style={styles.addressCard}>
                <View style={styles.cardTopRow}>
                    <View style={[styles.cardIcon, item.default && styles.cardIconDefault]}>
                        <Home size={20} color={item.default ? "#047857" : "#4F46E5"} />
                    </View>
                    <View style={styles.cardTitleBlock}>
                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.city || "Delivery address"}</Text>
                            {item.default && (
                                <View style={styles.defaultBadge}>
                                    <Star size={11} color="#047857" fill="#047857" />
                                    <Text style={styles.defaultBadgeText}>Default</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.cardAddress} numberOfLines={2}>{getAddressLine(item)}</Text>
                    </View>
                </View>

                <View style={styles.contactRow}>
                    {item.phoneNumber ? (
                        <View style={styles.contactPill}>
                            <Phone size={13} color="#6B7280" />
                            <Text style={styles.contactText}>{item.phoneNumber}</Text>
                        </View>
                    ) : null}
                    {item.email ? (
                        <View style={styles.contactPill}>
                            <Mail size={13} color="#6B7280" />
                            <Text style={styles.contactText} numberOfLines={1}>{item.email}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => openEditModal(item)} activeOpacity={0.8}>
                        <Edit3 size={15} color="#374151" />
                        <Text style={styles.secondaryButtonText}>Edit</Text>
                    </TouchableOpacity>
                    {!item.default && (
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleSetDefault(item)} activeOpacity={0.8} disabled={isDefaulting}>
                            {isDefaulting ? <ActivityIndicator size="small" color="#374151" /> : <Check size={15} color="#374151" />}
                            <Text style={styles.secondaryButtonText}>Default</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.secondaryButton, styles.deleteButton]} onPress={() => handleDeleteAddress(item)} activeOpacity={0.8} disabled={isDeleting}>
                        {isDeleting ? <ActivityIndicator size="small" color="#DC2626" /> : <Trash2 size={15} color="#DC2626" />}
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    }

    const renderFormModal = () => (
        <Modal transparent visible={showFormModal} animationType="slide" statusBarTranslucent onRequestClose={closeFormModal}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <TouchableOpacity style={styles.modalBackdrop} onPress={closeFormModal} activeOpacity={1} />
                <View style={[styles.formSheet, { maxHeight: sheetMaxHeight, paddingBottom: insets.bottom }]}>
                    <View style={styles.formHeader}>
                        <View>
                            <Text style={styles.formTitle}>{isEditing ? "Edit Address" : "Add Address"}</Text>
                            <Text style={styles.formSubtitle}>Used for delivery and checkout.</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={closeFormModal}>
                            <X size={22} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.formContent}
                        contentContainerStyle={styles.formContentInner}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                    >
                        <FormInput label="Address" value={form.address} placeholder="House number, street name" onChangeText={(address) => setForm((current) => ({ ...current, address }))} multiline />
                        <View style={styles.twoColumn}>
                            <FormInput label="City" value={form.city} placeholder="Accra" onChangeText={(city) => setForm((current) => ({ ...current, city }))} />
                            <FormInput label="Region" value={form.state} placeholder="Greater Accra" onChangeText={(state) => setForm((current) => ({ ...current, state }))} />
                        </View>
                        <View style={styles.twoColumn}>
                            <FormInput label="Postal Code" value={form.postalCode} placeholder="00233" onChangeText={(postalCode) => setForm((current) => ({ ...current, postalCode }))} />
                            <FormInput label="Country" value={form.country} placeholder="Ghana" onChangeText={(country) => setForm((current) => ({ ...current, country }))} />
                        </View>
                        <FormInput label="Phone Number" optional value={form.phoneNumber || ""} placeholder="024 000 0000" keyboardType="phone-pad" onChangeText={(phoneNumber) => setForm((current) => ({ ...current, phoneNumber }))} />
                        <FormInput label="Email" optional value={form.email || ""} placeholder="name@example.com" keyboardType="email-address" autoCapitalize="none" onChangeText={(email) => setForm((current) => ({ ...current, email }))} />

                        <TouchableOpacity style={styles.defaultToggle} onPress={() => setForm((current) => ({ ...current, default: !current.default }))} activeOpacity={0.8}>
                            <View style={[styles.checkbox, form.default && styles.checkboxChecked]}>
                                {form.default && <Check size={15} color="#fff" />}
                            </View>
                            <View style={styles.defaultToggleText}>
                                <Text style={styles.defaultToggleTitle}>Make this my default address</Text>
                                <Text style={styles.defaultToggleSubtitle}>Checkout will select this address first.</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.formFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={closeFormModal} activeOpacity={0.8}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.saveButton, (!canSave || isSaving) && styles.saveButtonDisabled]} onPress={handleSaveAddress} disabled={!canSave || isSaving} activeOpacity={0.85}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{isEditing ? "Update" : "Save"}</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    )

    const renderEmptyState = () => (
        <Animated.View entering={FadeInUp.delay(120).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MapPin size={46} color="#4F46E5" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No delivery address yet</Text>
            <Text style={styles.emptyText}>Save an address now so checkout feels quick next time.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal} activeOpacity={0.85}>
                <Plus size={18} color="#fff" />
                <Text style={styles.emptyButtonText}>Add Address</Text>
            </TouchableOpacity>
        </Animated.View>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <MapPin size={46} color="#4F46E5" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.emptyTitle}>Sign in to manage addresses</Text>
                    <Text style={styles.emptyText}>Your saved delivery addresses are connected to your account.</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/auth/login" as any)} activeOpacity={0.85}>
                        <Text style={styles.emptyButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}
            {isFetching ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddressItem}
                    keyExtractor={(item, index) => item._id || `address-${index}`}
                    contentContainerStyle={addresses.length ? styles.addressList : styles.emptyList}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.addressSeparator} />}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchAddresses(true)} tintColor="#4F46E5" />}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
            {renderFormModal()}
        </SafeAreaView>
    )
}

function FormInput({
    label,
    optional,
    ...props
}: {
    label: string
    optional?: boolean
} & Omit<ComponentProps<typeof TextInput>, "style">) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {optional ? <Text style={styles.optionalLabel}>Optional</Text> : <Text style={styles.requiredLabel}>*</Text>}
            </Text>
            <TextInput
                {...props}
                style={[styles.textInput, props.multiline && styles.textArea]}
                placeholderTextColor="#9CA3AF"
                textAlignVertical={props.multiline ? "top" : "center"}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F7F8FB" },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEF0F4" },
    iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#F3F4F6" },
    primaryIconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#4F46E5" },
    headerTextBlock: { flex: 1, marginLeft: 12 },
    headerTitle: { fontSize: 19, fontWeight: "700", color: "#111827" },
    headerSubtitle: { marginTop: 2, fontSize: 12, color: "#6B7280" },
    addressList: { padding: 16, paddingBottom: 120 },
    emptyList: { flexGrow: 1 },
    addressSeparator: { height: 12 },
    addressCard: { backgroundColor: "#fff", borderRadius: 8, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
    cardTopRow: { flexDirection: "row", alignItems: "flex-start" },
    cardIcon: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#EEF2FF" },
    cardIconDefault: { backgroundColor: "#ECFDF5" },
    cardTitleBlock: { flex: 1, marginLeft: 12 },
    cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#111827" },
    defaultBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
    defaultBadgeText: { fontSize: 11, fontWeight: "700", color: "#047857" },
    cardAddress: { marginTop: 5, fontSize: 14, lineHeight: 20, color: "#4B5563" },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
    contactPill: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: "100%", backgroundColor: "#F3F4F6", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
    contactText: { fontSize: 12, color: "#4B5563" },
    cardActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
    secondaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB" },
    secondaryButtonText: { fontSize: 13, fontWeight: "700", color: "#374151" },
    deleteButton: { backgroundColor: "#FEF2F2", borderColor: "#FEE2E2" },
    deleteButtonText: { fontSize: 13, fontWeight: "700", color: "#DC2626" },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
    loadingText: { fontSize: 14, color: "#6B7280" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
    emptyIconContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", marginBottom: 20 },
    emptyTitle: { fontSize: 21, fontWeight: "800", color: "#111827", textAlign: "center" },
    emptyText: { marginTop: 8, marginBottom: 22, fontSize: 14, lineHeight: 21, color: "#6B7280", textAlign: "center" },
    emptyButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#4F46E5", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 13 },
    emptyButtonText: { fontSize: 15, fontWeight: "800", color: "#fff" },
    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.45)" },
    modalBackdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
    formSheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" },
    formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#EEF0F4" },
    formTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
    formSubtitle: { marginTop: 3, fontSize: 13, color: "#6B7280" },
    closeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
    formContent: { flexShrink: 1 },
    formContentInner: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
    twoColumn: { flexDirection: "row", gap: 12 },
    inputGroup: { flex: 1, marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 7 },
    optionalLabel: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
    requiredLabel: { color: "#DC2626" },
    textInput: { minHeight: 48, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", backgroundColor: "#fff" },
    textArea: { minHeight: 82 },
    defaultToggle: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2, marginBottom: 24, padding: 13, borderRadius: 8, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB" },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C7CBD1", alignItems: "center", justifyContent: "center" },
    checkboxChecked: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    defaultToggleText: { flex: 1 },
    defaultToggleTitle: { fontSize: 14, fontWeight: "800", color: "#111827" },
    defaultToggleSubtitle: { marginTop: 2, fontSize: 12, color: "#6B7280" },
    formFooter: { flexDirection: "row", gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: "#EEF0F4" },
    cancelButton: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 8, backgroundColor: "#F3F4F6" },
    cancelButtonText: { fontSize: 15, fontWeight: "800", color: "#374151" },
    saveButton: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 8, backgroundColor: "#4F46E5" },
    saveButtonDisabled: { backgroundColor: "#A5B4FC" },
    saveButtonText: { fontSize: 15, fontWeight: "800", color: "#fff" },
})
