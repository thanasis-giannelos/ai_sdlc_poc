import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmptyCartMessage } from './EmptyCartMessage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('EmptyCartMessage', () => {
  it('renders the empty cart message', () => {
    render(<EmptyCartMessage />, { wrapper });
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('renders a Continue Shopping button', () => {
    render(<EmptyCartMessage />, { wrapper });
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });
});
