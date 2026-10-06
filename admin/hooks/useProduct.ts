import { useAuthStore } from "@/store/authStore";
import { Product, useProductStore } from "@/store/productStore";
import { BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { toast } from "./use-toast";

const Product_Urls = {
  query: `${BASE_URL}/product/query`,
  add: `${BASE_URL}/product/create`,
  update: `${BASE_URL}/product/update`,
  delete: `${BASE_URL}/product/delete`,
  totals: `${BASE_URL}/product/get-totals`,
  single: `${BASE_URL}/product/get-one`,
  pubishStatus: `${BASE_URL}/product/toggle-published`,
};

interface addProduct {
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: any[];
  colors: string[];
  sizes: string[];
  variants?: {
    size: string;
    color: string;
    quantity: number;
  }[];
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive: boolean;
  };
  status?: "published" | "draft";
  category: string;
  brand: string;
}

export function useProduct() {
  const {
    setLoading,
    setError,
    setProducts,
    addProductToState,
    updateProductInState,
    setProductStats,
    removeProductFromState,
    setProductTotals,
  } = useProductStore();
  const { token } = useAuthStore();

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(Product_Urls.query);
      setProducts(response.data.products);
      setProductStats(response.data.stats);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch products.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };
  const fetchProductsWithQuery = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(url);
      setProducts(response.data.products);
      setProductStats(response.data.stats);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch products.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const getSingleProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${Product_Urls.single}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data as Product;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch product.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to add.");
    } finally {
      setLoading(false);
    }
  };

  const getProductTotals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(Product_Urls.totals, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setProductTotals(response.data);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch product totals.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: addProduct) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(Product_Urls.add, product, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      addProductToState(response.data);
      toast({
        duration: 4000,
        variant: "default",
        title: "Product added successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to add product.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = async (
    productIds: string[],
    discount: NonNullable<addProduct["discount"]>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${BASE_URL}/product/apply-discount`,
        { productIds, discount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      response.data.products?.forEach((product: Product) => {
        updateProductInState(product._id, product);
      });
      toast({
        duration: 4000,
        variant: "default",
        title: "Discount applied successfully",
      });
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to apply discount.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to apply discount.");
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `${Product_Urls.update}/${id}`,
        updates,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      updateProductInState(id, response.data);
      toast({
        duration: 4000,
        variant: "default",
        title: "Product updated successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to update product.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${Product_Urls.pubishStatus}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      updateProductInState(id, response.data);
      toast({
        duration: 4000,
        variant: "default",
        title: "Product status updated successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to update product status.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to update product status.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${Product_Urls.delete}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      removeProductFromState(id);
    } catch (err) {
      const axiosError = err as any;
      setError(axiosError.response?.data || "Failed to delete product.");
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to delete product.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProductsWithQuery,
    getProductTotals,
    getSingleProduct,
    togglePublish,
    applyDiscount,
  };
}
