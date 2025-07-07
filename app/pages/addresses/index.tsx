"use client"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import { ArrowLeft, Check, Edit3, MapPin, Plus, Star, Trash2, User, X } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
    Animated,
    Dimensions,
    FlatList,
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
import ReAnimated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Mock addresses data matching the schema
const MOCK_ADDRESSES = [
    {
        _id: "addr1",
        address: "123 Main Street, Apt 4B",
        city: "New York",
        state: "NY",
        country: "United States",
        postalCode: "10001",
        default: true,
        phoneNumber: "(406) 555-0120",
        email: "lesliealexander@acme.com",
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: "2024-01-15T10:30:00Z",
    },
    {
        _id: "addr2",
        address: "456 Business Ave, Suite 200",
        city: "New York",
        state: "NY",
        country: "United States",
        postalCode: "10002",
        default: false,
        phoneNumber: "(406) 555-0120",
        email: "lesliealexander@acme.com",
        latitude: 40.7589,
        longitude: -73.9851,
        createdAt: "2024-01-10T14:20:00Z",
    },
    {
        _id: "addr3",
        address: "789 Family Lane",
        city: "Brooklyn",
        state: "NY",
        country: "United States",
        postalCode: "11201",
        default: false,
        phoneNumber: "(555) 123-4567",
        email: "john.alexander@email.com",
        latitude: 40.6892,
        longitude: -73.9442,
        createdAt: "2024-01-05T09:15:00Z",
    },
]

interface Address {
    _id?: string
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    default: boolean
    phoneNumber?: string
    email?: string
    latitude?: number
    longitude?: number
}

export default function AddressManagementScreen() {
    const { isAuthenticated } = useAuth()
    const [addresses, setAddresses] = useState(MOCK_ADDRESSES)
    const [showAddEditModal, setShowAddEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showOptionsModal, setShowOptionsModal] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<any>(null)
    const [editingAddress, setEditingAddress] = useState<Address>({
        address: "",
        city: "",
        state: "",
        country: "United States",
        postalCode: "",
        default: false,
        phoneNumber: "",
        email: "",
    })
    const [isEditing, setIsEditing] = useState(false)
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT))

    useEffect(() => {
        if (showAddEditModal) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }
    }, [showAddEditModal])

    const handleAddAddress = () => {
        setEditingAddress({
            address: "",
            city: "",
            state: "",
            country: "United States",
            postalCode: "",
            default: false,
            phoneNumber: "",
            email: "",
        })
        setIsEditing(false)
        setShowAddEditModal(true)
    }

    const handleEditAddress = (address: any) => {
        setEditingAddress(address)
        setIsEditing(true)
        setShowAddEditModal(true)
        setShowOptionsModal(false)
    }

    const handleDeleteAddress = (address: any) => {
        setSelectedAddress(address)
        setShowDeleteModal(true)
        setShowOptionsModal(false)
    }

    const handleSetDefault = (addressId: string) => {
        setAddresses((prev) =>
            prev.map((addr) => ({
                ...addr,
                default: addr._id === addressId,
            })),
        )
        setShowOptionsModal(false)
    }

    const handleSaveAddress = () => {
        if (!editingAddress.address || !editingAddress.city || !editingAddress.state || !editingAddress.postalCode) {
            return
        }

        if (isEditing) {
            setAddresses((prev) => prev.map((addr) => (addr._id === editingAddress._id ? editingAddress : addr)) as any)
        } else {
            const newAddress = {
                ...editingAddress,
                _id: `addr${Date.now()}`,
                createdAt: new Date().toISOString(),
            }
            setAddresses((prev) => [newAddress, ...prev] as any)
        }

        setShowAddEditModal(false)
    }

    const confirmDeleteAddress = () => {
        if (selectedAddress) {
            setAddresses((prev) => prev.filter((addr) => addr._id !== selectedAddress._id))
            setShowDeleteModal(false)
            setSelectedAddress(null)
        }
    }

    const handleCloseModal = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowAddEditModal(false)
        })
    }

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Delivery Addresses</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAddress} activeOpacity={0.7}>
                <Plus size={24} color="#6366F1" />
            </TouchableOpacity>
        </ReAnimated.View>
    )

    const renderAddressItem = ({ item, index }: { item: any; index: number }) => {
        return (
            <ReAnimated.View entering={FadeInUp.delay(index * 100).springify()}>
                <TouchableOpacity
                    style={[styles.addressCard, item.default && styles.addressCardSelected]}
                    onPress={() => {
                        setSelectedAddress(item)
                        setShowOptionsModal(true)
                    }}
                    activeOpacity={0.7}
                >
                    <View style={styles.addressHeader}>
                        <View style={styles.addressInfo}>
                            <View style={styles.addressNameRow}>
                                <Text style={styles.addressName}>
                                    {item.city} {/* Using city as the address name */}
                                </Text>
                                {item.default && <Text style={styles.defaultBadge}>Default</Text>}
                            </View>
                            {item.phoneNumber && <Text style={styles.addressPhone}>{item.phoneNumber}</Text>}
                        </View>
                        <View style={styles.addressActions}>
                            {item.default && (
                                <View style={styles.selectedIndicator}>
                                    <Check size={16} color="#10B981" />
                                </View>
                            )}
                            <TouchableOpacity style={styles.editButton} onPress={() => handleEditAddress(item)} activeOpacity={0.7}>
                                <Edit3 size={16} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.addressText}>
                        {item.address}, {item.city}, {item.state} {item.postalCode}
                    </Text>
                </TouchableOpacity>
            </ReAnimated.View>
        )
    }

    const renderAddEditModal = () => {
        if (!showAddEditModal) return null

        return (
            <Modal
                transparent
                visible={showAddEditModal}
                animationType="none"
                statusBarTranslucent={true}
                presentationStyle="overFullScreen"
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={handleCloseModal} activeOpacity={1} />
                    <Animated.View
                        style={[
                            styles.addEditModal,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.headerButton}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{isEditing ? "Edit Address" : "Add New Address"}</Text>
                            <View style={styles.headerSpacer} />
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Street Address */}
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Street Address *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="123 Main Street, Apt 4B"
                                    value={editingAddress.address}
                                    onChangeText={(text) => setEditingAddress({ ...editingAddress, address: text })}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* City, State, ZIP */}
                            <View style={styles.rowInputs}>
                                <View style={[styles.inputSection, styles.halfWidth]}>
                                    <Text style={styles.inputLabel}>City *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="New York"
                                        value={editingAddress.city}
                                        onChangeText={(text) => setEditingAddress({ ...editingAddress, city: text })}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View style={[styles.inputSection, styles.quarterWidth]}>
                                    <Text style={styles.inputLabel}>State *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="NY"
                                        value={editingAddress.state}
                                        onChangeText={(text) => setEditingAddress({ ...editingAddress, state: text })}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View style={[styles.inputSection, styles.quarterWidth]}>
                                    <Text style={styles.inputLabel}>ZIP Code *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="10001"
                                        value={editingAddress.postalCode}
                                        onChangeText={(text) => setEditingAddress({ ...editingAddress, postalCode: text })}
                                        keyboardType="numeric"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>

                            {/* Country */}
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Country *</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="United States"
                                    value={editingAddress.country}
                                    onChangeText={(text) => setEditingAddress({ ...editingAddress, country: text })}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* Phone and Email */}
                            <View style={styles.rowInputs}>
                                <View style={[styles.inputSection, styles.halfWidth]}>
                                    <Text style={styles.inputLabel}>Phone Number</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="(555) 123-4567"
                                        value={editingAddress.phoneNumber}
                                        onChangeText={(text) => setEditingAddress({ ...editingAddress, phoneNumber: text })}
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View style={[styles.inputSection, styles.halfWidth]}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="email@example.com"
                                        value={editingAddress.email}
                                        onChangeText={(text) => setEditingAddress({ ...editingAddress, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>

                            {/* Set as Default */}
                            <TouchableOpacity
                                style={styles.defaultCheckbox}
                                onPress={() => setEditingAddress({ ...editingAddress, default: !editingAddress.default })}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, editingAddress.default && styles.checkboxSelected]}>
                                    {editingAddress.default && <Check size={16} color="#fff" />}
                                </View>
                                <Text style={styles.checkboxLabel}>Set as default address</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal} activeOpacity={0.8}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    (!editingAddress.address ||
                                        !editingAddress.city ||
                                        !editingAddress.state ||
                                        !editingAddress.postalCode) &&
                                    styles.saveButtonDisabled,
                                ]}
                                onPress={handleSaveAddress}
                                disabled={
                                    !editingAddress.address || !editingAddress.city || !editingAddress.state || !editingAddress.postalCode
                                }
                                activeOpacity={0.8}
                            >
                                <Text style={styles.saveButtonText}>{isEditing ? "Update" : "Save"} Address</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        )
    }

    const renderOptionsModal = () => (
        <Modal transparent visible={showOptionsModal} animationType="fade">
            <View style={styles.optionsOverlay}>
                <TouchableOpacity style={styles.optionsBackdrop} onPress={() => setShowOptionsModal(false)} activeOpacity={1} />
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.optionsModal}>
                    <Text style={styles.optionsTitle}>Address Options</Text>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => handleEditAddress(selectedAddress)}
                        activeOpacity={0.7}
                    >
                        <Edit3 size={20} color="#6366F1" />
                        <Text style={styles.optionText}>Edit Address</Text>
                    </TouchableOpacity>
                    {!selectedAddress?.default && (
                        <TouchableOpacity
                            style={styles.optionItem}
                            onPress={() => handleSetDefault(selectedAddress?._id)}
                            activeOpacity={0.7}
                        >
                            <Star size={20} color="#F59E0B" />
                            <Text style={styles.optionText}>Set as Default</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.optionItem, styles.deleteOption]}
                        onPress={() => handleDeleteAddress(selectedAddress)}
                        activeOpacity={0.7}
                    >
                        <Trash2 size={20} color="#EF4444" />
                        <Text style={[styles.optionText, styles.deleteOptionText]}>Delete Address</Text>
                    </TouchableOpacity>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const renderDeleteModal = () => (
        <Modal transparent visible={showDeleteModal} animationType="fade">
            <View style={styles.deleteOverlay}>
                <ReAnimated.View entering={FadeInUp.springify()} style={styles.deleteModal}>
                    <Text style={styles.deleteTitle}>Delete Address</Text>
                    <Text style={styles.deleteMessage}>
                        Are you sure you want to delete this address? This action cannot be undone.
                    </Text>
                    <View style={styles.deleteActions}>
                        <TouchableOpacity style={styles.deleteCancel} onPress={() => setShowDeleteModal(false)} activeOpacity={0.8}>
                            <Text style={styles.deleteCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteConfirm} onPress={confirmDeleteAddress} activeOpacity={0.8}>
                            <Text style={styles.deleteConfirmText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </ReAnimated.View>
            </View>
        </Modal>
    )

    const renderEmptyState = () => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MapPin size={50} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No addresses found</Text>
            <Text style={styles.emptyText}>Add your first delivery address to get started</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleAddAddress} activeOpacity={0.8}>
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Add Address</Text>
            </TouchableOpacity>
        </ReAnimated.View>
    )

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                        <User size={60} color="#6366F1" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Sign in to manage addresses</Text>
                    <Text style={styles.authText}>
                        Create an account or sign in to add and manage{"\n"}
                        your delivery addresses
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

            <View style={styles.container}>
                {addresses.length > 0 ? (
                    <FlatList
                        data={addresses}
                        renderItem={renderAddressItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.addressList}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.addressSeparator} />}
                    />
                ) : (
                    renderEmptyState()
                )}
            </View>

            {renderAddEditModal()}
            {renderOptionsModal()}
            {renderDeleteModal()}
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
    addButton: {
        padding: 4,
    },
    container: {
        flex: 1,
    },
    addressList: {
        padding: 16,
        paddingBottom: 100,
    },
    addressCard: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#FAFAFA",
    },
    addressCardSelected: {
        borderColor: "#10B981",
        backgroundColor: "#F0FDF4",
    },
    addressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    addressInfo: {
        flex: 1,
    },
    addressNameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 4,
    },
    addressName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    defaultBadge: {
        fontSize: 12,
        fontWeight: "500",
        color: "#10B981",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    addressPhone: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 8,
    },
    addressActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    selectedIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ECFDF5",
        justifyContent: "center",
        alignItems: "center",
    },
    editButton: {
        padding: 4,
    },
    addressText: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
    },
    addressSeparator: {
        height: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        zIndex: 9999,
    },
    modalBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
    },
    addEditModal: {
        height: SCREEN_HEIGHT * 0.85,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 10000,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerButton: {
        padding: 4,
        minWidth: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        textAlign: "center",
    },
    headerSpacer: {
        width: 32,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        backgroundColor: "#fff",
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#1F2937",
        backgroundColor: "#fff",
    },
    rowInputs: {
        flexDirection: "row",
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    quarterWidth: {
        flex: 0.5,
    },
    defaultCheckbox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: "#6366F1",
        borderColor: "#6366F1",
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#374151",
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: "#6366F1",
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonDisabled: {
        backgroundColor: "#E5E7EB",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    // Options Modal
    optionsOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    optionsBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    optionsModal: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 40,
        minWidth: 250,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 16,
        textAlign: "center",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    optionText: {
        fontSize: 16,
        color: "#374151",
    },
    deleteOption: {
        backgroundColor: "#FEF2F2",
    },
    deleteOptionText: {
        color: "#EF4444",
    },
    // Delete Modal
    deleteOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
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
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#6366F1",
        borderRadius: 12,
    },
    emptyButtonText: {
        fontSize: 16,
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

