
export interface Product {
  id: string;
  code: string;
  name: string;
  packagingSize: number; // units per carton
  basePrice: number;
  defaultDiscount: number;
}

export interface OrderItem {
  id: string; // matches product id
  product: Product;
  quantity: number; // total units
  discount: number; // current discount %
  price: number; // custom unit price
}

export interface SavedOrderItem {
  name: string;
  code: string;
  quantity: number;
  discount: number;
  netAmount: number;
}

export interface SavedOrder {
  id: string;
  timestamp: number;
  outcomeString: string;
  itemCount: number;
  totalAmount: number;
  items: SavedOrderItem[];
}

export type ViewType = 'ORDER' | 'PRODUCTS' | 'SUMMARY' | 'HISTORY';
