import { create } from "zustand";
import { Product } from "./productStore";

export interface OrderType {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  products: {
    product: Product;
    quantity: number;
    chosenColors: string[];
    chosenSize?: string;
    chosenColor?: string;
  }[];
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "canceled" | "delivered";
  paymentMethod: "credit-card" | "payment-on-delivery" | "card" | "cash" | "bank-transfer" | "mobile-money" | string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress:
    | string
    | {
        _id?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
        phoneNumber?: string;
        email?: string;
        default?: boolean;
      };
  subtotalAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  shippingMethod?: string;
  paymentGateway?: "paystack" | "manual" | string;
  transactionId?: string;
  paidAt?: Date | string;
  deliveredAt?: Date | string;
  canceledReason?: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface statusTotalType {
  completed: number;
  pending: number;
  cancelled: number;
  processing: number;
  delivered: number;
  currentPage: number;
  totalOrders: number;
  totalPages: number;
}

interface OrderState {
  orders: OrderType[];
  statusesTotal: statusTotalType | null;
  isLoading: boolean;
  error: any | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: any | null) => void;
  setOrders: (orders: OrderType[]) => void;
  setStatusesTotal: (totals: statusTotalType) => void;
  addOrderToState: (order: OrderType) => void;
  removeOrderFromState: (id: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  statusesTotal: null,
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setOrders: (orders) => set({ orders }),
  setStatusesTotal: (totals) => set({ statusesTotal: totals }),
  addOrderToState: (order) =>
    set((state) => ({ orders: [...state.orders, order] })),
  removeOrderFromState: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order._id !== id),
    })),
}));
