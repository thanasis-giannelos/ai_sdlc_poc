import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartLineItem } from './CartLineItem';
import type { CartItem } from '../types';

const ITEM: CartItem = {
  product: {
    id: '1',
    title: 'Wireless Headphones',
    price: 79.99,
    imageUrl: 'https://placehold.co/80x80',
    inStock: true,
    category: 'Electronics',
  },
  quantity: 2,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CartLineItem', () => {
  it('renders product title, price, and line total', () => {
    render(<CartLineItem item={ITEM} onRemove={vi.fn()} onQtyChange={vi.fn()} />, { wrapper });
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
    expect(screen.getByText('$159.98')).toBeInTheDocument();
  });

  it('renders the current quantity', () => {
    render(<CartLineItem item={ITEM} onRemove={vi.fn()} onQtyChange={vi.fn()} />, { wrapper });
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onQtyChange with quantity + 1 when + is clicked', async () => {
    const onQtyChange = vi.fn();
    const user = userEvent.setup();
    render(<CartLineItem item={ITEM} onRemove={vi.fn()} onQtyChange={onQtyChange} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onQtyChange).toHaveBeenCalledWith('1', 3);
  });

  it('calls onQtyChange with quantity - 1 when − is clicked', async () => {
    const onQtyChange = vi.fn();
    const user = userEvent.setup();
    render(<CartLineItem item={ITEM} onRemove={vi.fn()} onQtyChange={onQtyChange} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(onQtyChange).toHaveBeenCalledWith('1', 1);
  });

  it('disables the decrease button when quantity is 1', () => {
    render(
      <CartLineItem item={{ ...ITEM, quantity: 1 }} onRemove={vi.fn()} onQtyChange={vi.fn()} />,
      { wrapper },
    );
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDisabled();
  });

  it('calls onRemove with the product id when Remove is clicked', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<CartLineItem item={ITEM} onRemove={onRemove} onQtyChange={vi.fn()} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /remove wireless headphones/i }));
    expect(onRemove).toHaveBeenCalledWith('1');
  });
});
