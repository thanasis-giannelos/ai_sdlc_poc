import React from 'react';
import type { Product } from '../types';
interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
}
export declare const ProductGrid: React.FC<ProductGridProps>;
export {};
