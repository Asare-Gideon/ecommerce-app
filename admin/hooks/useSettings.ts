import { useAuthStore } from "@/store/authStore";
import { PaymentMethod, ShippingMethod, useSettingsStore } from "@/store/settingsStore";
import { BASE_URL } from "@/utils/constants";
import axios from "axios";
import { toast } from "./use-toast";

const SETTINGS_URL = `${BASE_URL}/settings`;

export type ShippingMethodPayload = Pick<
  ShippingMethod,
  "name" | "description" | "amount" | "estimatedDays" | "isActive"
>;

export type PaymentMethodPayload = Pick<
  PaymentMethod,
  "name" | "code" | "description" | "instructions" | "gateway" | "isActive"
>;

const getErrorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || fallback;

export function useSettings() {
  const { token } = useAuthStore();
  const { setSettings, setLoading, setError } = useSettingsStore();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(SETTINGS_URL);
      setSettings(response.data);
      return response.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch settings.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to fetch settings.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updates: Partial<{ storeName: string; supportEmail: string; supportPhone: string; currency: string }>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(SETTINGS_URL, updates, { headers });
      setSettings(response.data);
      toast({ title: "Settings saved successfully" });
      return response.data;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to save settings.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to save settings.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const createShippingMethod = async (payload: ShippingMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${SETTINGS_URL}/shipping-methods`, payload, { headers });
      setSettings(response.data);
      toast({ title: "Shipping method created" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create shipping method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to create shipping method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updateShippingMethod = async (id: string, payload: ShippingMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${SETTINGS_URL}/shipping-methods/${id}`, payload, { headers });
      setSettings(response.data);
      toast({ title: "Shipping method updated" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update shipping method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update shipping method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const deleteShippingMethod = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${SETTINGS_URL}/shipping-methods/${id}`, { headers });
      setSettings(response.data);
      toast({ title: "Shipping method deleted" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete shipping method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to delete shipping method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const createPaymentMethod = async (payload: PaymentMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${SETTINGS_URL}/payment-methods`, payload, { headers });
      setSettings(response.data);
      toast({ title: "Payment method created" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create payment method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to create payment method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentMethod = async (id: string, payload: PaymentMethodPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${SETTINGS_URL}/payment-methods/${id}`, payload, { headers });
      setSettings(response.data);
      toast({ title: "Payment method updated" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update payment method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update payment method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updateActivePaymentMethods = async (activeCodes: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${SETTINGS_URL}/payment-methods/active`, { activeCodes }, { headers });
      setSettings(response.data);
      toast({ title: "Payment methods updated" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update payment methods.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update payment methods.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${SETTINGS_URL}/payment-methods/${id}`, { headers });
      setSettings(response.data);
      toast({ title: "Payment method deleted" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete payment method.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to delete payment method.", description: message });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchSettings,
    saveSettings,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
    createPaymentMethod,
    updatePaymentMethod,
    updateActivePaymentMethods,
    deletePaymentMethod,
  };
}
