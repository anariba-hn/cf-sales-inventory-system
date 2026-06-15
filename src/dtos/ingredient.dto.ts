export interface CreateIngredientDto {
  SKU: string;
  name: string;
  costUnit?: string;
  costPound?: string;
  qtyUnit?: number;
  qtyPound?: string;
  outDate?: Date;
}

export interface UpdateIngredientDto {
  name?: string;
  costUnit?: string;
  costPound?: string;
  qtyUnit?: number;
  qtyPound?: string;
  outDate?: Date;
}
