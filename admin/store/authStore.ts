import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BASE_URL } from "@/utils/constants";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  token?: string;
}

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   fetchUser: () => Promise<void>;
//   refreshAccessToken: () => Promise<void>;
// }

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setToken: (token: string) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setLoading: (loading) => set({ isLoading: loading }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : null,
        })),
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
      setToken: (token) => set({ token: token }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: null,
//       isAuthenticated: false,
//       isLoading: false,

//       login: async (email: string, password: string) => {
//         set({ isLoading: true });
//         try {
//           const response = await fetch(`${BASE_URL}/user/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//           });

//           if (!response.ok) {
//             const res = await response.json();
//             console.error("Login failed:", res.message);
//             set({ isLoading: false });
//             return;
//           }

//           const { token, firstName, lastName, phone, id } =
//             await response.json();
//           const user: User = { id, firstName, lastName, phone, email };

//           console.log(user);
//           // Save token in cookies
//           // Cookies.set("authToken", token, { secure: true, sameSite: "strict" });

//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             isLoading: false,
//           });
//         } catch (error) {
//           console.error("Login error:", error);
//           set({ isLoading: false });
//         }
//       },

//       logout: async () => {
//         set({ user: null, token: null, isAuthenticated: false });
//         // const { clearStorage } = useAuthStore.persist;
//         // clearStorage();
//         // try {
//         //   const response = await fetch(`${BASE_URL}/user/logout`, {
//         //     method: "GET",
//         //     headers: { "Content-Type": "application/json" },
//         //   });

//         //   let res = await response.json();
//         //   if (!response.ok) throw new Error(res.message);

//         //   set({ user: null, token: null, isAuthenticated: false });
//         //   // Cookies.remove("authToken");
//         // } catch (err) {
//         //   console.log(err);
//         //   throw new Error("couldn't logout");
//         // }
//       },

//       fetchUser: async () => {
//         const token = get().token; //Cookies.get("authToken");
//         if (!token) {
//           console.log("Token not found");
//           return;
//         }

//         set({ isLoading: true });
//         try {
//           const userId = get().user?.id;
//           if (!userId) throw new Error("User ID is missing");

//           const response = await fetch(`${BASE_URL}/user/get-one/${userId}`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });

//           if (!response.ok) {
//             throw new Error("Failed to fetch user");
//           }

//           const user = await response.json();
//           set({ user, isAuthenticated: true, token, isLoading: false });
//         } catch (error) {
//           console.error("Fetch user error:", error);
//           set({ isLoading: false });
//         }
//       },

//       refreshAccessToken: async () => {
//         try {
//           const response = await fetch(`${BASE_URL}/refresh`, {
//             method: "GET",
//             credentials: "include", // Include cookies
//           });

//           if (!response.ok) {
//             throw new Error("Failed to refresh token");
//           }

//           const { token } = await response.json();
//           set({ token });
//           // Cookies.set("authToken", token, { secure: true, sameSite: "strict" });
//         } catch (error) {
//           console.error("Token refresh error:", error);
//           set({ user: null, token: null, isAuthenticated: false });
//         }
//       },
//     }),
//     {
//       name: "auth-storage",
//       getStorage: () =>
//         typeof window !== "undefined" ? localStorage : undefined,
//     }
//   )
// );
