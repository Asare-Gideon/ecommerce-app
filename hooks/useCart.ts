"use client"

import { useAlert } from "@/lib/alert-context"
import { useCartStore } from "@/store/cart"
import type { Product } from "@/types/product"

export function useCart() {
    const { items, isLoading, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } =
        useCartStore()

    const { showAlert } = useAlert()

    const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
        addToCart(product, quantity, color, size)
        showAlert("success", `${product.title} added to cart`)
    }

    const handleRemoveFromCart = (productId: string, productTitle: string) => {
        removeFromCart(productId)
        showAlert("info", `${productTitle} removed from cart`)
    }

    const cartTotal = getCartTotal()
    const cartCount = getCartCount()

    return {
        items,
        isLoading,
        cartTotal,
        cartCount,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        updateQuantity,
        clearCart,
    }
}
