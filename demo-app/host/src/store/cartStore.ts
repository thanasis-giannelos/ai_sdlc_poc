import { create } from 'zustand';

interface CartCountStore {
  count: number;
  setCount: (count: number) => void;
  increment: () => void;
  decrement: () => void;
}

// Shared cart-count store owned by the host shell.
// The cart remote reads item count from its own Zustand store (useCartStore).
// In a production setup, the cart remote would import this store via a federated
// module and call setCount/increment/decrement to keep the NavBar badge in sync.
export const useCartCountStore = create<CartCountStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
}));
