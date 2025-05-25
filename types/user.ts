export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role?: 'user' | 'admin' | string;
    carts: any[]; // You can define a CartItem[] interface if you have details
    isBlock: boolean;
    totalSpent: number;
    totalOrders: number;
    wishlist: string[];  // reference to Product document IDs
}
export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface LoginCredentials {
    phone: string
    password: string
}

export interface RegisterData {
    phone: string
    firstName: string
    lastName: string
    email?: string
    password: string
}

export interface AuthState {
    user: User | null
    tokens: AuthTokens | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

export interface ResetPasswordCredentials {
    password: string
    resetToken: string
}
