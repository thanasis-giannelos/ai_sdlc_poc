import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CheckoutButton } from './CheckoutButton';

describe('CheckoutButton', () => {
  it('renders "Proceed to Checkout" initially', () => {
    render(<CheckoutButton />);
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('is not disabled initially', () => {
    render(<CheckoutButton />);
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).not.toBeDisabled();
  });

  it('shows processing state and disables button after click', () => {
    vi.useFakeTimers();
    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
    vi.useRealTimers();
  });

  it('resets to idle state after 1500ms', () => {
    vi.useFakeTimers();
    render(<CheckoutButton />);
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).not.toBeDisabled();
    vi.useRealTimers();
  });
});
