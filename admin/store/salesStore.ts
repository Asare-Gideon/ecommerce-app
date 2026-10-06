import { create } from "zustand";

export interface SalesType {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  products: Array<{
    product?: string;
    title?: string;
    quantity?: number;
    price?: number;
    _id: string;
    id: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveredAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  saleDate: string;
  id: string;
}

interface SalesState {
  sales: SalesType[];
  isLoading: boolean;
  error: any | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: any | null) => void;
  setSales: (sales: SalesType[]) => void;
  addSaleToState: (sale: SalesType) => void;
  removeSaleFromState: (id: string) => void;
}

export const useSalesStore = create<SalesState>((set) => ({
  sales: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setSales: (sales) => set({ sales }),
  addSaleToState: (sale) =>
    set((state) => ({ sales: [...state.sales, sale] })),
  removeSaleFromState: (id) =>
    set((state) => ({
      sales: state.sales.filter((sale) => sale._id !== id),
    })),
}));