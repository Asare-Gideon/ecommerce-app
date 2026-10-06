import { useAuthStore } from "@/store/authStore";
import { Blog, BlogCategory, useBlogStore } from "@/store/blogStore";
import { BASE_URL } from "@/utils/constants";
import axios from "axios";
import { toast } from "./use-toast";

const BLOG_URLS = {
  query: `${BASE_URL}/blog/query`,
  add: `${BASE_URL}/blog/create`,
  update: `${BASE_URL}/blog/update`,
  delete: `${BASE_URL}/blog/delete`,
  publish: `${BASE_URL}/blog/publish`,
  single: `${BASE_URL}/blog/get-one`,
  categories: `${BASE_URL}/blog-category/get-all`,
  addCategory: `${BASE_URL}/blog-category/create`,
  updateCategory: `${BASE_URL}/blog-category/update`,
  deleteCategory: `${BASE_URL}/blog-category/delete`,
};

export interface BlogPayload {
  title: string;
  content: string;
  categories: string[];
  tags: string[];
  thumbnail?: string;
  status?: "published" | "draft";
  showOnHome?: boolean;
}

export interface BlogCategoryPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

const getErrorMessage = (error: any, fallback: string) =>
  error.response?.data?.message || fallback;

export function useBlog() {
  const {
    setLoading,
    setError,
    setBlogs,
    setStats,
    setCategories,
    addBlogToState,
    updateBlogInState,
    removeBlogFromState,
    addCategoryToState,
    updateCategoryInState,
    removeCategoryFromState,
  } = useBlogStore();
  const { token } = useAuthStore();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchBlogs = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BLOG_URLS.query}${query}`);
      setBlogs(response.data.blogs || []);
      setStats({
        success: response.data.success,
        total: response.data.total,
        page: response.data.page,
        totalPages: response.data.totalPages,
      });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch blogs.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to fetch blogs.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(BLOG_URLS.categories);
      setCategories(response.data || []);
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch blog categories.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to fetch categories.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const createBlog = async (blog: BlogPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(BLOG_URLS.add, blog, { headers: authHeaders });
      addBlogToState(response.data);
      toast({ title: "Blog created successfully" });
      return response.data as Blog;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create blog.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to create blog.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const getBlog = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BLOG_URLS.single}/${id}`);
      return response.data as Blog;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to fetch blog.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to fetch blog.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updateBlog = async (id: string, blog: Partial<BlogPayload>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BLOG_URLS.update}/${id}`, blog, { headers: authHeaders });
      updateBlogInState(id, response.data);
      toast({ title: "Blog updated successfully" });
      return response.data as Blog;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update blog.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update blog.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BLOG_URLS.publish}/${id}`, {}, { headers: authHeaders });
      updateBlogInState(id, response.data);
      toast({ title: "Blog status updated" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update blog status.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update status.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BLOG_URLS.delete}/${id}`, { headers: authHeaders });
      removeBlogFromState(id);
      toast({ title: "Blog deleted successfully" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete blog.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to delete blog.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const createBlogCategory = async (category: BlogCategoryPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(BLOG_URLS.addCategory, category, { headers: authHeaders });
      addCategoryToState(response.data);
      toast({ title: "Blog category created successfully" });
      return response.data as BlogCategory;
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to create blog category.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to create category.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updateBlogCategory = async (id: string, category: Partial<BlogCategoryPayload>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BLOG_URLS.updateCategory}/${id}`, category, { headers: authHeaders });
      updateCategoryInState(id, response.data);
      toast({ title: "Blog category updated successfully" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to update blog category.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to update category.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BLOG_URLS.deleteCategory}/${id}`, { headers: authHeaders });
      removeCategoryFromState(id);
      toast({ title: "Blog category deleted successfully" });
    } catch (error: any) {
      const message = getErrorMessage(error, "Failed to delete blog category.");
      setError(error.response?.data || message);
      toast({ variant: "destructive", title: "Failed to delete category.", description: message });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchBlogs,
    fetchBlogCategories,
    getBlog,
    createBlog,
    updateBlog,
    togglePublish,
    deleteBlog,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
  };
}
