export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  category: string;
  created_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at'>;
