import { create } from 'zustand';
import type { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
  items: MOCK_ITEMS,
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.product.id !== productId)
          : state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity } : i,
            ),
    })),
}));

export const selectTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.1).toFixed(2));
  const shipping = subtotal > 50 ? 0 : 5.99;
  return { subtotal, tax, shipping, total: parseFloat((subtotal + tax + shipping).toFixed(2)) };
};
