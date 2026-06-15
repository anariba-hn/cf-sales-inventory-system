export interface RecipeItem {
  id: number;
  productId: number;
  ingredientId: number;
  qty: number;
  unit: 'unit' | 'pound';
}

export interface RecipeItemWithIngredient extends RecipeItem {
  ingredientName: string;
  ingredientSKU: string;
}
