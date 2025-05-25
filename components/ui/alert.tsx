"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react-native"
import type React from "react"
import { useEffect, useRef } from "react"
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from "react-native"

const { width } = Dimensions.get("window")

export type AlertType = "success" | "warning" | "error" | "info"

interface AlertProps {
    visible: boolean
    type: AlertType
    message: string
    onClose: () => void
    autoClose?: boolean
    duration?: number
    style?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
}

const Alert: React.FC<AlertProps> = ({
    visible,
    type,
    message,
    onClose,
    autoClose = true,
    duration = 3000,
    style,
    textStyle,
}) => {
    const translateY = useRef(new Animated.Value(100)).current
    const opacity = useRef(new Animated.Value(0)).current
    const timeout = useRef<NodeJS.Timeout | null>(null)

    const getAlertStyle = () => {
        switch (type) {
            case "success":
                return {
                    backgroundColor: "#10B981",
                    icon: <CheckCircle size={24} color="#fff" />,
                }
            case "warning":
                return {
                    backgroundColor: "#F59E0B",
                    icon: <AlertTriangle size={24} color="#fff" />,
                }
            case "error":
                return {
                    backgroundColor: "#EF4444",
                    icon: <AlertCircle size={24} color="#fff" />,
                }
            case "info":
                return {
                    backgroundColor: "#3B82F6",
                    icon: <Info size={24} color="#fff" />,
                }
            default:
                return {
                    backgroundColor: "#3B82F6",
                    icon: <Info size={24} color="#fff" />,
                }
        }
    }

    const showAlert = () => {
        // Clear any existing timeout
        if (timeout.current) {
            clearTimeout(timeout.current)
        }

        // Start animations
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start()

        // Set timeout for auto close
        if (autoClose) {
            (timeout as any).current = setTimeout(() => {
                hideAlert()
            }, duration)
        }
    }

    const hideAlert = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onClose) {
                onClose()
            }
        })
    }

    useEffect(() => {
        if (visible) {
            showAlert()
        } else {
            hideAlert()
        }

        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }
        }
    }, [visible])

    const alertStyle = getAlertStyle()

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                    backgroundColor: alertStyle.backgroundColor,
                },
                style,
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>{alertStyle.icon}</View>
                <Text style={[styles.message, textStyle]} numberOfLines={2}>
                    {message}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={hideAlert}>
                    <X size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    closeButton: {
        marginLeft: 12,
        padding: 4,
    },
})

export default Alert
