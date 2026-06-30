import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormInput } from './FormInput';

describe('FormInput', () => {
  it('renders a labelled input', () => {
    render(<FormInput label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('associates label with input via auto-generated id', () => {
    render(<FormInput label="Full Name" />);
    const input = screen.getByLabelText('Full Name');
    expect(input).toHaveAttribute('id', 'full-name');
  });

  it('uses the explicit id prop when provided', () => {
    render(<FormInput label="Email" id="login-email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'login-email');
  });

  it('renders the placeholder text', () => {
    render(<FormInput label="Search" placeholder="Type here…" />);
    expect(screen.getByPlaceholderText('Type here…')).toBeInTheDocument();
  });

  it('uses type="text" by default', () => {
    render(<FormInput label="Name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('type', 'text');
  });

  it('forwards the type prop', () => {
    render(<FormInput label="Password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('is disabled when disabled prop is true', () => {
    render(<FormInput label="Name" disabled />);
    expect(screen.getByLabelText('Name')).toBeDisabled();
  });

  it('renders the error message and sets aria-invalid', () => {
    render(<FormInput label="Email" error="Enter a valid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not render an error element when error is absent', () => {
    render(<FormInput label="Email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });

  it('links error to input via aria-describedby', () => {
    render(<FormInput label="Email" id="email" error="Required" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'email-error');
  });
});
