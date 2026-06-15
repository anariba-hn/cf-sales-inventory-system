'use server';

import { RecipeService } from '@/services/recipe.service';

export async function getRecipeByProductAction(productId: number) {
  return RecipeService.getByProduct(productId);
}

export async function addRecipeItemAction(data: {
  productId: number;
  ingredientId: number;
  qty: string;
  unit: 'unit' | 'pound';
}) {
  return RecipeService.addItem(data);
}

export async function removeRecipeItemAction(id: number) {
  return RecipeService.removeItem(id);
}
