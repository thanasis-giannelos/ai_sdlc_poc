import React from 'react';
import type { CartItem } from '../types';
interface Props {
    item: CartItem;
    onRemove: (productId: string) => void;
    onQtyChange: (productId: string, quantity: number) => void;
}
export declare const CartLineItem: React.FC<Props>;
export {};
