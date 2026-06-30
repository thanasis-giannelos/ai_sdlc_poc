import React, { useState } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search products…',
  onSearch,
}) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="relative w-full max-w-sm">
      {/* Search icon */}
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full rounded-md border border-neutral-200 bg-white py-2 pl-9 pr-4
          text-sm text-neutral-900 placeholder:text-neutral-500
          focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
        "
      />
    </div>
  );
};
