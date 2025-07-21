export interface CreateProductDto {
  name: string;
  price: string;
  typeProductId: number;
}

export interface UpdateProductDto {
  name?: string;
  price?: string;
  typeProductId?: number;
}

export interface CreateProductTypeDto {
  name: string;
}
