import { create } from "zustand";

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  parent?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  categories: BlogCategory[];
  tags: string[];
  thumbnail: string;
  views: number;
  likes: string[];
  comments: unknown[];
  isPublished: boolean;
  showOnHome?: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogStats {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
}

interface BlogState {
  blogs: Blog[];
  categories: BlogCategory[];
  stats: BlogStats | null;
  isLoading: boolean;
  error: unknown | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: unknown | null) => void;
  setBlogs: (blogs: Blog[]) => void;
  setCategories: (categories: BlogCategory[]) => void;
  setStats: (stats: BlogStats) => void;
  addBlogToState: (blog: Blog) => void;
  updateBlogInState: (id: string, blog: Blog) => void;
  removeBlogFromState: (id: string) => void;
  addCategoryToState: (category: BlogCategory) => void;
  updateCategoryInState: (id: string, category: BlogCategory) => void;
  removeCategoryFromState: (id: string) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  blogs: [],
  categories: [],
  stats: null,
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setBlogs: (blogs) => set({ blogs }),
  setCategories: (categories) => set({ categories }),
  setStats: (stats) => set({ stats }),
  addBlogToState: (blog) => set((state) => ({ blogs: [blog, ...state.blogs] })),
  updateBlogInState: (id, blog) =>
    set((state) => ({
      blogs: state.blogs.map((item) => (item._id === id ? blog : item)),
    })),
  removeBlogFromState: (id) =>
    set((state) => ({ blogs: state.blogs.filter((blog) => blog._id !== id) })),
  addCategoryToState: (category) =>
    set((state) => ({ categories: [category, ...state.categories] })),
  updateCategoryInState: (id, category) =>
    set((state) => ({
      categories: state.categories.map((item) => (item._id === id ? category : item)),
    })),
  removeCategoryFromState: (id) =>
    set((state) => ({
      categories: state.categories.filter((category) => category._id !== id),
    })),
}));
