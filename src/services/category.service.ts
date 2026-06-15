import { db } from '@/db';
import { category } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateCategoryDto, UpdateCategoryDto } from '@/dtos/category.dto';
import { Category } from '@/models/category.model';

export class CategoryService {
  static async getAll(): Promise<Category[]> {
    return db.select({ id: category.id, name: category.name }).from(category);
  }

  static async create(data: CreateCategoryDto): Promise<Category> {
    const exists = await db.select().from(category).where(eq(category.name, data.name));
    if (exists.length) throw new Error(`Category "${data.name}" already exists`);
    const [result] = await db.insert(category).values({ name: data.name }).returning();
    return result;
  }

  static async update(id: number, data: UpdateCategoryDto): Promise<Category | null> {
    const [result] = await db
      .update(category)
      .set(data)
      .where(eq(category.id, id))
      .returning({ id: category.id, name: category.name });
    return result ?? null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(category).where(eq(category.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
