import { db } from '@/db';
import { product, productType } from '@/db/schema';
import { eq } from 'drizzle-orm';

import { CreateProductDto, UpdateProductDto } from '@/dtos/product.dto';
import { ProductWithType, Product } from '@/models/product.model';

export class ProductService {
  static async getAll(): Promise<ProductWithType[]> {
    const data = await db
      .select({
        id: product.id,
        name: product.name,
        price: product.price,
        typeProductId: product.typeProductId,
        type: productType.name,
      })
      .from(product)
      .leftJoin(productType, eq(product.typeProductId, productType.id));

    return data.map((r) => ({
      ...r,
      price: Number(r.price),
    }));
  }

  static async getById(id: number) {
    const [result] = await db.select().from(product).where(eq(product.id, id));

    return result ?? null;
  }

  static async create(data: CreateProductDto): Promise<ProductWithType> {
    const { name, price, typeProductId } = data;

    const typeExists = await db.select().from(productType).where(eq(productType.id, typeProductId));

    if (typeExists.length === 0) {
      throw new Error(`Product type ID ${typeProductId} does not exist`);
    }

    const newProduct = await db.insert(product).values({ name, price, typeProductId }).returning();

    const result = newProduct[0];
    return {
      ...result,
      price: Number(result.price),
      type: null,
    };
  }

  static async update(id: number, data: UpdateProductDto): Promise<Product | null> {
    const updated = await db.update(product).set(data).where(eq(product.id, id)).returning({
      id: product.id,
      name: product.name,
      price: product.price,
      typeProductId: product.typeProductId,
    });

    if (!updated.length) return null;

    const [result] = updated;
    return {
      ...result,
      price: Number(result.price),
    };
  }

  static async delete(id: number): Promise<boolean> {
    const deleted = await db.delete(product).where(eq(product.id, id));
    return deleted.rowCount > 0;
  }
}
