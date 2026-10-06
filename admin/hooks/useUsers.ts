import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import axios, { AxiosError } from "axios";
import { toast } from "./use-toast";
import { UserType, useUsersStore } from "@/store/usersStore";

const route_urls = {
    query: `${BASE_URL}/user/get-all`,
    add: `${BASE_URL}/user/create`,
    getOne: `${BASE_URL}/user/get-one`,
    queryAnalytics: `${BASE_URL}/user/get-totals`,
    update: `${BASE_URL}/user/update`,
    blockUser: `${BASE_URL}/user/block-user`,
    unblockUser: `${BASE_URL}/user/unblock-user`,
};



export function useUsers() {
    const {
        setLoading,
        setError,
        setUsers,
        addUserToState,
        removeUserFromState,
        setUsersTotal,
        setAnalytics
    } = useUsersStore();
    const { token } = useAuthStore();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(route_urls.query, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
            setUsersTotal(response.data.totalUsers);
        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to fetch users.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(route_urls.queryAnalytics, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setAnalytics(response.data);
        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to fetch users analytics.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to fetch users analytics.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersQuery = async (url: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.users);
            setUsersTotal(response.data.totalUsers);
        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to fetch users.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    const getOneUser = async (id: string) => {
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
                title: "Failed to fetch user.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to fetch user.");
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: string, updates: Partial<UserType>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                `${route_urls.update}/${id}`,
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
                title: "user updated successfully",
            });

            return response.data;

        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to update user.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    const blockeUser = async (id: string,) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                `${route_urls.blockUser}/${id}`,
                {},
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
                title: "user blocked successfully",
            });

            return response.data;

        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to update user.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to update user.");
        } finally {
            setLoading(false);
        }
    };
    const unblockUser = async (id: string,) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                `${route_urls.unblockUser}/${id}`,
                {},
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
                title: "user unblocked successfully",
            });

            return response.data;

        } catch (err) {
            const axiosError = err as any;
            toast({
                duration: 4000,
                variant: "destructive",
                title: "Failed to update user.",
                description:
                    axiosError.response?.data.message ||
                    "Something went wrong please try again later",
            });
            setError(axiosError.response?.data || "Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    return {
        fetchUsers,
        fetchUsersQuery,
        getOneUser,
        fetchUsersAnalytics,
        updateUser,
        unblockUser,
        blockeUser,
    };
}
