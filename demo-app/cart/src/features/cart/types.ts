// Product is duplicated here for POC; extract to a shared npm package when host shell is scaffolded
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
