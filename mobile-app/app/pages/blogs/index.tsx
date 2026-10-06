"use client"

import { useBlogStore } from "@/store/blog"
import type { Blog } from "@/types/blog"
import { router } from "expo-router"
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react-native"
import { useEffect } from "react"
import { ActivityIndicator, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

export default function BlogsScreen() {
    const { blogs, isLoading, fetchBlogs, fetchCategories } = useBlogStore()

    useEffect(() => {
        fetchBlogs()
        fetchCategories()
    }, [])

    const renderBlog = ({ item, index }: { item: Blog; index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 70).springify()}>
            <TouchableOpacity
                style={styles.blogCard}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: "/pages/blogs/details" as any, params: { id: item._id } as any })}
            >
                <Image source={{ uri: item.thumbnail }} style={styles.blogImage} />
                <View style={styles.blogContent}>
                    <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.metaRow}>
                        <Calendar size={13} color="#6B7280" />
                        <Text style={styles.metaText}>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {item.tags?.length > 0 && (
                        <View style={styles.tagRow}>
                            <Tag size={13} color="#6366F1" />
                            <Text style={styles.tagText} numberOfLines={1}>{item.tags.slice(0, 3).join(", ")}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    )

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blog</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#6366F1" />
                </View>
            ) : (
                <FlatList
                    data={blogs}
                    renderItem={renderBlog}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <BookOpen size={56} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No blog posts yet</Text>
                            <Text style={styles.emptyText}>Latest updates and guides will show here.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: "600", color: "#1A1A1A" },
    headerSpacer: { width: 32 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    listContent: { padding: 16, paddingBottom: 100 },
    blogCard: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#E0E0E0" },
    blogImage: { width: "100%", height: 170, backgroundColor: "#F5F5F5" },
    blogContent: { padding: 16 },
    blogTitle: { fontSize: 17, fontWeight: "700", color: "#1A1A1A", lineHeight: 24, marginBottom: 10 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    metaText: { fontSize: 13, color: "#666" },
    tagRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    tagText: { fontSize: 13, color: "#2463eb", flex: 1 },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 120, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", marginTop: 16, marginBottom: 8 },
    emptyText: { fontSize: 14, color: "#666", textAlign: "center" },
})
