import React from 'react';
import { render, screen } from '@testing-library/react';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('renders the label text', () => {
    render(<LinkButton label="Sign up" href="/signup" />);
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('sets the correct href', () => {
    render(<LinkButton label="Terms" href="/terms" />);
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  });

  it('works with a hash href', () => {
    render(<LinkButton label="Forgot password" href="#" />);
    expect(screen.getByRole('link', { name: 'Forgot password' })).toHaveAttribute('href', '#');
  });

  it('applies an optional className', () => {
    render(<LinkButton label="Click me" href="#" className="extra-class" />);
    expect(screen.getByRole('link', { name: 'Click me' })).toHaveClass('extra-class');
  });
});
