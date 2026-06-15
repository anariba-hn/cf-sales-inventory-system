import { db } from '@/db';
import { ingredient } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateIngredientDto, UpdateIngredientDto } from '@/dtos/ingredient.dto';
import { Ingredient } from '@/models/ingredient.model';

const toModel = (r: typeof ingredient.$inferSelect): Ingredient => ({
  ...r,
  costUnit: r.costUnit ? Number(r.costUnit) : null,
  costPound: r.costPound ? Number(r.costPound) : null,
  qtyPound: r.qtyPound ? Number(r.qtyPound) : null,
});

export class IngredientService {
  static async getAll(): Promise<Ingredient[]> {
    const data = await db.select().from(ingredient);
    return data.map(toModel);
  }

  static async getById(id: number): Promise<Ingredient | null> {
    const [result] = await db.select().from(ingredient).where(eq(ingredient.id, id));
    return result ? toModel(result) : null;
  }

  static async create(data: CreateIngredientDto): Promise<Ingredient> {
    const exists = await db.select().from(ingredient).where(eq(ingredient.SKU, data.SKU));
    if (exists.length) throw new Error(`Ingredient with SKU "${data.SKU}" already exists`);
    const [result] = await db.insert(ingredient).values(data).returning();
    return toModel(result);
  }

  static async update(id: number, data: UpdateIngredientDto): Promise<Ingredient | null> {
    const [result] = await db
      .update(ingredient)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ingredient.id, id))
      .returning();
    return result ? toModel(result) : null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(ingredient).where(eq(ingredient.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
