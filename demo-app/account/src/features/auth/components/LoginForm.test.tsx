import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from './LoginForm';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    <BrowserRouter>{children}</BrowserRouter>
  </QueryClientProvider>
);

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders a sign in button', () => {
    render(<LoginForm />, { wrapper });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows invalid email error for malformed email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('disables the button and shows loading state while submitting', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper });
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const btn = await screen.findByRole('button', { name: /signing in/i });
    expect(btn).toBeDisabled();
  });

  it('renders a non-functional forgot password link', () => {
    render(<LoginForm />, { wrapper });
    const link = screen.getByRole('link', { name: /forgot password/i });
    expect(link).toHaveAttribute('href', '#');
  });
});
