import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';

interface CartItem {
    id: string;
    productId?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    selectedSize?: string;
    selectedColor?: string;
    maxStock?: number;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    updateItemQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    incrementItem: (id: string) => void;
    decrementItem: (id: string) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            totalItems: 0,
            totalPrice: 0,

            addItem: (item) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((i) => i.id === item.id);

                if (existingItem) {
                    if (item.maxStock !== undefined && existingItem.quantity >= item.maxStock) return;

                    set((state) => ({
                        items: state.items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                        totalItems: state.totalItems + 1,
                        totalPrice: state.totalPrice + item.price,
                    }));
                } else {
                    set((state) => ({
                        items: [...state.items, { ...item, quantity: 1 }],
                        totalItems: state.totalItems + 1,
                        totalPrice: state.totalPrice + item.price,
                    }));
                }
            },

            updateItemQuantity: (id, quantity) => {
                const item = get().items.find((i) => i.id === id);
                if (!item) return;

                const nextQuantity = Math.min(quantity, item.maxStock ?? quantity);
                const priceChange = (nextQuantity - item.quantity) * item.price;

                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: nextQuantity } : i
                    ),
                    totalItems: state.totalItems + (nextQuantity - item.quantity),
                    totalPrice: state.totalPrice + priceChange,
                }));
            },

            removeItem: (id) => {
                const item = get().items.find((i) => i.id === id);
                if (!item) return;

                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                    totalItems: state.totalItems - item.quantity,
                    totalPrice: state.totalPrice - (item.price * item.quantity),
                }));
            },

            clearCart: () => {
                set({
                    items: [],
                    totalItems: 0,
                    totalPrice: 0,
                });
            },

            incrementItem: (id) => {
                const item = get().items.find((i) => i.id === id);
                if (!item) return;
                if (item.maxStock !== undefined && item.quantity >= item.maxStock) return;

                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                    totalItems: state.totalItems + 1,
                    totalPrice: state.totalPrice + item.price,
                }));
            },

            decrementItem: (id) => {
                const item = get().items.find((i) => i.id === id);
                if (!item || item.quantity <= 1) return;

                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: i.quantity - 1 } : i
                    ),
                    totalItems: state.totalItems - 1,
                    totalPrice: state.totalPrice - item.price,
                }));
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
