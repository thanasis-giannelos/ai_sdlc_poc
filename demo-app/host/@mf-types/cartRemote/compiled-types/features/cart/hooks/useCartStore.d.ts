import type { CartItem } from '../types';
interface CartStore {
    items: CartItem[];
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
}
export declare const useCartStore: import("zustand").UseBoundStore<import("zustand").StoreApi<CartStore>>;
export declare const selectTotals: (items: CartItem[]) => {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
};
export {};
