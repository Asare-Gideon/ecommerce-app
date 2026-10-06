import { staticBanners, staticCategories, staticPromoBanner } from "@/constants/static-data"
import api from "@/lib/api"
import type { Banner, Category, Product, ProductFilters } from "@/types/product"
import { create } from "zustand"

const DEFAULT_FILTERS: ProductFilters = {
    page: 1,
    limit: 8,
    sort: "createdAt:desc",
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
    promoBanner: Banner | null
    isLoading: boolean
    isProductLoading: boolean
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
    fetchPromoBanner: () => Promise<void>
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
    promoBanner: staticPromoBanner,
    isLoading: false,
    isProductLoading: false,
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
            const filters = resetFilters ? { ...DEFAULT_FILTERS } : { ...get().filters }
            const params = {
                ...filters,
                sort: filters.sort === "popular" ? "sold:desc" : filters.sort,
                page: resetFilters ? 1 : filters.page || 1,
            }
            set({
                isLoading: true,
                error: null,
                filters: params,
                currentPage: Number(params.page) || 1,
            })

            const response = await api.get<{ stats: productStats, products: Product[] }>("/product/query", {
                params,
            })

            const result = response.data

            set({
                products: result.products,
                totalCount: result.stats.total,
                currentPage: Number(params.page) || 1,
                hasMore: result.stats.totalPages > (Number(params.page) || 1),
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
            set({ isProductLoading: true, product: null, error: null })
            const response = await api.get<Product>(`/product/get-one/${productId}`)
            set({ product: response.data, isProductLoading: false })
        } catch (error: any) {
            console.error("Failed to fetch product by ID:", error)
            set({
                product: null,
                isProductLoading: false,
                error: error.response?.data?.message || "Failed to fetch product",
            })
        }
    },

    fetchMoreProducts: async () => {
        const { isLoadingMore, hasMore, filters, products, currentPage } = get()

        if (isLoadingMore || !hasMore) return

        try {
            const nextPage = (filters.page || 1) + 1
            if (currentPage >= nextPage) return
            set({ isLoadingMore: true })

            const updatedFilters = { ...filters, page: nextPage }

            const response = await api.get<{ stats: productStats, products: Product[] }>("/product/query", {
                params: {
                    ...updatedFilters,
                    sort: updatedFilters.sort === "popular" ? "sold:desc" : updatedFilters.sort,
                },
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
            const response = await api.get<Banner[]>("/banner/get-all", {
                params: { placement: "slider" },
            })
            set({ banners: response.data.length ? response.data : staticBanners })
        } catch (error: any) {
            console.error("Failed to fetch banners:", error)
            set({ banners: staticBanners })
        }
    },

    fetchPromoBanner: async () => {
        try {
            const response = await api.get<Banner[]>("/banner/get-all", {
                params: { placement: "promo" },
            })
            set({ promoBanner: response.data[0] || staticPromoBanner })
        } catch (error: any) {
            console.error("Failed to fetch promo banner:", error)
            set({ promoBanner: staticPromoBanner })
        }
    },

    // Update filters
    setFilters: (newFilters) => {
        const page = newFilters.page || 1
        set({
            filters: { ...DEFAULT_FILTERS, ...newFilters, page },
            currentPage: page,
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
    fetchPromoBanner,
    setFilters,
    resetFilters,
    clearError,
} = useProductStore.getState()
