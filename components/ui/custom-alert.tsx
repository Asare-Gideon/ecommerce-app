import { BlurView } from "expo-blur"
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react-native"
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"

const { width, height } = Dimensions.get("window")

interface CustomAlertProps {
    visible: boolean
    type?: "success" | "error" | "warning" | "info"
    title: string
    message: string
    primaryButton?: {
        text: string
        onPress: () => void
        style?: "default" | "destructive"
    }
    secondaryButton?: {
        text: string
        onPress: () => void
    }
    onClose?: () => void
}

export function CustomAlert({
    visible,
    type = "info",
    title,
    message,
    primaryButton,
    secondaryButton,
    onClose,
}: CustomAlertProps) {
    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle size={48} color="#10B981" />
            case "error":
                return <XCircle size={48} color="#EF4444" />
            case "warning":
                return <AlertTriangle size={48} color="#F59E0B" />
            default:
                return <Info size={48} color="#6366F1" />
        }
    }

    const getIconBackgroundColor = () => {
        switch (type) {
            case "success":
                return "#ECFDF5"
            case "error":
                return "#FEF2F2"
            case "warning":
                return "#FFFBEB"
            default:
                return "#EEF2FF"
        }
    }

    return (
        <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                <View style={styles.centeredView}>
                    <Animated.View
                        entering={SlideInDown.springify()}
                        exiting={SlideOutDown.springify()}
                        style={styles.alertContainer}
                    >
                        {onClose && (
                            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
                                <X size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}

                        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>{getIcon()}</View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {secondaryButton && (
                                <TouchableOpacity style={styles.secondaryButton} onPress={secondaryButton.onPress} activeOpacity={0.8}>
                                    <Text style={styles.secondaryButtonText}>{secondaryButton.text}</Text>
                                </TouchableOpacity>
                            )}
                            {primaryButton && (
                                <TouchableOpacity
                                    style={[
                                        styles.primaryButton,
                                        primaryButton.style === "destructive" && styles.destructiveButton,
                                        !secondaryButton && styles.fullWidthButton,
                                    ]}
                                    onPress={primaryButton.onPress}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.primaryButtonText,
                                            primaryButton.style === "destructive" && styles.destructiveButtonText,
                                        ]}
                                    >
                                        {primaryButton.text}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    alertContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        padding: 4,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#6366F1",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    destructiveButton: {
        backgroundColor: "#EF4444",
    },
    fullWidthButton: {
        flex: 1,
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    destructiveButtonText: {
        color: "#fff",
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    secondaryButtonText: {
        color: "#374151",
        fontSize: 16,
        fontWeight: "600",
    },
})

