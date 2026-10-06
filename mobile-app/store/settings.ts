import api from "@/lib/api"
import type { PaymentMethod, ShippingMethod, StoreSettings } from "@/types/order"
import { create } from "zustand"

const fallbackPaymentMethods: PaymentMethod[] = [
    {
        _id: "credit-card",
        name: "Credit Card",
        code: "credit-card",
        description: "Pay securely with card through Paystack",
        gateway: "paystack",
        isActive: true,
    },
    {
        _id: "mobile-money",
        name: "Mobile Money",
        code: "mobile-money",
        description: "Pay securely with mobile money through Paystack",
        gateway: "paystack",
        isActive: true,
    },
    {
        _id: "payment-on-delivery",
        name: "Payment on Delivery",
        code: "payment-on-delivery",
        description: "Pay when your order arrives",
        gateway: "manual",
        isActive: true,
    },
]

const fallbackShippingMethods: ShippingMethod[] = [
    {
        _id: "standard",
        name: "Standard Delivery",
        description: "Delivers within 3-5 business days.",
        amount: 5.99,
        estimatedDays: "3-5 business days",
        isActive: true,
    },
    {
        _id: "express",
        name: "Express Delivery",
        description: "Delivers within 1-2 business days.",
        amount: 12.99,
        estimatedDays: "1-2 business days",
        isActive: true,
    },
]

interface SettingsState {
    settings: StoreSettings | null
    paymentMethods: PaymentMethod[]
    shippingMethods: ShippingMethod[]
    currency: string
    isLoading: boolean
    fetchSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: null,
    paymentMethods: fallbackPaymentMethods,
    shippingMethods: fallbackShippingMethods,
    currency: "GHS",
    isLoading: false,
    fetchSettings: async () => {
        try {
            set({ isLoading: true })
            const response = await api.get<StoreSettings>("/settings")
            const activePayments = (response.data.paymentMethods || []).filter((method) => method.isActive)
            const activeShipping = (response.data.shippingMethods || []).filter((method) => method.isActive)
            set({
                settings: response.data,
                paymentMethods: activePayments.length ? activePayments : fallbackPaymentMethods,
                shippingMethods: activeShipping,
                currency: response.data.currency || "GHS",
                isLoading: false,
            })
        } catch (error) {
            console.log("Failed to fetch settings", error)
            set({ paymentMethods: fallbackPaymentMethods, shippingMethods: fallbackShippingMethods, isLoading: false })
        }
    },
}))
