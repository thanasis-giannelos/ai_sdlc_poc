import React from 'react';
import type { CartItem } from '../types';

interface Props {
  item: CartItem;
  onRemove: (productId: string) => void;
  onQtyChange: (productId: string, quantity: number) => void;
}

export const CartLineItem: React.FC<Props> = ({ item, onRemove, onQtyChange }) => {
  const { product, quantity } = item;

  return (
    <li className="flex gap-4 py-4 border-b border-neutral-200 last:border-0">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-20 h-20 rounded-md object-cover bg-neutral-50 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 truncate">{product.title}</p>
        <p className="text-sm text-neutral-500 mt-0.5">${product.price.toFixed(2)}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${product.title}`}>
            <button
              type="button"
              onClick={() => onQtyChange(product.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 rounded-sm border border-neutral-200 flex items-center justify-center
                text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="text-sm font-medium text-neutral-900 w-6 text-center" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(product.id, quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-sm border border-neutral-200 flex items-center justify-center
                text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(product.id)}
            aria-label={`Remove ${product.title}`}
            className="text-sm text-danger hover:underline transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-neutral-900 flex-shrink-0">
        ${(product.price * quantity).toFixed(2)}
      </p>
    </li>
  );
};
