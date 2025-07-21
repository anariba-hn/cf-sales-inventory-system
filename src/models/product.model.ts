export interface Product {
  id: number;
  name: string;
  price: number;
  typeProductId: number | null;
}

export interface ProductWithType extends Product {
  type: string | null;
}

export interface ProductType {
  id: number;
  name: string;
}
