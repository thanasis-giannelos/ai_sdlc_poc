import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './LoginPage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('LoginPage', () => {
  it('renders the sign in button (LoginForm is present)', () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the email and password fields', () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<LoginPage />, { wrapper });
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/© 2026 MiniStore/)).toBeInTheDocument();
  });
});
