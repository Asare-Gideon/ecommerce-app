"use client"

import { isJwtExpired, useAuthStore } from "@/store/auth"
import { router } from "expo-router"
import { useEffect } from "react"

export function useAuth() {
    const { user, tokens, firstVisit, hasHydrated, isAuthenticated, isLoading, error, setFirstVisit, login, register, logout, refreshUser, setUser, clearError, requestVerificationCode, resetPassword, verifyCode } =
        useAuthStore()

    useEffect(() => {
        if (!hasHydrated) return

        if (tokens?.refreshToken && isJwtExpired(tokens.refreshToken)) {
            logout()
            return
        }

        if (tokens && !user) {
            refreshUser()
        }
    }, [hasHydrated, tokens, user])

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
        hasHydrated,
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
