import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { toast } from "./use-toast";
import { SalesType, useSalesStore } from "@/store/salesStore";

const route_urls = {
  query: `${BASE_URL}/sales/get-all`,
  add: `${BASE_URL}/sales/create`,
  getOne: `${BASE_URL}/sales/get-one`,
  update: `${BASE_URL}/sales/status/update`,
  conversionMatrices: `${BASE_URL}/sales/conversion-metrics`,
  salesPerformance: `${BASE_URL}/sales/sales-performance`,
  downloadReport: `${BASE_URL}/sales/download-report`,
  yearlyMonthlyStats: `${BASE_URL}/sales/yearly-monthly-stats`,
};

type PaymentMethods = Record<string, number>;

interface MonthStats {
  month: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  totalProducts: number;
  uniqueCustomers: number;
  paymentMethods: PaymentMethods;
  monthName: string;
}

interface YearlySummary {
  totalRevenue: number;
  totalOrders: number;
  averageMonthlyRevenue: number;
  bestPerformingMonth: string;
}

export interface YearlyMonthlyStats {
  year: number;
  months: MonthStats[];
  summary: YearlySummary;
}

interface ProductImage {
  name: string;
  url: string;
  _id: string;
}

interface ProductPerformance {
  totalQuantitySold: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
  productName: string;
  productId: string;
  images: ProductImage[];
}

export interface SalesPerformance {
  timeframe: string;
  performance: ProductPerformance[];
}

type orderTotals = {
  canceled: undefined | string;
  pending: undefined | string;
  completed: undefined | string;
  processing: undefined | number;
  totalOrders: number;
};

export function useSales() {
  const {
    setLoading,
    setError,
    addSaleToState,
    removeSaleFromState,
    setSales
  } = useSalesStore();
  const { token } = useAuthStore();

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(route_urls.query, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSales(response.data);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch orders.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesQuery = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSales(response.data);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch orders.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const getOneSale = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.getOne}/${id}`);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch order.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch order.");
    } finally {
      setLoading(false);
    }
  };

 const getConversionMetrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.conversionMatrices}`);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to get conversion metrics.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to get conversion metrics.");
    } finally {
      setLoading(false);
    }
  };

const getSalesPerformance = async (): Promise<SalesPerformance | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.salesPerformance}`);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to get sales performance.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to get sales performance.");
      return null;
    } finally {
      setLoading(false);
    }
  };

const generateSalesReport = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to download report.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to download report.");
    } finally {
      setLoading(false);
    }
  };

const yearlyMonthlyStats = async (): Promise<YearlyMonthlyStats | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.yearlyMonthlyStats}`);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to get yearly monthly stats.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to get yearly monthly stats.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
 fetchSales,
 fetchSalesQuery,
 getOneSale,
 getConversionMetrices,
 getSalesPerformance,
generateSalesReport,
 yearlyMonthlyStats,
  };
}
