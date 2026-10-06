import api from "@/lib/api"
import type { Blog, BlogCategory } from "@/types/blog"
import { create } from "zustand"

interface BlogState {
    blogs: Blog[]
    categories: BlogCategory[]
    selectedBlog: Blog | null
    homeBlog: Blog | null
    isLoading: boolean
    error: string | null
    fetchBlogs: () => Promise<void>
    fetchCategories: () => Promise<void>
    fetchBlogById: (id: string) => Promise<void>
    fetchHomeBlog: () => Promise<void>
}

export const useBlogStore = create<BlogState>((set) => ({
    blogs: [],
    categories: [],
    selectedBlog: null,
    homeBlog: null,
    isLoading: false,
    error: null,
    fetchBlogs: async () => {
        try {
            set({ isLoading: true, error: null })
            const response = await api.get<{ blogs: Blog[] }>("/blog/query", {
                params: { status: "published", limit: 20, sort: "createdAt:desc" },
            })
            set({ blogs: response.data.blogs || [], isLoading: false })
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch blogs" })
        }
    },
    fetchCategories: async () => {
        try {
            const response = await api.get<BlogCategory[]>("/blog-category/get-all")
            set({ categories: response.data })
        } catch (error) {
            console.log("Failed to fetch blog categories", error)
        }
    },
    fetchBlogById: async (id) => {
        try {
            set({ isLoading: true, error: null })
            const response = await api.get<Blog>(`/blog/get-one/${id}`)
            set({ selectedBlog: response.data, isLoading: false })
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch blog" })
        }
    },
    fetchHomeBlog: async () => {
        try {
            const response = await api.get<{ blogs: Blog[] }>("/blog/query", {
                params: { status: "published", showOnHome: true, limit: 1, sort: "updatedAt:desc" },
            })
            set({ homeBlog: response.data.blogs?.[0] || null })
        } catch (error) {
            console.log("Failed to fetch home blog", error)
            set({ homeBlog: null })
        }
    },
}))
