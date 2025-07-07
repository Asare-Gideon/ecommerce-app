"use client"
import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import {
    ArrowLeft,
    Book,
    ChevronRight,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Star,
    User,
    X,
} from "lucide-react-native"
import { useEffect, useState } from "react"
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import ReAnimated, { FadeInDown, FadeInUp } from "react-native-reanimated"

const { width } = Dimensions.get("window")
const { height: SCREEN_HEIGHT } = Dimensions.get("window")

// Mock FAQ data
const FAQ_DATA = [
    {
        id: "1",
        question: "How do I track my order?",
        answer:
            "You can track your order by going to 'My Orders' in your profile and clicking on the order you want to track. You'll see real-time updates on your order status.",
        category: "orders",
    },
    {
        id: "2",
        question: "What is your return policy?",
        answer:
            "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. Some restrictions apply for certain categories.",
        category: "returns",
    },
    {
        id: "3",
        question: "How do I change my delivery address?",
        answer:
            "You can update your delivery address in the 'Addresses' section of your profile. Make sure to set your preferred address as default.",
        category: "account",
    },
    {
        id: "4",
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, mobile money, and cash on delivery for eligible orders.",
        category: "payment",
    },
    {
        id: "5",
        question: "How do I cancel my order?",
        answer:
            "You can cancel your order within 1 hour of placing it by going to 'My Orders' and selecting 'Cancel Order'. After this time, please contact support.",
        category: "orders",
    },
]

const CONTACT_OPTIONS = [
    {
        id: "chat",
        title: "Live Chat",
        subtitle: "Chat with our support team",
        icon: MessageCircle,
        color: "#10B981",
        available: true,
    },
    {
        id: "email",
        title: "Email Support",
        subtitle: "support@yourstore.com",
        icon: Mail,
        color: "#6366F1",
        available: true,
    },
    {
        id: "phone",
        title: "Phone Support",
        subtitle: "+1 (555) 123-4567",
        icon: Phone,
        color: "#F59E0B",
        available: false,
    },
]

// Quick action content data with actual detailed content
const QUICK_ACTION_CONTENT = {
    orders: {
        title: "Order Status & Tracking",
        icon: FileText,
        color: "#6366F1",
        content: `**How to Track Your Order**

Once your order is confirmed, you'll receive a confirmation email with your order number. Here's how to track your order:

**Step 1: Find Your Order**
• Go to "My Orders" in your profile
• Locate the order you want to track
• Click on the order to view details

**Step 2: Track Progress**
Your order goes through these stages:
• **Order Confirmed** - We've received your order
• **Processing** - We're preparing your items
• **Shipped** - Your order is on its way
• **Out for Delivery** - Your order will arrive today
• **Delivered** - Your order has been delivered

**Order Issues**
If you experience any issues with your order:
• **Missing Items**: Contact support within 48 hours
• **Damaged Items**: Take photos and report immediately
• **Wrong Items**: We'll arrange a free exchange
• **Delivery Issues**: Check with neighbors or building management

**Cancellation Policy**
• Orders can be cancelled within 1 hour of placement
• After 1 hour, contact customer support
• Refunds are processed within 3-5 business days

**Order History**
Access all your previous orders and:
• Download invoices and receipts
• Reorder favorite items quickly
• View detailed order information
• Track return and refund status

**Delivery Updates**
Stay informed with:
• SMS notifications for order updates
• Email confirmations at each stage
• Push notifications in the app
• Real-time tracking information

Need more help? Contact our support team for personalized assistance with your specific order.`,
    },
    returns: {
        title: "Returns & Refunds Policy",
        icon: Star,
        color: "#10B981",
        content: `**Our Return Policy**

We want you to be completely satisfied with your purchase. If you're not happy with your order, we're here to help.

**Return Window**
• **30 days** from delivery date for most items
• **14 days** for electronics and gadgets
• **7 days** for perishable items
• **No returns** on personalized or custom items

**Return Conditions**
Items must be:
• In original condition with tags attached
• Unused and unworn
• In original packaging when possible
• Accompanied by proof of purchase

**How to Start a Return**

**Step 1: Initiate Return**
• Go to "My Orders" in your profile
• Find the order with items to return
• Click "Return Items" and select products
• Choose reason for return

**Step 2: Package Items**
• Use original packaging if available
• Include all accessories and documentation
• Print the return label we provide
• Secure package properly

**Step 3: Ship Back**
• Drop off at any authorized location
• Schedule a pickup if available
• Track your return package
• Keep receipt until refund is processed

**Refund Process**
• **Inspection**: 1-2 business days after we receive items
• **Approval**: Email notification of refund approval
• **Processing**: 3-5 business days to original payment method
• **Credit Card**: May take additional 1-2 billing cycles

**Exchange Policy**
• Free exchanges for size or color
• Subject to availability
• Same return conditions apply
• Expedited shipping for exchanges

**Return Shipping**
• **Free returns** for defective or wrong items
• **Customer pays** return shipping for other reasons
• **Prepaid labels** available for purchase
• **Store credit** option to avoid shipping costs

**Special Categories**

**Electronics**
• Must include all original accessories
• Factory reset required for devices
• Original packaging strongly preferred
• Shorter 14-day return window

**Clothing & Accessories**
• Must have tags attached
• No signs of wear or washing
• Original packaging preferred
• Hygiene items are final sale

**Home & Garden**
• Large items may require special pickup
• Assembly items should be disassembled
• Original packaging required for fragile items

**Damaged or Defective Items**
If you receive damaged or defective items:
• Contact us immediately
• Take photos of damage
• Keep all packaging materials
• We'll provide prepaid return label
• Full refund or replacement guaranteed

**Questions?**
Contact our returns team at returns@yourstore.com or through live chat for specific questions about your return.`,
    },
    account: {
        title: "Account Management",
        icon: User,
        color: "#F59E0B",
        content: `**Managing Your Account**

Your account is your gateway to a personalized shopping experience. Here's everything you need to know about managing your account.

**Profile Information**

**Personal Details**
• Update your name and contact information
• Add or change your profile photo
• Set your communication preferences
• Manage your birthday and anniversary dates

**Contact Information**
• Primary email address for notifications
• Phone number for order updates
• Backup email for account recovery
• Communication preferences

**Account Security**

**Password Management**
• Use a strong, unique password
• Change password regularly
• Enable two-factor authentication
• Never share your login credentials

**Two-Factor Authentication (2FA)**
• Add extra security to your account
• Use SMS or authenticator app
• Required for sensitive actions
• Can be enabled in security settings

**Login Activity**
• Monitor recent login attempts
• View active sessions
• Log out from all devices remotely
• Receive alerts for suspicious activity

**Address Book**
Manage your delivery addresses:
• Add multiple addresses
• Set a default delivery address
• Edit existing addresses
• Delete old or unused addresses

**Payment Methods**
Securely store payment information:
• Add credit/debit cards
• Set default payment method
• Update expiration dates
• Remove old payment methods
• All payment info is encrypted

**Order Preferences**

**Delivery Preferences**
• Choose preferred delivery times
• Set special delivery instructions
• Select notification preferences
• Choose packaging options

**Shopping Preferences**
• Save favorite categories
• Set size and fit preferences
• Choose brand preferences
• Manage wish lists and favorites

**Privacy Settings**

**Data Collection**
• Control what data we collect
• Manage marketing communications
• Set cookie preferences
• Download your data

**Communication Preferences**
• Email notifications settings
• SMS/text message preferences
• Push notification controls
• Marketing email subscriptions

**Account Issues**

**Login Problems**
If you can't access your account:
• Use "Forgot Password" feature
• Check your email for reset instructions
• Clear browser cache and cookies
• Try a different browser or device

**Email Not Received**
• Check spam/junk folder
• Add our domain to safe senders
• Verify email address is correct
• Contact support if still not received

**Account Recovery**
• Use registered email for recovery
• Answer security questions
• Provide order history for verification
• Contact support with ID verification

**Closing Your Account**
If you need to close your account:
• Download your order history first
• Cancel any active subscriptions
• Use remaining store credits
• Contact support to process closure
• Account data will be deleted per privacy policy

**Account Benefits**
• Faster checkout process
• Order history and tracking
• Personalized recommendations
• Exclusive member offers
• Priority customer support
• Wish list and favorites
• Review and rating history

**Need Help?**
For account-specific issues, contact our support team with your account email address for faster assistance.`,
    },
    guides: {
        title: "Shopping Guides & Tips",
        icon: Book,
        color: "#8B5CF6",
        content: `**Complete Shopping Guide**

Welcome to our comprehensive shopping guide! Whether you're new to our platform or looking to enhance your shopping experience, this guide has everything you need.

**Getting Started**

**Creating Your Account**
• Sign up with email or social media
• Verify your email address
• Complete your profile information
• Add your first delivery address
• Set up a payment method

**First Order Tips**
• Start with a small order to test our service
• Check delivery areas and times
• Read product reviews and ratings
• Compare similar products
• Use filters to narrow down choices

**Navigating the App**

**Home Screen**
• Featured products and deals
• Personalized recommendations
• Category shortcuts
• Search functionality
• Account access

**Product Pages**
• High-quality product images
• Detailed descriptions and specifications
• Customer reviews and ratings
• Size guides and fit information
• Related and recommended products

**Shopping Cart**
• Review items before checkout
• Apply coupon codes and discounts
• Choose delivery options
• Select payment method
• Review order summary

**Smart Shopping Tips**

**Finding the Best Deals**
• Check the "Deals" section regularly
• Sign up for price drop alerts
• Use comparison tools
• Look for bundle offers
• Follow seasonal sales

**Product Research**
• Read customer reviews carefully
• Check product ratings
• Compare specifications
• Look at product photos from customers
• Ask questions in product Q&A

**Size and Fit**
• Use our size guide tools
• Read fit reviews from other customers
• Check return policy for sizing issues
• Consider ordering multiple sizes
• Contact support for fit advice

**Payment Options**

**Accepted Methods**
• Credit and debit cards (Visa, MasterCard, Amex)
• Mobile money (MTN, Airtel, etc.)
• Bank transfers
• Cash on delivery (where available)
• Store credit and gift cards

**Payment Security**
• All transactions are encrypted
• We never store full card details
• Use secure payment gateways
• Monitor for fraudulent activity
• Report suspicious charges immediately

**Delivery Guide**

**Delivery Options**
• Standard delivery (3-5 business days)
• Express delivery (1-2 business days)
• Same-day delivery (selected areas)
• Pickup points and lockers
• Scheduled delivery slots

**Delivery Tips**
• Provide accurate address details
• Include landmark information
• Add delivery instructions
• Ensure someone is available to receive
• Track your order in real-time

**Troubleshooting Common Issues**

**App Performance**
• Update to the latest version
• Clear app cache and data
• Restart your device
• Check internet connection
• Reinstall the app if needed

**Payment Issues**
• Verify card details are correct
• Check if card is enabled for online purchases
• Ensure sufficient balance/credit limit
• Try a different payment method
• Contact your bank if payment is declined

**Order Issues**
• Double-check order details before confirming
• Contact support immediately for urgent changes
• Keep order confirmation emails
• Track orders regularly
• Report issues promptly

**Advanced Features**

**Wish Lists**
• Save items for later purchase
• Share wish lists with friends and family
• Get notifications for price drops
• Move items to cart easily
• Organize multiple wish lists

**Reviews and Ratings**
• Help other customers with honest reviews
• Upload photos with your reviews
• Rate products on multiple criteria
• Follow up on your reviews
• Report inappropriate reviews

**Personalization**
• Set your preferences for better recommendations
• Follow your favorite brands
• Create custom categories
• Set up price alerts
• Customize your homepage

**Customer Support**

**Self-Service Options**
• FAQ section for common questions
• Order tracking and management
• Return and refund requests
• Account settings and preferences
• Help articles and guides

**Contact Support**
• Live chat for immediate assistance
• Email support for detailed inquiries
• Phone support for urgent issues
• Social media support channels
• Community forums and discussions

**Pro Shopping Tips**
• Shop during off-peak hours for better deals
• Use the app for exclusive mobile offers
• Join our loyalty program for extra benefits
• Follow us on social media for flash sales
• Set up notifications for your favorite brands

Ready to start shopping? Use these tips to make the most of your experience with us!`,
    },
}

type QuickActionType = keyof typeof QUICK_ACTION_CONTENT

export default function HelpSupportScreen() {
    const { isAuthenticated } = useAuth()
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [showQuickActionModal, setShowQuickActionModal] = useState(false)
    const [selectedQuickAction, setSelectedQuickAction] = useState<QuickActionType | null>(null)
    const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT))

    useEffect(() => {
        if (showQuickActionModal) {
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
    }, [showQuickActionModal])

    const handleContactOption = (option: (typeof CONTACT_OPTIONS)[0]) => {
        switch (option.id) {
            case "chat":
                Alert.alert("Live Chat", "Opening chat support...")
                break
            case "email":
                Linking.openURL("mailto:support@yourstore.com")
                break
            case "phone":
                if (option.available) {
                    Linking.openURL("tel:+15551234567")
                } else {
                    Alert.alert("Unavailable", "Phone support is currently unavailable. Please try chat or email.")
                }
                break
        }
    }

    const handleQuickAction = (actionType: QuickActionType) => {
        setSelectedQuickAction(actionType)
        setShowQuickActionModal(true)
    }

    const handleCloseQuickActionModal = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowQuickActionModal(false)
            setSelectedQuickAction(null)
        })
    }

    const handleFAQPress = (faqId: string) => {
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
    }

    const renderHeader = () => (
        <ReAnimated.View entering={FadeInDown.springify()} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={styles.headerSpacer} />
        </ReAnimated.View>
    )

    const renderQuickActions = () => (
        <ReAnimated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction("orders")} activeOpacity={0.7}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#EEF2FF" }]}>
                        <FileText size={24} color="#6366F1" />
                    </View>
                    <Text style={styles.quickActionText}>Order Status</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction("returns")} activeOpacity={0.7}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#F0FDF4" }]}>
                        <Star size={24} color="#10B981" />
                    </View>
                    <Text style={styles.quickActionText}>Returns</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction("account")} activeOpacity={0.7}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}>
                        <User size={24} color="#F59E0B" />
                    </View>
                    <Text style={styles.quickActionText}>Account</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickAction} onPress={() => handleQuickAction("guides")} activeOpacity={0.7}>
                    <View style={[styles.quickActionIcon, { backgroundColor: "#F3E8FF" }]}>
                        <Book size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.quickActionText}>Guides</Text>
                </TouchableOpacity>
            </View>
        </ReAnimated.View>
    )

    const renderContactOptions = () => (
        <ReAnimated.View entering={FadeInUp.delay(150).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <View style={styles.contactList}>
                {CONTACT_OPTIONS.map((option, index) => {
                    const IconComponent = option.icon
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.contactItem, !option.available && styles.contactItemDisabled]}
                            onPress={() => handleContactOption(option)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.contactLeft}>
                                <View style={[styles.contactIcon, { backgroundColor: `${option.color}15` }]}>
                                    <IconComponent size={20} color={option.available ? option.color : "#9CA3AF"} />
                                </View>
                                <View style={styles.contactContent}>
                                    <Text style={[styles.contactTitle, !option.available && styles.contactTitleDisabled]}>
                                        {option.title}
                                    </Text>
                                    <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                                    {!option.available && <Text style={styles.unavailableText}>Currently unavailable</Text>}
                                </View>
                            </View>
                            <ChevronRight size={20} color={option.available ? "#9CA3AF" : "#D1D5DB"} />
                        </TouchableOpacity>
                    )
                })}
            </View>
        </ReAnimated.View>
    )

    const renderFAQSection = () => (
        <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
                <HelpCircle size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            </View>

            <View style={styles.faqList}>
                {FAQ_DATA.map((faq, index) => (
                    <TouchableOpacity
                        key={faq.id}
                        style={styles.faqItem}
                        onPress={() => handleFAQPress(faq.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <ChevronRight
                                size={20}
                                color="#9CA3AF"
                                style={[styles.faqChevron, expandedFAQ === faq.id && styles.faqChevronExpanded]}
                            />
                        </View>
                        {expandedFAQ === faq.id && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                    </TouchableOpacity>
                ))}
            </View>
        </ReAnimated.View>
    )

    const renderQuickActionModal = () => {
        if (!showQuickActionModal || !selectedQuickAction) return null

        const actionData = QUICK_ACTION_CONTENT[selectedQuickAction]
        const IconComponent = actionData.icon

        return (
            <Modal
                transparent
                visible={showQuickActionModal}
                animationType="none"
                statusBarTranslucent={true}
                presentationStyle="overFullScreen"
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={handleCloseQuickActionModal} activeOpacity={1} />
                    <Animated.View
                        style={[
                            styles.quickActionModal,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleContainer}>
                                <View style={[styles.modalIcon, { backgroundColor: `${actionData.color}15` }]}>
                                    <IconComponent size={24} color={actionData.color} />
                                </View>
                                <Text style={styles.modalTitle}>{actionData.title}</Text>
                            </View>
                            <TouchableOpacity onPress={handleCloseQuickActionModal} style={styles.closeButton}>
                                <X size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.contentContainer}>
                                <Text style={styles.contentText}>{actionData.content}</Text>
                            </View>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        )
    }

    if (!isAuthenticated) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                <ReAnimated.View entering={FadeInUp.delay(200).springify()} style={styles.authContainer}>
                    <View style={styles.authIconContainer}>
                        <HelpCircle size={60} color="#6366F1" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.authTitle}>Get personalized help</Text>
                    <Text style={styles.authText}>
                        Sign in to access order-specific help{"\n"}
                        and get faster support
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

                    {/* Still show basic help options */}
                    <View style={styles.guestHelpSection}>
                        <Text style={styles.guestHelpTitle}>Or browse help topics</Text>
                        {renderContactOptions()}
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
                {renderQuickActions()}
                {renderContactOptions()}
                {renderFAQSection()}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {renderQuickActionModal()}
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
        marginBottom: 16,
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    quickAction: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    quickActionIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        textAlign: "center",
    },
    contactList: {
        gap: 0,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    contactItemDisabled: {
        opacity: 0.6,
    },
    contactLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    contactContent: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 2,
    },
    contactTitleDisabled: {
        color: "#9CA3AF",
    },
    contactSubtitle: {
        fontSize: 14,
        color: "#6B7280",
    },
    unavailableText: {
        fontSize: 12,
        color: "#EF4444",
        marginTop: 2,
    },
    faqList: {
        gap: 0,
    },
    faqItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        flex: 1,
        marginRight: 12,
    },
    faqChevron: {
        transform: [{ rotate: "0deg" }],
    },
    faqChevronExpanded: {
        transform: [{ rotate: "90deg" }],
    },
    faqAnswer: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
        marginTop: 12,
        paddingRight: 32,
    },
    bottomSpacing: {
        height: 50,
    },
    // Quick Action Modal Styles
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
    quickActionModal: {
        height: SCREEN_HEIGHT * 0.7,
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
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    modalTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    modalIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1F2937",
    },
    closeButton: {
        padding: 4,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    contentContainer: {
        paddingVertical: 20,
        paddingBottom: 40,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 24,
        color: "#374151",
        textAlign: "left",
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
        marginBottom: 40,
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
    guestHelpSection: {
        width: "100%",
        marginTop: 20,
    },
    guestHelpTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        textAlign: "center",
        marginBottom: 20,
    },
})

