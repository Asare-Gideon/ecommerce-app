import { create } from "zustand";

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  icon: string;
  description: string;
  parent: string | null;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: any | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: any | null) => void;
  setCategories: (categories: Category[]) => void;
  addCategoryToState: (category: Category) => void;
  removeCategoryFromState: (id: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCategories: (categories) => set({ categories }),
  addCategoryToState: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  removeCategoryFromState: (id) =>
    set((state) => ({
      categories: state.categories.filter(
        (categories) => categories._id !== id
      ),
    })),
}));
