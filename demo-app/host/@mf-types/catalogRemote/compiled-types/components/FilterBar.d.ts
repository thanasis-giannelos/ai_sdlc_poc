import React from 'react';
import type { SortOption } from '../types';
interface FilterBarProps {
    categories: string[];
    sortOptions: {
        label: string;
        value: SortOption;
    }[];
    selectedCategory: string;
    selectedSort: SortOption;
    onFilter: (category: string) => void;
    onSort: (sort: SortOption) => void;
}
export declare const FilterBar: React.FC<FilterBarProps>;
export {};
