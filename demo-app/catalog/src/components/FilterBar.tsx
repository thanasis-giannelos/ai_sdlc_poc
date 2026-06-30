import React, { useState } from 'react';
import type { SortOption } from '../types';

interface FilterBarProps {
  categories: string[];
  sortOptions: { label: string; value: SortOption }[];
  selectedCategory: string;
  selectedSort: SortOption;
  onFilter: (category: string) => void;
  onSort: (sort: SortOption) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  sortOptions,
  selectedCategory,
  selectedSort,
  onFilter,
  onSort,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      {/* Header row — always visible */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-neutral-900">Filters</span>
        <div className="flex items-center gap-4">
          {/* Sort select */}
          <select
            value={selectedSort}
            onChange={(e) => onSort(e.target.value as SortOption)}
            aria-label="Sort products"
            className="rounded-md border border-neutral-200 px-2 py-1 text-sm text-neutral-900
              focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            {expanded ? 'Hide filters' : 'Show filters'}
          </button>
        </div>
      </div>

      {/* Expanded category list */}
      {expanded && (
        <div className="border-t border-neutral-200 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFilter('')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors
                ${selectedCategory === ''
                  ? 'bg-primary text-white'
                  : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-200'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onFilter(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors
                  ${selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
