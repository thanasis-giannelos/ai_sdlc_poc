import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './FilterBar';

const sortOptions = [
  { label: 'Price: Low to High', value: 'price-asc' as const },
  { label: 'Price: High to Low', value: 'price-desc' as const },
];

describe('FilterBar', () => {
  it('renders collapsed by default', () => {
    render(
      <FilterBar
        categories={['shoes', 'shirts']}
        sortOptions={sortOptions}
        selectedCategory=""
        selectedSort="price-asc"
        onFilter={vi.fn()}
        onSort={vi.fn()}
      />,
    );
    expect(screen.queryByText('Category')).not.toBeInTheDocument();
    expect(screen.getByText(/show filters/i)).toBeInTheDocument();
  });

  it('expands to show category buttons on click', async () => {
    render(
      <FilterBar
        categories={['shoes', 'shirts']}
        sortOptions={sortOptions}
        selectedCategory=""
        selectedSort="price-asc"
        onFilter={vi.fn()}
        onSort={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText(/show filters/i));
    expect(screen.getByText('shoes')).toBeInTheDocument();
  });

  it('calls onFilter when a category is selected', async () => {
    const onFilter = vi.fn();
    render(
      <FilterBar
        categories={['shoes']}
        sortOptions={sortOptions}
        selectedCategory=""
        selectedSort="price-asc"
        onFilter={onFilter}
        onSort={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText(/show filters/i));
    await userEvent.click(screen.getByText('shoes'));
    expect(onFilter).toHaveBeenCalledWith('shoes');
  });
});
