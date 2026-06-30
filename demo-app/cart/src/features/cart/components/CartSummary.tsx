import React from 'react';
import type { CartTotals } from '../types';

interface Props {
  totals: CartTotals;
}

export const CartSummary: React.FC<Props> = ({ totals }) => {
  const { subtotal, tax, shipping, total } = totals;

  return (
    <div className="bg-white rounded-lg shadow-panel p-6 flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>

      <dl className="flex flex-col gap-2">
        <div className="flex justify-between">
          <dt className="text-sm text-neutral-500">Subtotal</dt>
          <dd className="text-sm text-neutral-900">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-neutral-500">Tax (10%)</dt>
          <dd className="text-sm text-neutral-900">${tax.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm text-neutral-500">Shipping</dt>
          <dd className="text-sm text-neutral-900">
            {shipping === 0 ? (
              <span className="text-success font-medium">Free</span>
            ) : (
              `$${shipping.toFixed(2)}`
            )}
          </dd>
        </div>
      </dl>

      <div className="border-t border-neutral-200 pt-3 flex justify-between">
        <span className="text-base font-semibold text-neutral-900">Total</span>
        <span className="text-base font-bold text-neutral-900">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
