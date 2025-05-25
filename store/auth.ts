// stores/useAuthStore.ts
import api from "@/lib/api"
import type {
    AuthState,
    AuthTokens,
    LoginCredentials,
    RegisterData,
    ResetPasswordCredentials,
    User,
} from "@/types/user"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type AuthStore = AuthState & {
    login: (credentials: LoginCredentials) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    setUser: (user: User) => void
    resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>
    requestVerificationCode: (phoneNumber: string) => Promise<void>
    verifyCode: (code: string) => Promise<void>
    clearError: () => void
    firstVisit: boolean,
    setFirstVisit: (firstVisit: boolean) => void;
}

// Helper function to get tokens from AsyncStorage directly
export const getAuthTokens = async (): Promise<AuthTokens | null> => {
    try {
        const authStateJSON = await AsyncStorage.getItem("auth-storage")
        if (authStateJSON) {
            const authState = JSON.parse(authStateJSON)
            return authState.state.tokens
        }
        return null
    } catch (error) {
        console.error("Failed to get auth tokens:", error)
        return null
    }
}

// Helper function to update tokens in AsyncStorage directly
export const updateTokens = async (tokens: AuthTokens): Promise<void> => {
    try {
        const authStateJSON = await AsyncStorage.getItem("auth-storage")
        if (authStateJSON) {
            const authState = JSON.parse(authStateJSON)
            authState.state.tokens = tokens
            await AsyncStorage.setItem("auth-storage", JSON.stringify(authState))
        }
    } catch (error) {
        console.error("Failed to update auth tokens:", error)
    }
}

export const useAuthStore = create<AuthStore>()(
    persist<AuthStore>(
        (set, get) => ({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            firstVisit: true,
            setFirstVisit: (firstVisit: boolean) => set({ firstVisit }),
            login: async (credentials: LoginCredentials) => {
                try {
                    set({ isLoading: true, error: null })
                    const response = await api.post("/user/login", credentials)
                    const { user, token, refreshToken } = response.data

                    console.log("user", user)
                    console.log("token", token)
                    console.log("refreshToken", refreshToken)
                    set({
                        user,
                        tokens: { accessToken: token, refreshToken },
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to login. Please try again.",
                    })
                    throw error
                }
            },

            register: async (data: RegisterData) => {
                try {
                    set({ isLoading: true, error: null })
                    const response = await api.post("/user/register", data)
                    const result = response.data
                    set({
                        isLoading: false,
                    })

                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to register. Please try again.",
                    })
                    throw error
                }
            },

            logout: async () => {
                try {
                    set({ isLoading: true })
                    // const tokens = get().tokens
                    // if (tokens) {
                    //     await api.post("/auth/logout", { refreshToken: tokens.refreshToken })
                    // }

                    set({
                        user: null,
                        tokens: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    })
                } catch {
                    set({
                        user: null,
                        tokens: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    })
                }
            },
            requestVerificationCode: async (phoneNumber: string) => {
                try {
                    set({ isLoading: true, error: null })
                    const response = await api.post("/user/forgotpassword", { phone: phoneNumber })
                    const result = response.data
                    set({
                        isLoading: false,
                    })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to request verification code. Please try again.",
                    })
                    throw error
                }
            },
            resetPassword: async (credentials: ResetPasswordCredentials) => {
                try {
                    set({ isLoading: true, error: null })
                    const response = await api.post("/user/reset-password", credentials)
                    const result = response.data
                    set({
                        isLoading: false,
                    })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to reset password. Please try again.",
                    })
                    throw error
                }
            },
            verifyCode: async (code: string) => {
                try {
                    set({ isLoading: true, error: null })
                    const response = await api.post("/user/verify-reset-code", { resetToken: code })
                    const result = response.data
                    set({
                        isLoading: false,
                    })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to verify code. Please try again.",
                    })
                    throw error
                }
            },

            refreshUser: async () => {
                try {
                    set({ isLoading: true, error: null })
                    if (!get().tokens) {
                        set({ isLoading: false })
                        return
                    }

                    const response = await api.get("/auth/me")
                    const user = response.data
                    set({ user, isLoading: false })
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.message || "Failed to refresh user data.",
                    })
                    if (error.response?.status === 401) {
                        get().logout()
                    }
                }
            },

            setUser: (user: User) => {
                set({ user })
            },

            clearError: () => {
                set({ error: null })
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
)

// Export individual actions
export const {
    login,
    register,
    logout,
    verifyCode,
    requestVerificationCode,
    resetPassword,
    refreshUser,
    setUser,
    clearError,
} = useAuthStore.getState()

