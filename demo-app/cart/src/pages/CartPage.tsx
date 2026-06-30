import React from 'react';
import {
  CartLineItem,
  CartSummary,
  CheckoutButton,
  EmptyCartMessage,
  useCartStore,
  selectTotals,
} from '../features/cart';
import { Footer } from '../shared/components/Footer';

export const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity } = useCartStore();
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
