import type { Product } from "@/types/product"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface CartItem {
    product: Product
    quantity: number
    selectedColor?: string
    selectedSize?: string
}

interface CartState {
    items: CartItem[]
    isLoading: boolean

    // Actions
    addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    getCartTotal: () => number
    getCartCount: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,

            addToCart: (product, quantity = 1, color, size) => {
                const { items } = get()
                const existingItemIndex = items.findIndex((item) => item.product._id === product._id)

                if (existingItemIndex !== -1) {
                    // Item already exists, update quantity
                    const updatedItems = [...items]
                    updatedItems[existingItemIndex].quantity += quantity

                    // Update color and size if provided
                    if (color) updatedItems[existingItemIndex].selectedColor = color
                    if (size) updatedItems[existingItemIndex].selectedSize = size

                    set({ items: updatedItems })
                } else {
                    // Add new item
                    set({
                        items: [
                            ...items,
                            {
                                product,
                                quantity,
                                selectedColor: color,
                                selectedSize: size,
                            },
                        ],
                    })
                }
            },

            removeFromCart: (productId) => {
                const { items } = get()
                set({
                    items: items.filter((item) => item.product._id !== productId),
                })
            },

            updateQuantity: (productId, quantity) => {
                const { items } = get()
                const updatedItems = items.map((item) => {
                    if (item.product._id === productId) {
                        return { ...item, quantity }
                    }
                    return item
                })

                set({ items: updatedItems })
            },

            clearCart: () => {
                set({ items: [] })
            },

            getCartTotal: () => {
                const { items } = get()
                return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
            },

            getCartCount: () => {
                const { items } = get()
                return items.reduce((count, item) => count + item.quantity, 0)
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
)

// Export individual actions for direct imports
export const { addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } =
    useCartStore.getState()
