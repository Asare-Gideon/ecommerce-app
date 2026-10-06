"use client"

import { useEffect } from "react"
import { useProductStore } from "../store/product"
import type { ProductFilters } from "../types/product"

export function useProducts(initialFetch = true) {
    // Get all state and actions from the product store
    const {
        products,
        popularProducts,
        categories,
        banners,
        promoBanner,
        isLoading,
        isProductLoading,
        isLoadingMore,
        hasMore,
        error,
        filters,
        totalCount,
        currentPage,
        fetchProducts,
        fetchMoreProducts,
        fetchPopularProducts,
        fetchCategories,
        fetchBanners,
        fetchPromoBanner,
        setFilters,
        resetFilters,
        clearError,
        defaultFilters,
        product,
        fetchProductById,
    } = useProductStore()

    // Fetch initial data when the hook is mounted
    useEffect(() => {
        if (initialFetch) {
            fetchProducts()
            fetchPopularProducts()
            fetchCategories()
            fetchBanners()
            fetchPromoBanner()
        }
    }, [initialFetch])

    // Apply filters and fetch products
    const applyFilters = (newFilters: Partial<ProductFilters>) => {
        setFilters(newFilters)
        return fetchProducts()
    }

    // Handle infinite scroll - load more products
    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            fetchMoreProducts()
        }
    }

    // Return all data and actions
    return {
        // Data
        products,
        product,
        popularProducts,
        categories,
        banners,
        promoBanner,

        // Status
        isLoading,
        isProductLoading,
        isLoadingMore,
        hasMore,
        error,

        // Pagination
        filters,
        totalCount,
        currentPage,
        defaultFilters,

        // Actions
        fetchProducts,
        fetchMoreProducts,
        fetchPopularProducts,
        fetchCategories,
        fetchBanners,
        fetchPromoBanner,
        setFilters,
        resetFilters,
        clearError,
        fetchProductById,

        // Helper functions
        applyFilters,
        handleLoadMore,
    }
}
