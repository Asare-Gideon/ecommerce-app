import { getUserId } from "@/lib/catalog"
import api from "@/lib/api"
import type { Order } from "@/types/order"
import type { User } from "@/types/user"
import { create } from "zustand"

interface OrdersState {
    orders: Order[]
    selectedOrder: Order | null
    isLoading: boolean
    error: string | null
    fetchOrders: (user: User | null) => Promise<void>
    fetchOrderById: (id: string) => Promise<Order | null>
    createOrder: (payload: unknown) => Promise<Order>
    initializePaystack: (orderId: string, callbackUrl?: string) => Promise<any>
    verifyPaystack: (reference: string) => Promise<any>
    clearSelectedOrder: () => void
}

export const useOrdersStore = create<OrdersState>((set) => ({
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    fetchOrders: async (user) => {
        const userId = getUserId(user)
        if (!userId) return
        try {
            set({ isLoading: true, error: null })
            const response = await api.get<Order[]>(`/order/get-by-user/${userId}`)
            set({ orders: response.data, isLoading: false })
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch orders" })
        }
    },
    fetchOrderById: async (id) => {
        try {
            set({ isLoading: true, error: null })
            const response = await api.get<Order>(`/order/get-one/${id}`)
            set({ selectedOrder: response.data, isLoading: false })
            return response.data
        } catch (error: any) {
            set({ isLoading: false, error: error.response?.data?.message || "Failed to fetch order" })
            return null
        }
    },
    createOrder: async (payload) => {
        const response = await api.post<Order>("/order/create", payload)
        set((state) => ({ orders: [response.data, ...state.orders] }))
        return response.data
    },
    initializePaystack: async (orderId, callbackUrl) => {
        const response = await api.post(`/order/paystack/initialize/${orderId}`, { callbackUrl })
        set({ selectedOrder: response.data.order })
        return response.data
    },
    verifyPaystack: async (reference) => {
        const response = await api.get(`/order/paystack/verify/${encodeURIComponent(reference)}`)
        set({ selectedOrder: response.data.order })
        return response.data
    },
    clearSelectedOrder: () => set({ selectedOrder: null }),
}))
