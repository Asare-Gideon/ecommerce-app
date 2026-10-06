import { create } from "zustand";

export interface ShippingMethod {
  _id: string;
  name: string;
  description: string;
  amount: number;
  estimatedDays: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  _id: string;
  name: string;
  code: string;
  description: string;
  instructions: string;
  gateway: "paystack" | "manual";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
}

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: unknown | null;
  setSettings: (settings: Settings) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: unknown | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  error: null,
  setSettings: (settings) => set({ settings }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
