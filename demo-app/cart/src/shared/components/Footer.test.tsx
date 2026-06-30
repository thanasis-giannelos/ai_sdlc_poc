import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 MiniStore/)).toBeInTheDocument();
  });

  it('renders Privacy link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
  });

  it('renders Terms link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
  });

  it('renders Contact link', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders a footer landmark', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
