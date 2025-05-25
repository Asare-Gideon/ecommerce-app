"use client"

import { useAuthStore } from "@/store/auth"
import { router } from "expo-router"
import { useEffect } from "react"

export function useAuth() {
    const { user, tokens, firstVisit, isAuthenticated, isLoading, error, setFirstVisit, login, register, logout, refreshUser, setUser, clearError, requestVerificationCode, resetPassword, verifyCode } =
        useAuthStore()

    useEffect(() => {
        if (tokens && !user) {
            refreshUser()
        }
    }, [tokens, user])

    const requireAuth = () => {
        if (!isLoading && !isAuthenticated) {
            // router.replace("/auth/login" as any)
            return false
        }
        return true
    }

    const redirectIfAuthenticated = () => {
        if (!isLoading && !firstVisit) {
            router.replace("/(tabs)")
            return true
        }
        router.replace("/onboarding/" as any)
        return false
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        firstVisit,
        setFirstVisit,
        login,
        register,
        logout,
        refreshUser,
        setUser,
        clearError,
        requireAuth,
        redirectIfAuthenticated,
        requestVerificationCode,
        resetPassword,
        verifyCode
    }
}
