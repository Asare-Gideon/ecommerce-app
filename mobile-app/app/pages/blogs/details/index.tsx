"use client"

import { useBlogStore } from "@/store/blog"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Calendar } from "lucide-react-native"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { WebView } from "react-native-webview"
import Animated, { FadeInDown } from "react-native-reanimated"

const html = (content: string) => `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        html, body {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: transparent;
          font-family: -apple-system, BlinkMacSystemFont, "Roboto", Arial, sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: #1A1A1A;
        }
        body { text-align: justify; }
        p, div, blockquote, ul, ol, h1, h2, h3, h4, h5, h6 {
          width: 100%;
          max-width: 100%;
        }
        p {
          margin: 0 0 16px;
        }
        h1, h2, h3 {
          margin: 22px 0 12px;
          line-height: 1.25;
          text-align: left;
        }
        ul, ol {
          margin: 0 0 16px;
          padding-left: 22px;
          text-align: left;
        }
        li { margin-bottom: 8px; }
        img, video, iframe {
          max-width: 100%;
          height: auto;
        }
        blockquote {
          margin: 18px 0;
          padding: 12px 14px;
          border-left: 4px solid #2463eb;
          background: #F5F5F5;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <main id="article-content">${content || ""}</main>
      <script>
        function sendHeight() {
          var height = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(height));
        }
        window.addEventListener("load", sendHeight);
        setTimeout(sendHeight, 100);
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 1000);
      </script>
    </body>
  </html>
`

export default function BlogDetailsScreen() {
    const { id } = useLocalSearchParams()
    const { selectedBlog, isLoading, fetchBlogById } = useBlogStore()
    const [contentHeight, setContentHeight] = useState(400)

    useEffect(() => {
        if (id) {
            setContentHeight(400)
            fetchBlogById(String(id))
        }
    }, [fetchBlogById, id])

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Article</Text>
                <View style={styles.headerSpacer} />
            </Animated.View>

            {isLoading || !selectedBlog ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#6366F1" />
                </View>
            ) : (
                <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                    <Image source={{ uri: selectedBlog.thumbnail }} style={styles.thumbnail} />
                    <View style={styles.content}>
                        <Text style={styles.title}>{selectedBlog.title}</Text>
                        <View style={styles.metaRow}>
                            <Calendar size={14} color="#6B7280" />
                            <Text style={styles.metaText}>{new Date(selectedBlog.publishedAt || selectedBlog.createdAt).toLocaleDateString()}</Text>
                        </View>
                        {(selectedBlog.tags || []).length > 0 && (
                            <View style={styles.tags}>
                                {(selectedBlog.tags || []).map((tag) => (
                                    <Text key={tag} style={styles.tag}>{tag}</Text>
                                ))}
                            </View>
                        )}
                        <WebView
                            originWhitelist={["*"]}
                            source={{ html: html(selectedBlog.content) }}
                            style={[styles.webview, { height: contentHeight }]}
                            scrollEnabled={false}
                            onMessage={(event) => {
                                const nextHeight = Number(event.nativeEvent.data)
                                if (Number.isFinite(nextHeight) && nextHeight > 0) {
                                    setContentHeight(Math.ceil(nextHeight))
                                }
                            }}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E0E0E0" },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "600", color: "#1A1A1A" },
    headerSpacer: { width: 32 },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { flex: 1 },
    thumbnail: { width: "100%", height: 240, backgroundColor: "#F5F5F5" },
    content: { backgroundColor: "#fff", padding: 20 },
    title: { fontSize: 24, fontWeight: "800", color: "#1A1A1A", lineHeight: 32, marginBottom: 12 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
    metaText: { fontSize: 13, color: "#666" },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    tag: { color: "#2463eb", backgroundColor: "#F5F5F5", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, fontSize: 12, fontWeight: "600" },
    webview: { width: "100%", backgroundColor: "transparent" },
})
