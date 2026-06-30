import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the provided message text', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert" for screen readers', () => {
    render(<ErrorMessage message="Error occurred" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders different messages correctly', () => {
    render(<ErrorMessage message="Invalid email address" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
  });
});
