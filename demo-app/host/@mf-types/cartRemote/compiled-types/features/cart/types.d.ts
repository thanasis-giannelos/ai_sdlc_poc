export interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
    category: string;
}
export interface CartItem {
    product: Product;
    quantity: number;
}
export interface CartTotals {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}
