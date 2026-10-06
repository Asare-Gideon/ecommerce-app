import { create } from "zustand";

export interface Banner {
  _id: string;
  name?: string;
  placement: "slider" | "promo";
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BannerState {
  banners: Banner[];
  isLoading: boolean;
  error: unknown | null;
  setBanners: (banners: Banner[]) => void;
  addBannerToState: (banner: Banner) => void;
  updateBannerInState: (id: string, banner: Banner) => void;
  removeBannerFromState: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: unknown | null) => void;
}

export const useBannerStore = create<BannerState>((set) => ({
  banners: [],
  isLoading: false,
  error: null,
  setBanners: (banners) => set({ banners }),
  addBannerToState: (banner) =>
    set((state) => ({ banners: [...state.banners, banner] })),
  updateBannerInState: (id, banner) =>
    set((state) => ({
      banners: state.banners.map((item) => (item._id === id ? banner : item)),
    })),
  removeBannerFromState: (id) =>
    set((state) => ({
      banners: state.banners.filter((item) => item._id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
