import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CartPage } from './CartPage';
import { useCartStore } from '../features/cart';

vi.mock('../features/cart', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../features/cart')>();
  return { ...actual, useCartStore: vi.fn() };
});

const mockUseCartStore = vi.mocked(useCartStore);

const ITEMS = [
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
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CartPage', () => {
  const removeItem = vi.fn();
  const updateQuantity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty cart', () => {
    beforeEach(() => {
      mockUseCartStore.mockReturnValue({ items: [], removeItem, updateQuantity });
    });

    it('renders the empty cart message', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    it('does not render the Order Summary', () => {
      render(<CartPage />, { wrapper });
      expect(screen.queryByRole('heading', { name: /order summary/i })).not.toBeInTheDocument();
    });
  });

  describe('cart with items', () => {
    beforeEach(() => {
      mockUseCartStore.mockReturnValue({ items: ITEMS, removeItem, updateQuantity });
    });

    it('renders the Shopping Cart heading', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
    });

    it('renders the product title', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    });

    it('renders the Order Summary section', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
    });

    it('renders the Proceed to Checkout button', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
    });

    it('renders the footer', () => {
      render(<CartPage />, { wrapper });
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('calls removeItem when Remove is clicked', async () => {
      const user = userEvent.setup();
      render(<CartPage />, { wrapper });
      await user.click(screen.getByRole('button', { name: /remove wireless headphones/i }));
      expect(removeItem).toHaveBeenCalledWith('1');
    });
  });
});
