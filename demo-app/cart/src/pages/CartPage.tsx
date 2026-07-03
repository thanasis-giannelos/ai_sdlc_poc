import React, { useEffect } from 'react';
import '../index.css';
import {
  CartLineItem,
  CartSummary,
  CheckoutButton,
  EmptyCartMessage,
  useCartStore,
  selectTotals,
} from '../features/cart';
import type { CartItem } from '../features/cart';
import { Footer } from '../shared/components/Footer';
import type { Product } from '../features/cart/types';

export const CartPage: React.FC = () => {
  const { items, addItem, removeItem, updateQuantity, syncFromStorage } = useCartStore();

  // On every mount, re-read localStorage so items added via the catalog's cart:add
  // event (written directly by NavBar) are reflected without needing a hard refresh.
  // syncFromStorage also dispatches cart:updated to keep the badge accurate.
  useEffect(() => {
    syncFromStorage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for add-to-cart events dispatched by the catalog remote
  useEffect(() => {
    const handler = (e: Event) => {
      const product = (e as CustomEvent<Product>).detail;
      addItem(product);
    };
    window.addEventListener('cart:add', handler);
    return () => window.removeEventListener('cart:add', handler);
  }, [addItem]);
  const totals = selectTotals(items);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <EmptyCartMessage />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Line items */}
            <section className="flex-1" aria-label="Cart items">
              <ul className="bg-white rounded-lg shadow-card divide-y divide-neutral-200 px-4">
                {items.map((item) => (
                  <CartLineItem
                    key={item.product.id}
                    item={item}
                    onRemove={removeItem}
                    onQtyChange={updateQuantity}
                  />
                ))}
              </ul>

              <button
                type="button"
                onClick={() => window.history.back()}
                className="mt-4 text-sm text-primary hover:text-primary-hover transition-colors"
              >
                ← Continue Shopping
              </button>
            </section>

            {/* Order summary */}
            <aside className="w-full lg:w-80 flex flex-col gap-4" aria-label="Order summary">
              <CartSummary totals={totals} />
              <CheckoutButton />
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
