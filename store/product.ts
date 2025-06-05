import { staticBanners, staticCategories } from "@/constants/static-data"
import api from "@/lib/api"
import type { Banner, Category, Product, ProductFilters } from "@/types/product"
import { create } from "zustand"

const DEFAULT_FILTERS: ProductFilters = {
    page: 1,
    limit: 8,
    sort: "popular",
    onlyPublished: true,
    onlyStock: true,
}

interface productStats {
    total: number
    pages: number
    totalPages: number
    success: boolean
}

interface ProductState {
    products: Product[]
    popularProducts: Product[]
    categories: Category[]
    banners: Banner[]
    isLoading: boolean
    isLoadingMore: boolean
    hasMore: boolean
    error: string | null
    filters: ProductFilters
    totalCount: number
    currentPage: number
    defaultFilters: ProductFilters
    product: Product | null
    // Actions
    fetchProducts: (resetFilters?: boolean) => Promise<void>
    fetchProductById: (productId: string) => Promise<void>
    fetchMoreProducts: () => Promise<void>
    fetchPopularProducts: () => Promise<void>
    fetchCategories: () => Promise<void>
    fetchBanners: () => Promise<void>
    setFilters: (filters: Partial<ProductFilters>) => void
    resetFilters: () => void
    clearError: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
    // Initial state
    products: [],
    product: null,
    popularProducts: [],
    categories: staticCategories,
    banners: staticBanners,
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    filters: { ...DEFAULT_FILTERS },
    totalCount: 0,
    currentPage: 1,
    defaultFilters: { ...DEFAULT_FILTERS },

    // Fetch main product listing
    fetchProducts: async (resetFilters = false) => {
        try {
            set({
                isLoading: true,
                error: null,
                filters: resetFilters ? { ...DEFAULT_FILTERS } : get().filters,
                currentPage: resetFilters ? 1 : get().currentPage,
            })

            const response = await api.get<{ stats: productStats, products: Product[] }>("product/query", {
                params: get().filters,
            })

            const result = response.data

            set({
                products: result.products,
                totalCount: result.stats.total,
                hasMore: result.stats.totalPages > get().currentPage,
                isLoading: false,
            })
        } catch (error: any) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Failed to fetch products",
            })
        }
    },
    fetchProductById: async (productId: string) => {
        try {
            const response = await api.get<Product>(`/product/get-one/${productId}`)
            set({ product: response.data })
        } catch (error: any) {
            console.error("Failed to fetch product by ID:", error)
        }
    },

    fetchMoreProducts: async () => {
        const { isLoadingMore, hasMore, filters, products, currentPage } = get()

        if (isLoadingMore || !hasMore) return

        try {
            const nextPage = (filters.page || 1) + 1
            console.log("currentPage", currentPage)
            console.log("nextPage", nextPage)
            if (currentPage >= nextPage) return
            set({ isLoadingMore: true })

            const updatedFilters = { ...filters, page: nextPage }
            console.log("updatedFilters", updatedFilters)

            const response = await api.get<{ stats: productStats, products: Product[] }>("product/query", {
                params: updatedFilters,
            })

            const result = response.data

            // Update state with new products
            set({
                products: [...products, ...result.products],
                filters: updatedFilters,
                currentPage: nextPage,
                totalCount: result.stats.total,
                hasMore: result.stats.totalPages > nextPage,
                isLoadingMore: false,
            })
        } catch (error: any) {
            set({
                isLoadingMore: false,
                error: error.response?.data?.message || "Failed to fetch more products",
            })
        }
    },

    // Fetch popular products
    fetchPopularProducts: async () => {
        try {
            const response = await api.get<Product[]>("/product/popular")
            const result = response.data;

            set({ popularProducts: result })
        } catch (error: any) {
            console.error("Failed to fetch popular products:", error)
        }
    },

    // Fetch categories
    fetchCategories: async () => {
        try {
            const response = await api.get<Category[]>("/category/get-all")
            set({ categories: response.data })
        } catch (error: any) {
            console.error("Failed to fetch categories:", error)
        }
    },

    // Fetch promotional banners
    fetchBanners: async () => {
        try {
            // In a real app, you would fetch from API:
            // const response = await api.get<Banner[]>("/banners")
            // set({ banners: response.data })

            // For now, use static data
            set({ banners: staticBanners })
        } catch (error: any) {
            console.error("Failed to fetch banners:", error)
        }
    },

    // Update filters
    setFilters: (newFilters) => {
        set({
            filters: { ...get().filters, ...newFilters },
            currentPage: newFilters.page || get().currentPage,
        })
    },

    // Reset filters to defaults
    resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } })
    },

    // Clear error state
    clearError: () => {
        set({ error: null })
    },
}))

// Export individual actions for direct imports
export const {
    fetchProducts,
    fetchMoreProducts,
    fetchPopularProducts,
    fetchCategories,
    fetchBanners,
    setFilters,
    resetFilters,
    clearError,
} = useProductStore.getState()
