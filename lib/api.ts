import axios from "axios"
import { getAuthTokens } from "../store/auth"

// Create axios instance with base URL
const API_URL = "http://192.168.137.58:5000/api/v1"

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

//  request interceptor to add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const tokens = await getAuthTokens()
        if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`
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

                const response = await axios.get(`${API_URL}/user/refresh/${tokens.refreshToken}`)

                const { accessToken, } = response.data

                // Update tokens in storage
                await import("../store/auth").then(({ updateTokens }) => {
                    updateTokens({ accessToken, refreshToken: tokens.refreshToken })
                })

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                // If refresh token fails, logout user
                await import("../store/auth").then(({ logout }) => {
                    //   logout()
                    console.log("Refresh token failed")
                })
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    },
)

export default api
