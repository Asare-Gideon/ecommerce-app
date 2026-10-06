import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { toast } from "./use-toast";
import { OrderType, useOrderStore } from "@/store/orderStore";

const route_urls = {
  query: `${BASE_URL}/order/get-all`,
  add: `${BASE_URL}/order/create`,
  delete: `${BASE_URL}/order/delete`,
  getOne: `${BASE_URL}/order/get-one`,
  update: `${BASE_URL}/order/status/update`,
  totals: `${BASE_URL}/order/totals`,
  getUserOrders: `${BASE_URL}/order/get-by-user`,
};

// interface addCategory {
//   name: string;
// }

type orderTotals = {
  canceled: undefined | string;
  pending: undefined | string;
  completed: undefined | string;
  processing: undefined | number;
  totalOrders: number;
};

export function useOrder() {
  const {
    setLoading,
    setError,
    setOrders,
    removeOrderFromState,
    addOrderToState,
    setStatusesTotal,
  } = useOrderStore();
  const { token } = useAuthStore();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(route_urls.query, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders);
      let totalsStatuses = {
        ...response.data.statusTotals,
        currentPage: response.data.currentPage,
        totalOrders: response.data.totalOrders,
        totalPages: response.data.totalPages,
      };
      setStatusesTotal(totalsStatuses);
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

  const fetchOrderQuery = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data.orders);
      let totalsStatuses = {
        ...response.data.statusTotals,
        currentPage: response.data.currentPage,
        totalOrders: response.data.totalOrders,
        totalPages: response.data.totalPages,
      };
      setStatusesTotal(totalsStatuses);
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

  const fetchTotals = async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${route_urls.totals}?filter=${filter}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data as orderTotals;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch orders totals.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch orders totals.");
    } finally {
      setLoading(false);
    }
  };

  const getOneOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.getOne}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
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
  const getUserOrders = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${route_urls.getUserOrders}/${userId}`);
      return response.data;
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


  const addOrder = async (order: Partial<OrderType>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(route_urls.add, order, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      addOrderToState(response.data);
      toast({
        duration: 4000,
        variant: "default",
        title: "Order added successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to add order.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to add Order.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id: string, updates: Partial<OrderType>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${route_urls.update}/${id}`, updates, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        duration: 4000,
        variant: "default",
        title: "order updated successfully",
      });
      return "successfull";
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to update order.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to update order.");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${route_urls.delete}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      removeOrderFromState(id);
      toast({
        duration: 4000,
        variant: "default",
        title: "Order deleted successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      setError(axiosError.response?.data || "Failed to delete Order.");
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to delete Order.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchOrders,
    addOrder,
    deleteOrder,
    getOneOrder,
    updateOrder,
    fetchTotals,
    fetchOrderQuery,
    getUserOrders,
  };
}
