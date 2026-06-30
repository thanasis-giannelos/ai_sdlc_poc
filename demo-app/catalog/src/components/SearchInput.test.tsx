import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('renders with default placeholder', () => {
    render(<SearchInput onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
  });

  it('calls onSearch as user types', async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('searchbox'), 'shoes');
    expect(onSearch).toHaveBeenLastCalledWith('shoes');
  });
});
