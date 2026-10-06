import type { User } from "./user"


export interface Category {
    _id: string
    name: string
    slug: string
    icon?: string
    image?: string
}


export interface ProductImage {
    name: string
    url: string
}


export interface ProductRating {
    user: User | string
    rating: number
}

export interface ProductVariant {
    size: string
    color: string
    quantity: number
}


export interface Product {
    _id: string
    title: string
    description: string
    slug: string
    category: Category | string
    price: number
    quantity: number
    images: ProductImage[]
    brand?: string
    sold: number
    isPublished: boolean
    publishedAt?: Date
    colors: string[]
    sizes: string[]
    variants?: ProductVariant[]
    ratings: ProductRating[]
    createdAt: Date
    updatedAt: Date

    isNew?: boolean
    discountPercentage?: number
    averageRating?: number
    effectivePrice?: number
    hasDiscount?: boolean
    discount?: {
        type: "percentage" | "fixed"
        value: number
        startsAt?: string | Date | null
        endsAt?: string | Date | null
        isActive: boolean
    }
}

export interface ProductsResponse {
    products: Product[]
    totalCount: number
    hasMore: boolean
}


export interface ProductFilters {
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    sizes?: string[]
    sort?: "price" | "sold" | "createdAt" | "updatedAt" | "popular" | "brand" | "quantity" | "title" | `${string}:${"asc" | "desc"}`
    search?: string
    page?: number
    limit?: number
    onlyPublished?: boolean
    lowStocks?: boolean
    highStocks?: boolean
    outStocks?: boolean
    highSold?: boolean
    lowSold?: boolean
    onlyStock?: boolean
}

export interface Banner {
    _id: string
    placement?: "slider" | "promo"
    title?: string
    name?: string
    subtitle?: string
    image: string
    link?: string
    backgroundColor?: string
    textColor?: string
    buttonText?: string
}
