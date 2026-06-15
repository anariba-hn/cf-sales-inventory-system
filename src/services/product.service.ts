import { db } from '@/db';
import { product, category } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateProductDto, UpdateProductDto } from '@/dtos/product.dto';
import { ProductWithCategory, Product } from '@/models/product.model';

export class ProductService {
  static async getAll(): Promise<ProductWithCategory[]> {
    const data = await db
      .select({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        category: category.name,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id));

    return data.map((r) => ({ ...r, price: Number(r.price) }));
  }

  static async getById(id: number): Promise<Product | null> {
    const [result] = await db.select().from(product).where(eq(product.id, id));
    if (!result) return null;
    return { ...result, price: Number(result.price) };
  }

  static async create(data: CreateProductDto): Promise<ProductWithCategory> {
    const categoryExists = await db
      .select()
      .from(category)
      .where(eq(category.id, data.categoryId));
    if (!categoryExists.length) throw new Error(`Category ID ${data.categoryId} does not exist`);

    const [newProduct] = await db
      .insert(product)
      .values({ name: data.name, price: data.price, categoryId: data.categoryId })
      .returning();

    return { ...newProduct, price: Number(newProduct.price), category: null };
  }

  static async update(id: number, data: UpdateProductDto): Promise<Product | null> {
    const [result] = await db
      .update(product)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(product.id, id))
      .returning({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
      });
    if (!result) return null;
    return { ...result, price: Number(result.price) };
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(product).where(eq(product.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
