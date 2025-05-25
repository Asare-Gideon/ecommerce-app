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
        isLoading,
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
        setFilters,
        resetFilters,
        clearError,
    } = useProductStore()

    // Fetch initial data when the hook is mounted
    useEffect(() => {
        if (initialFetch) {
            fetchProducts()
            fetchPopularProducts()
            fetchCategories()
            fetchBanners()
        }
    }, [initialFetch])

    // Apply filters and fetch products
    const applyFilters = (newFilters: Partial<ProductFilters>) => {
        setFilters(newFilters)
        fetchProducts()
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
        popularProducts,
        categories,
        banners,

        // Status
        isLoading,
        isLoadingMore,
        hasMore,
        error,

        // Pagination
        filters,
        totalCount,
        currentPage,

        // Actions
        fetchProducts,
        fetchMoreProducts,
        fetchPopularProducts,
        fetchCategories,
        fetchBanners,
        setFilters,
        resetFilters,
        clearError,

        // Helper functions
        applyFilters,
        handleLoadMore,
    }
}
