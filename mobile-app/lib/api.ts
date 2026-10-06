import axios from "axios"
import { getAuthTokens, isJwtExpired } from "../store/auth"

const DEFAULT_API_URL = "https://shop-api.54-90-159-53.sslip.io/api/v1" as const

const getApiUrl = () => {
    return process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
}

// Create axios instance with base URL
export const API_URL = getApiUrl()

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

const clearExpiredSession = async () => {
    const { useAuthStore } = await import("../store/auth")
    await useAuthStore.getState().logout()
}

const refreshAccessToken = async (refreshToken: string) => {
    const response = await axios.get(`${API_URL}/user/refresh/${refreshToken}`)
    const { accessToken } = response.data

    if (!accessToken) {
        throw new Error("Refresh endpoint did not return an access token")
    }

    const { updateTokens } = await import("../store/auth")
    await updateTokens({ accessToken, refreshToken })

    return accessToken
}

//  request interceptor to add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const tokens = await getAuthTokens()
        if (!tokens?.accessToken) {
            return config
        }

        if (isJwtExpired(tokens.refreshToken)) {
            await clearExpiredSession()
            return config
        }

        let accessToken = tokens.accessToken
        if (isJwtExpired(accessToken)) {
            try {
                accessToken = await refreshAccessToken(tokens.refreshToken)
            } catch (error) {
                await clearExpiredSession()
                return config
            }
        }

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

//  response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const tokens = await getAuthTokens()
                if (!tokens?.refreshToken) {
                    throw new Error("No refresh token available")
                }

                if (isJwtExpired(tokens.refreshToken)) {
                    throw new Error("Refresh token expired")
                }

                const accessToken = await refreshAccessToken(tokens.refreshToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                await clearExpiredSession()
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)

export default api
