"use client";

import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { BASE_URL } from "@/utils/constants";
import { useState } from "react";
import { toast } from "./use-toast";

interface LoginCredentials {
  email: string;
  password: string;
}
interface getUserCredentials {
  token: string;
  userId: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

export function useAuth() {
  const {
    login,
    logout,
    isAuthenticated,
    setToken,
    user,
    isLoading: globalLoading,
    setLoading,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setLoading(true);
    try {
      const { data, error } = await apiClient<LoginResponse>("/user/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (error) {
        toast({
          duration: 4000,
          variant: "destructive",
          title: "Failed to login",
          description: error,
        });
        // throw new Error(error);
      }

      if (data) {
        login(data.token, data.user);
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/user/logout`, {
        method: "GET",
        credentials: "include",
      });
      logout();
    } catch (err) {
      toast({
        duration: 4000,
        variant: "destructive",
        title: "Failed to logout",
        description: "Something went wrong please try again later",
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };
  const getUser = async (token: string, userId: string) => {
    setIsLoading(true);
    setLoading(true);
    try {
      if (!token && userId) {
        logout();
      }
      const response = await fetch(`${BASE_URL}/user/get-one/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await response.json();
      // console.log(userData);
      if (
        userData.message == "JsonWebTokenError: jwt malformed" ||
        userData.message == "TokenExpiredError: jwt expired"
      ) {
        const refreshResponse = await fetch(`${BASE_URL}/user/refresh`, {
          method: "GET",
          credentials: "include",
        });
        if (!refreshResponse.ok) {
          toast({
            duration: 4000,
            variant: "destructive",
            title: "User Session expired",
            description: "Login Again to continue",
          });
          logout();
        }
        let { accessToken } = await refreshResponse.json();
        setToken(accessToken);
      }
    } catch (err) {
      toast({
        duration: 4000,
        variant: "destructive",
        title: "failed to get User",
        description: "Something went wrong please try again later",
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return {
    loginUser,
    logoutUser,
    isAuthenticated,
    user,
    getUser,
    isLoading: isLoading || globalLoading,
  };
}
