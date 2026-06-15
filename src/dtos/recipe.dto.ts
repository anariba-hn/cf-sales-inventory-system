export interface CreateRecipeItemDto {
  productId: number;
  ingredientId: number;
  qty: string;
  unit: 'unit' | 'pound';
}
