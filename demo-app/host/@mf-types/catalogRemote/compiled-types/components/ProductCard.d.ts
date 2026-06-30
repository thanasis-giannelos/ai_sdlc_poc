import React from 'react';
import type { Product } from '../types';
interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
}
export declare const ProductCard: React.FC<ProductCardProps>;
export {};
