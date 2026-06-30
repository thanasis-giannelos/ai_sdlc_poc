import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductGrid } from './ProductGrid';
import type { Product } from '../types';

const makeProduct = (id: string): Product => ({
  id,
  title: `Product ${id}`,
  price: 10,
  imageUrl: '',
  inStock: true,
  category: 'test',
});

describe('ProductGrid', () => {
  it('renders a card for each product', () => {
    const products = [makeProduct('1'), makeProduct('2'), makeProduct('3')];
    render(<ProductGrid products={products} onAddToCart={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: /add to cart/i })).toHaveLength(3);
  });

  it('shows empty state when no products', () => {
    render(<ProductGrid products={[]} onAddToCart={vi.fn()} />);
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });
});
