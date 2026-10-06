import { create } from "zustand";

export interface Product {
  isPublished: boolean;
  _id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  quantity: number;
  effectivePrice?: number;
  hasDiscount?: boolean;
  images: {
    name: string;
    url: string;
  }[];
  colors: string[];
  sizes: string[];
  variants: {
    size: string;
    color: string;
    quantity: number;
  }[];
  discount: {
    type: "percentage" | "fixed";
    value: number;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive: boolean;
  };
  ratings: [];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  sold: number;
  averageRating: number;
  brand: string;
  id: string;
}
interface productStats {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
}
export interface ProductTotals {
  totalProducts: number;
  totalQuantities: number;
  lowStockProducts: number;
  highStockProducts: number;
  outOfStockProducts: number;
  bestSellingProducts: {
    title: string;
    sold: number;
  }[];
}

interface ProductState {
  products: Product[];
  productStats: productStats | null;
  productTotals: ProductTotals | null;
  isLoading: boolean;
  error: any | null;
  setLoading: (isLoading: boolean) => void;
  setError: (error: any | null) => void;
  setProductStats: (stats: productStats) => void;
  setProductTotals: (stats: ProductTotals) => void;
  setProducts: (products: Product[]) => void;
  addProductToState: (product: Product) => void;
  updateProductInState: (id: string, updatedProduct: Product) => void;
  removeProductFromState: (id: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  error: null,
  productStats: null,
  productTotals: null,
  setProductTotals: (totals) => set({ productTotals: totals }),
  setProductStats: (stats) => set({ productStats: stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setProducts: (products) => set({ products }),
  addProductToState: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProductInState: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((product) =>
        product._id === id ? updatedProduct : product
      ),
    })),
  removeProductFromState: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),
}));
