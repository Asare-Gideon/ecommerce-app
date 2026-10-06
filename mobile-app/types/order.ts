import type { Product } from "./product"
import type { Address, User } from "./user"

export type OrderStatus = "pending" | "processing" | "completed" | "delivered" | "canceled"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface OrderItem {
    product: Product
    quantity: number
    price?: number
    chosenSize?: string
    chosenColor?: string
    chosenColors?: string[]
}

export interface Order {
    _id: string
    user: User | string
    products: OrderItem[]
    totalAmount: number
    subtotalAmount?: number
    shippingAmount?: number
    taxAmount?: number
    discountAmount?: number
    shippingMethod?: string
    status: OrderStatus
    paymentMethod: string
    paymentGateway?: "paystack" | "manual"
    paymentStatus: PaymentStatus
    shippingAddress?: Address | string
    canceledReason?: string
    deliveredAt?: string
    transactionId?: string
    paymentAuthorizationUrl?: string
    paidAt?: string
    createdAt: string
    updatedAt: string
}

export interface PaymentMethod {
    _id: string
    name: string
    code: string
    description: string
    instructions?: string
    gateway: "paystack" | "manual"
    isActive: boolean
}

export interface ShippingMethod {
    _id: string
    name: string
    description?: string
    amount: number
    estimatedDays?: string
    isActive: boolean
}

export interface StoreSettings {
    storeName: string
    supportEmail?: string
    supportPhone?: string
    currency: string
    shippingMethods: ShippingMethod[]
    paymentMethods: PaymentMethod[]
}
