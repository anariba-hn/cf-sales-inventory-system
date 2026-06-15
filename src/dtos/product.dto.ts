export interface CreateProductDto {
  name: string;
  price: string;
  categoryId: number;
}

export interface UpdateProductDto {
  name?: string;
  price?: string;
  categoryId?: number;
}
