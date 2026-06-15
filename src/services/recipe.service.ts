import { db } from '@/db';
import { recipeItem, ingredient } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateRecipeItemDto } from '@/dtos/recipe.dto';
import { RecipeItemWithIngredient } from '@/models/recipe.model';

export class RecipeService {
  static async getByProduct(productId: number): Promise<RecipeItemWithIngredient[]> {
    const data = await db
      .select({
        id: recipeItem.id,
        productId: recipeItem.productId,
        ingredientId: recipeItem.ingredientId,
        ingredientName: ingredient.name,
        ingredientSKU: ingredient.SKU,
        qty: recipeItem.qty,
        unit: recipeItem.unit,
      })
      .from(recipeItem)
      .leftJoin(ingredient, eq(recipeItem.ingredientId, ingredient.id))
      .where(eq(recipeItem.productId, productId));

    return data.map((r) => ({
      ...r,
      ingredientName: r.ingredientName ?? '',
      ingredientSKU: r.ingredientSKU ?? '',
      qty: Number(r.qty),
      unit: r.unit as 'unit' | 'pound',
    }));
  }

  static async addItem(data: CreateRecipeItemDto) {
    const [result] = await db.insert(recipeItem).values(data).returning();
    return result;
  }

  static async removeItem(id: number) {
    await db.delete(recipeItem).where(eq(recipeItem.id, id));
  }
}
