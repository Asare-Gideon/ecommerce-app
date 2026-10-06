import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { toast } from "./use-toast";
import { Category, useCategoryStore } from "@/store/categoryStore";

const Product_Urls = {
  query: `${BASE_URL}/category/get-all`,
  add: `${BASE_URL}/category/create`,
  delete: `${BASE_URL}/category/delete`,
  getOne: `${BASE_URL}/category/get-one`,
  update: `${BASE_URL}/category/update`,
  toggleActive: `${BASE_URL}/category/toggle-active`,
};

interface addCategory {
  name: string;
}

export function useCategory() {
  const {
    setLoading,
    setError,
    setCategories,
    addCategoryToState,
    removeCategoryFromState,
  } = useCategoryStore();
  const { token } = useAuthStore();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(Product_Urls.query);
      setCategories(response.data);
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch category.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const getOneCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${Product_Urls.getOne}/${id}`);
      return response.data;
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to fetch category.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: addCategory) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(Product_Urls.add, category, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      addCategoryToState(response.data);
      toast({
        duration: 4000,
        variant: "default",
        title: "Category added successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to add Category.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to add Category.");
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
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
      toast({
        duration: 4000,
        variant: "default",
        title: "Category updated successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to update Category.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
      setError(axiosError.response?.data || "Failed to update Category.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${Product_Urls.delete}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      removeCategoryFromState(id);
      toast({
        duration: 4000,
        variant: "default",
        title: "Category deleted successfully",
      });
    } catch (err) {
      const axiosError = err as any;
      setError(axiosError.response?.data || "Failed to delete Category.");
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to delete category.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleAtive = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.get(`${Product_Urls.toggleActive}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        duration: 4000,
        variant: "default",
        title: "successfully changed status",
      });
      fetchCategories();
    } catch (err) {
      const axiosError = err as any;
      setError(axiosError.response?.data || "Failed to update status.");
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to update status.",
        description:
          axiosError.response?.data.message ||
          "Something went wrong please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchCategories,
    addCategory,
    deleteCategory,
    getOneCategory,
    updateCategory,
    toggleAtive,
  };
}
