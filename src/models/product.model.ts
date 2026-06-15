export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
}

export interface ProductWithCategory extends Product {
  category: string | null;
}
