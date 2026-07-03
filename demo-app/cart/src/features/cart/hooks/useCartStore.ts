import { create } from 'zustand';
import type { CartItem, Product } from '../types';

const CART_STORAGE_KEY = 'ministore:cart';

const dispatchCartUpdate = (count: number) =>
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));

const persist = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable
  }
};

const getInitialItems = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as CartItem[];
  } catch {
    // invalid JSON or storage unavailable
  }
  return MOCK_ITEMS;
};

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Mock initial cart state for POC — replaced by real API/persistence post-POC
const MOCK_ITEMS: CartItem[] = [
  {
    product: {
      id: '1',
      title: 'Wireless Headphones',
      price: 79.99,
      imageUrl: 'https://placehold.co/80x80',
      inStock: true,
      category: 'Electronics',
    },
    quantity: 1,
  },
  {
    product: {
      id: '2',
      title: 'Mechanical Keyboard',
      price: 129.99,
      imageUrl: 'https://placehold.co/80x80',
      inStock: true,
      category: 'Electronics',
    },
    quantity: 2,
  },
];

export const useCartStore = create<CartStore>((set) => ({
  items: getInitialItems(),
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      const items = existing
        ? state.items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...state.items, { product, quantity }];
      persist(items);
      dispatchCartUpdate(items.reduce((s, i) => s + i.quantity, 0));
      return { items };
    }),
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.product.id !== productId);
      persist(items);
      dispatchCartUpdate(items.reduce((s, i) => s + i.quantity, 0));
      return { items };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const items =
        quantity <= 0
          ? state.items.filter((i) => i.product.id !== productId)
          : state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            );
      persist(items);
      dispatchCartUpdate(items.reduce((s, i) => s + i.quantity, 0));
      return { items };
    }),
  clearCart: () => {
    persist([]);
    dispatchCartUpdate(0);
    set({ items: [] });
  },
}));

export const selectTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.1).toFixed(2));
  const shipping = subtotal > 50 ? 0 : 5.99;
  return { subtotal, tax, shipping, total: parseFloat((subtotal + tax + shipping).toFixed(2)) };
};
