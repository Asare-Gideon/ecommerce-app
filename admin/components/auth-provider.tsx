"use client";

import { use, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import MainLoader from "./MainLoader";
import { useAuth } from "@/hooks/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, setLoading } = useAuthStore();
  const { getUser } = useAuth();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (user && token) {
          await getUser(token as any, user.id);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setLoading, user, token]);

  if (isLoading) {
    return <MainLoader />;
  }

  return <>{children}</>;
}
