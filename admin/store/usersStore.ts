import { create } from "zustand";

type addresType = {
    _id: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    latitude: string | null;
    longitude: string | null;
    phoneNumber: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    carts: any[];
    isBlock: boolean;
    addresses: addresType[];
    wishlist: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    refreshToken: string;
    loginAt: string;
    totalOrders: number;
    totalSpent: number;
}

interface AnalyticsType {
    totalUsers: number,
    activeUsers: number,
    inactiveUsers: number,
    newUsers: number
}


interface UsersState {
    users: UserType[];
    analytics: AnalyticsType | null;
    setAnalytics: (analytics: AnalyticsType) => void;
    usersTotal: number;
    setUsersTotal: (usersTotal: number) => void;
    isLoading: boolean;
    error: any | null;
    setLoading: (isLoading: boolean) => void;
    setError: (error: any | null) => void;
    setUsers: (users: UserType[]) => void;
    addUserToState: (user: UserType) => void;
    removeUserFromState: (id: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
    users: [],
    usersTotal: 0,
    analytics: null,
    isLoading: false,
    error: null,
    setUsersTotal: (usersTotal) => set({ usersTotal }),
    setAnalytics: (analytics) => set({ analytics }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setUsers: (users) => set({ users }),
    addUserToState: (user) =>
        set((state) => ({ users: [...state.users, user] })),
    removeUserFromState: (id) =>
        set((state) => ({
            users: state.users.filter((user) => user._id !== id),
        })),
}));