import { Banner, useBannerStore } from "@/store/bannerStore";
import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import axios from "axios";
import { toast } from "./use-toast";

const BANNER_URL = `${BASE_URL}/banner`;

export type BannerPayload = Pick<
  Banner,
  "placement" | "title" | "subtitle" | "buttonText" | "link" | "image" | "isActive" | "sortOrder"
>;

interface ApiErrorData {
  message?: string;
}

const getErrorData = (error: unknown) =>
  axios.isAxiosError<ApiErrorData>(error) ? error.response?.data : undefined;

const getErrorMessage = (error: unknown, fallback: string) =>
  getErrorData(error)?.message || fallback;

export function useBanner() {
  const { token } = useAuthStore();
  const {
    setBanners,
    addBannerToState,
    updateBannerInState,
    removeBannerFromState,
    setLoading,
    setError,
  } = useBannerStore();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BANNER_URL}/get-all?includeInactive=true`);
      setBanners(response.data);
      return response.data as Banner[];
    } catch (error) {
      const message = getErrorMessage(error, "Failed to fetch banners.");
      setError(getErrorData(error) || message);
      toast({ variant: "destructive", title: "Failed to fetch banners.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (payload: BannerPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BANNER_URL}/create`, payload, { headers });
      addBannerToState(response.data);
      toast({ title: "Banner created" });
      return response.data as Banner;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create banner.");
      setError(getErrorData(error) || message);
      toast({ variant: "destructive", title: "Failed to create banner.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const updateBanner = async (id: string, payload: BannerPayload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BANNER_URL}/update/${id}`, payload, { headers });
      updateBannerInState(id, response.data);
      toast({ title: "Banner updated" });
      return response.data as Banner;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update banner.");
      setError(getErrorData(error) || message);
      toast({ variant: "destructive", title: "Failed to update banner.", description: message });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BANNER_URL}/delete/${id}`, { headers });
      removeBannerFromState(id);
      toast({ title: "Banner deleted" });
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete banner.");
      setError(getErrorData(error) || message);
      toast({ variant: "destructive", title: "Failed to delete banner.", description: message });
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
  };
}
