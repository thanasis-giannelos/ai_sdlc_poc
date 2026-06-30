import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { title, price, imageUrl, inStock } = product;

  return (
    <div
      role="article"
      aria-label={title}
      className={`
        group relative flex flex-col bg-white rounded-lg shadow-card overflow-hidden
        transition-shadow duration-200 hover:shadow-panel
        ${!inStock ? 'opacity-70' : ''}
      `}
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-50">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">{title}</h3>
        <p className="text-lg font-bold text-neutral-900">${price.toFixed(2)}</p>

        <button
          type="button"
          disabled={!inStock}
          onClick={() => onAddToCart(product)}
          className="
            mt-auto w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white
            transition-colors duration-150
            hover:bg-primary-hover
            disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500
          "
        >
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};
