export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  created_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at'>;

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  alternative_phone?: string;
  note?: string;
  total_amount: number;
  items: CartItem[];
  slip_url: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}
