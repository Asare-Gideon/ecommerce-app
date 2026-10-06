"use client"

import { router } from "expo-router"
import {
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    Facebook,
    HelpCircle,
    Instagram,
    Mail,
    MessageCircle,
    Phone,
} from "lucide-react-native"
import { useState } from "react"
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const ADMIN_CONTACTS = [
    {
        id: "whatsapp",
        title: "WhatsApp",
        subtitle: "+233 00 000 0000",
        icon: MessageCircle,
        color: "#16A34A",
        url: "https://wa.me/233000000000",
    },
    {
        id: "instagram",
        title: "Instagram",
        subtitle: "@store_admin",
        icon: Instagram,
        color: "#DB2777",
        url: "https://instagram.com/store_admin",
    },
    {
        id: "facebook",
        title: "Facebook",
        subtitle: "Store Admin",
        icon: Facebook,
        color: "#2563EB",
        url: "https://facebook.com/storeadmin",
    },
    {
        id: "email",
        title: "Email",
        subtitle: "support@yourstore.com",
        icon: Mail,
        color: "#7C3AED",
        url: "mailto:support@yourstore.com",
    },
    {
        id: "phone",
        title: "Call",
        subtitle: "+233 00 000 0000",
        icon: Phone,
        color: "#F97316",
        url: "tel:+233000000000",
    },
]

const FAQ_DATA = [
    {
        question: "How do I find products?",
        answer:
            "Use the Home tab for featured products or the Explore page to search, filter by category, and browse more items.",
    },
    {
        question: "How do I add an item to my cart?",
        answer:
            "Open a product, choose a size or colour if required, set the quantity, then tap Add to Cart at the bottom.",
    },
    {
        question: "Where can I see my orders?",
        answer:
            "Go to Account, then My orders. You can open an order to view the items, payment details, and current status.",
    },
    {
        question: "How do I change my delivery address?",
        answer:
            "Open Account, tap Addresses, then add a new address or edit an existing one before checking out.",
    },
    {
        question: "How do I get help with a payment or delivery?",
        answer:
            "Contact the admin through WhatsApp, Instagram, Facebook, email, or phone from this screen and include your order number.",
    },
]

export default function HelpSupportScreen() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

    const openContact = async (url: string) => {
        const supported = await Linking.canOpenURL(url)
        if (supported) {
            await Linking.openURL(url)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.72}>
                    <ArrowLeft size={24} color="#111111" strokeWidth={2.4} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.delay(80).springify()} style={styles.introCard}>
                    <View style={styles.introIcon}>
                        <HelpCircle size={28} color="#111111" strokeWidth={2.1} />
                    </View>
                    <Text style={styles.introTitle}>Need help?</Text>
                    <Text style={styles.introText}>
                        Reach the admin directly, or check the quick answers below for common app questions.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(160).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>Admin Socials</Text>
                    <View style={styles.card}>
                        {ADMIN_CONTACTS.map((contact, index) => {
                            const Icon = contact.icon
                            return (
                                <TouchableOpacity
                                    key={contact.id}
                                    style={[styles.contactRow, index !== ADMIN_CONTACTS.length - 1 && styles.rowBorder]}
                                    onPress={() => openContact(contact.url)}
                                    activeOpacity={0.72}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: `${contact.color}14` }]}>
                                        <Icon size={21} color={contact.color} strokeWidth={2.2} />
                                    </View>
                                    <View style={styles.contactCopy}>
                                        <Text style={styles.contactTitle}>{contact.title}</Text>
                                        <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
                                    </View>
                                    <ChevronRight size={21} color="#8A8A8E" strokeWidth={2.2} />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(240).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>FAQ</Text>
                    <View style={styles.card}>
                        {FAQ_DATA.map((item, index) => {
                            const isOpen = openFaqIndex === index
                            return (
                                <TouchableOpacity
                                    key={item.question}
                                    style={[styles.faqItem, index !== FAQ_DATA.length - 1 && styles.rowBorder]}
                                    onPress={() => setOpenFaqIndex(isOpen ? null : index)}
                                    activeOpacity={0.76}
                                >
                                    <View style={styles.faqHeader}>
                                        <Text style={styles.faqQuestion}>{item.question}</Text>
                                        <ChevronDown
                                            size={20}
                                            color="#8A8A8E"
                                            strokeWidth={2.2}
                                            style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                                        />
                                    </View>
                                    {isOpen ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </Animated.View>
            </ScrollView>
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
    introCard: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#FFFFFF",
    },
    introIcon: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F6",
        marginBottom: 14,
    },
    introTitle: {
        color: "#111111",
        fontSize: 21,
        fontWeight: "800",
        lineHeight: 27,
        marginBottom: 6,
    },
    introText: {
        color: "#666666",
        fontSize: 15,
        fontWeight: "500",
        lineHeight: 22,
    },
    section: {
        marginTop: 26,
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
    contactRow: {
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: "#F1F1F2",
    },
    contactIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 13,
    },
    contactCopy: {
        flex: 1,
        minWidth: 0,
    },
    contactTitle: {
        color: "#111111",
        fontSize: 16,
        fontWeight: "700",
        lineHeight: 21,
    },
    contactSubtitle: {
        color: "#666666",
        fontSize: 13,
        fontWeight: "500",
        lineHeight: 18,
        marginTop: 2,
    },
    faqItem: {
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    faqQuestion: {
        flex: 1,
        color: "#111111",
        fontSize: 15,
        fontWeight: "700",
        lineHeight: 21,
    },
    faqAnswer: {
        color: "#666666",
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 21,
        marginTop: 9,
        paddingRight: 28,
    },
})
