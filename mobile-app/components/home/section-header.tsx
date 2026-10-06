"use client"

import type React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SectionHeaderProps {
    title: string
    actionText: string
    onActionPress: () => void
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionText, onActionPress }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onActionPress}>
                <Text style={styles.actionText}>{actionText}</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
    },
    actionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#999",
    },
})

export default SectionHeader

