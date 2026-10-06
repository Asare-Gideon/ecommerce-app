"use client"

import { useAlert } from "@/lib/alert-context"
import type { Product } from "@/types/product"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface WishlistState {
    items: Product[]
    addToWishlist: (product: Product) => void
    removeFromWishlist: (productId: string) => void
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (product) => {
                const { items } = get()
                if (!items.some((item) => item._id === product._id)) {
                    set({ items: [...items, product] })
                }
            },

            removeFromWishlist: (productId) => {
                const { items } = get()
                set({
                    items: items.filter((item) => item._id !== productId),
                })
            },

            isInWishlist: (productId) => {
                const { items } = get()
                return items.some((item) => item._id === productId)
            },

            clearWishlist: () => {
                set({ items: [] })
            },
        }),
        {
            name: "wishlist-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
)

export function useWishlist() {
    const { items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist } = useWishlistStore()
    const { showAlert } = useAlert()

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product._id)) {
            removeFromWishlist(product._id)
            showAlert("info", `${product.title} removed from favorites`)
        } else {
            addToWishlist(product)
            showAlert("success", `${product.title} added to favorites`)
        }
    }

    return {
        wishlistItems: items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        toggleWishlist,
        wishlistCount: items.length,
    }
}
