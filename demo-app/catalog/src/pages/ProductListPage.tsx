import React, { useState, useMemo } from 'react';
import { ProductGrid } from '../components/ProductGrid';
import { FilterBar } from '../components/FilterBar';
import { SearchInput } from '../components/SearchInput';
import type { Product, SortOption } from '../types';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', title: 'Classic White Sneakers', price: 89.99, imageUrl: 'https://placehold.co/400x400?text=Sneakers', inStock: true, category: 'shoes' },
  { id: '2', title: 'Slim Fit Chinos', price: 59.99, imageUrl: 'https://placehold.co/400x400?text=Chinos', inStock: true, category: 'pants' },
  { id: '3', title: 'Cotton Crew Neck Tee', price: 24.99, imageUrl: 'https://placehold.co/400x400?text=Tee', inStock: true, category: 'shirts' },
  { id: '4', title: 'Leather Oxford Shoes', price: 149.99, imageUrl: 'https://placehold.co/400x400?text=Oxfords', inStock: false, category: 'shoes' },
  { id: '5', title: 'Wool Blend Blazer', price: 199.99, imageUrl: 'https://placehold.co/400x400?text=Blazer', inStock: true, category: 'jackets' },
  { id: '6', title: 'Graphic Print Hoodie', price: 69.99, imageUrl: 'https://placehold.co/400x400?text=Hoodie', inStock: true, category: 'shirts' },
  { id: '7', title: 'Running Shorts', price: 39.99, imageUrl: 'https://placehold.co/400x400?text=Shorts', inStock: true, category: 'pants' },
  { id: '8', title: 'Canvas Backpack', price: 79.99, imageUrl: 'https://placehold.co/400x400?text=Backpack', inStock: false, category: 'accessories' },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A–Z', value: 'name-asc' },
  { label: 'Name: Z–A', value: 'name-desc' },
];

const CATEGORIES = [...new Set(MOCK_PRODUCTS.map((p) => p.category))];

export const ProductListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState<SortOption>('price-asc');

  const filtered = useMemo(() => {
    let items = MOCK_PRODUCTS;
    if (selectedCategory) items = items.filter((p) => p.category === selectedCategory);
    if (search) items = items.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

    return [...items].sort((a, b) => {
      switch (selectedSort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
      }
    });
  }, [search, selectedCategory, selectedSort]);

  const handleAddToCart = (product: Product) => {
    window.dispatchEvent(new CustomEvent('cart:add', { detail: product }));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">All Products</h1>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput onSearch={setSearch} />
        </div>
        <div className="mb-6">
          <FilterBar
            categories={CATEGORIES}
            sortOptions={SORT_OPTIONS}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            onFilter={setSelectedCategory}
            onSort={setSelectedSort}
          />
        </div>
        <ProductGrid products={filtered} onAddToCart={handleAddToCart} />
      </main>
    </div>
  );
};
