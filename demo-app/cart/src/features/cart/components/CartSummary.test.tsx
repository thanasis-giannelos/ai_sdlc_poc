import React from 'react';
import { render, screen } from '@testing-library/react';
import { CartSummary } from './CartSummary';
import type { CartTotals } from '../types';

const TOTALS_WITH_SHIPPING: CartTotals = {
  subtotal: 30.0,
  tax: 3.0,
  shipping: 5.99,
  total: 38.99,
};

const TOTALS_FREE_SHIPPING: CartTotals = {
  subtotal: 100.0,
  tax: 10.0,
  shipping: 0,
  total: 110.0,
};

describe('CartSummary', () => {
  it('renders the Order Summary heading', () => {
    render(<CartSummary totals={TOTALS_WITH_SHIPPING} />);
    expect(screen.getByRole('heading', { name: /order summary/i })).toBeInTheDocument();
  });

  it('displays subtotal correctly', () => {
    render(<CartSummary totals={TOTALS_WITH_SHIPPING} />);
    expect(screen.getByText('$30.00')).toBeInTheDocument();
  });

  it('displays tax correctly', () => {
    render(<CartSummary totals={TOTALS_WITH_SHIPPING} />);
    expect(screen.getByText('$3.00')).toBeInTheDocument();
  });

  it('displays shipping cost when shipping > 0', () => {
    render(<CartSummary totals={TOTALS_WITH_SHIPPING} />);
    expect(screen.getByText('$5.99')).toBeInTheDocument();
  });

  it('displays "Free" when shipping is 0', () => {
    render(<CartSummary totals={TOTALS_FREE_SHIPPING} />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('displays total correctly', () => {
    render(<CartSummary totals={TOTALS_WITH_SHIPPING} />);
    expect(screen.getByText('$38.99')).toBeInTheDocument();
  });

  it('displays total for free-shipping order', () => {
    render(<CartSummary totals={TOTALS_FREE_SHIPPING} />);
    expect(screen.getByText('$110.00')).toBeInTheDocument();
  });
});
