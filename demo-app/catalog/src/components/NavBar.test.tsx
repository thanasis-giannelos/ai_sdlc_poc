import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NavBar } from './NavBar';

describe('NavBar', () => {
  it('renders the store name', () => {
    render(<NavBar />);
    expect(screen.getByText('MiniStore')).toBeInTheDocument();
  });

  it('shows cart count badge when cartCount > 0', () => {
    render(<NavBar cartCount={3} />);
    expect(screen.getByLabelText(/cart \(3 items\)/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not show badge when cartCount is 0', () => {
    render(<NavBar cartCount={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('calls onCartClick when cart button is clicked', async () => {
    const onCartClick = vi.fn();
    render(<NavBar onCartClick={onCartClick} />);
    await userEvent.click(screen.getByLabelText(/cart/i));
    expect(onCartClick).toHaveBeenCalled();
  });

  it('toggles mobile menu on hamburger click', async () => {
    render(<NavBar />);
    expect(screen.queryByRole('navigation', { hidden: true })).toBeDefined();
    await userEvent.click(screen.getByLabelText(/toggle menu/i));
    expect(screen.getAllByRole('link', { name: /catalog/i }).length).toBeGreaterThan(0);
  });
});
