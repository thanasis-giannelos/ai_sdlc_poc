import React from 'react';
interface SearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}
export declare const SearchInput: React.FC<SearchInputProps>;
export {};
