export interface Product {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  inStock: boolean;
  category: string;
}

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
