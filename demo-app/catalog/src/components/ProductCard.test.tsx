import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';

const mockProduct: Product = {
  id: '1',
  title: 'Test Product',
  price: 29.99,
  imageUrl: 'https://example.com/img.jpg',
  inStock: true,
  category: 'clothing',
};

describe('ProductCard', () => {
  it('renders product title and price', () => {
    render(<ProductCard product={mockProduct} onAddToCart={vi.fn()} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when Add to Cart is clicked', async () => {
    const onAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('disables the button when out of stock', () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} onAddToCart={vi.fn()} />);
    expect(screen.getByRole('button', { name: /unavailable/i })).toBeDisabled();
  });

  it('shows Out of Stock badge when product is unavailable', () => {
    render(<ProductCard product={{ ...mockProduct, inStock: false }} onAddToCart={vi.fn()} />);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });
});
