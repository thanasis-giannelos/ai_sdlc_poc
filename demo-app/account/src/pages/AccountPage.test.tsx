import React from 'react';
import { render, screen } from '@testing-library/react';
import { AccountPage } from './AccountPage';

describe('AccountPage', () => {
  it('renders without crashing', () => {
    render(<AccountPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows coming soon placeholder text', () => {
    render(<AccountPage />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
