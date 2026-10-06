import type { Product } from "@/types/product"

export const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"

export const getProductImage = (product?: Partial<Product> | null) => {
    const firstImage = product?.images?.[0]
    if (!firstImage) return FALLBACK_IMAGE
    if (typeof firstImage === "string") return firstImage
    return firstImage.url || FALLBACK_IMAGE
}

export const getProductPrice = (product?: Partial<Product> | null) =>
    Number(product?.effectivePrice ?? product?.price ?? 0)

export const formatMoney = (value: number, currency = "GHS") => {
    const currencyCode = String(currency || "GHS").toUpperCase()
    const amount = Number(value || 0).toLocaleString("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return `${currencyCode === "GHS" ? "GH\u20B5" : `${currencyCode} `}${amount}`
}

export const getUserId = (user?: { _id?: string; id?: string } | null) => user?._id || user?.id || ""
