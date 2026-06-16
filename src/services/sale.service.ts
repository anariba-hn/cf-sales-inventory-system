import { db } from '@/db';
import { sales, saleItem, saleType, paymentMethod, recipeItem, ingredient, product } from '@/db/schema';
import { eq, sql, desc, count } from 'drizzle-orm';
import { CreateSaleDto } from '@/dtos/sale.dto';
import { SaleHistory, SaleItemModel, SaleModel, SaleType, PaymentMethod } from '@/models/sale.model';

export class SaleService {
  static async getSaleTypes(): Promise<SaleType[]> {
    return db.select({ id: saleType.id, name: saleType.name }).from(saleType);
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select({ id: paymentMethod.id, name: paymentMethod.name }).from(paymentMethod);
  }

  static async create(data: CreateSaleDto): Promise<SaleModel> {
    const [newSale] = await db
      .insert(sales)
      .values({
        saleTypeId: data.saleTypeId,
        paymentMethodId: data.paymentMethodId,
        subTotal: data.subTotal,
        total: data.total,
        cashReceived: data.cashReceived ?? null,
      })
      .returning();

    if (!data.items.length) throw new Error('La venta debe tener al menos un producto');

    await db.insert(saleItem).values(
      data.items.map((item) => ({
        saleId: newSale.id,
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
      }))
    );

    // Deduct inventory based on recipes
    // TODO: wrap in a DB transaction once we migrate to pg Pool driver
    await SaleService.deductInventory(data.items);

    return SaleService.getById(newSale.id) as Promise<SaleModel>;
  }

  static async getById(id: number): Promise<SaleModel | null> {
    const [sale] = await db
      .select({
        id: sales.id,
        saleType: saleType.name,
        paymentMethod: paymentMethod.name,
        subTotal: sales.subTotal,
        total: sales.total,
        cashReceived: sales.cashReceived,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .leftJoin(saleType, eq(sales.saleTypeId, saleType.id))
      .leftJoin(paymentMethod, eq(sales.paymentMethodId, paymentMethod.id))
      .where(eq(sales.id, id));

    if (!sale) return null;

    const items = await db
      .select({
        id: saleItem.id,
        productId: saleItem.productId,
        productName: product.name,
        qty: saleItem.qty,
        unitPrice: saleItem.unitPrice,
      })
      .from(saleItem)
      .leftJoin(product, eq(saleItem.productId, product.id))
      .where(eq(saleItem.saleId, id));

    const mappedItems: SaleItemModel[] = items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName ?? '',
      qty: i.qty,
      unitPrice: Number(i.unitPrice),
      lineTotal: i.qty * Number(i.unitPrice),
    }));

    return {
      id: sale.id,
      saleType: sale.saleType ?? null,
      paymentMethod: sale.paymentMethod ?? null,
      subTotal: Number(sale.subTotal),
      total: Number(sale.total),
      cashReceived: sale.cashReceived ? Number(sale.cashReceived) : null,
      createdAt: sale.createdAt,
      items: mappedItems,
    };
  }

  static async getHistory(): Promise<SaleHistory[]> {
    const data = await db
      .select({
        id: sales.id,
        saleType: saleType.name,
        paymentMethod: paymentMethod.name,
        subTotal: sales.subTotal,
        total: sales.total,
        cashReceived: sales.cashReceived,
        createdAt: sales.createdAt,
        itemCount: count(saleItem.id),
      })
      .from(sales)
      .leftJoin(saleType, eq(sales.saleTypeId, saleType.id))
      .leftJoin(paymentMethod, eq(sales.paymentMethodId, paymentMethod.id))
      .leftJoin(saleItem, eq(saleItem.saleId, sales.id))
      .groupBy(sales.id, saleType.name, paymentMethod.name)
      .orderBy(desc(sales.createdAt));

    return data.map((r) => ({
      id: r.id,
      saleType: r.saleType ?? null,
      paymentMethod: r.paymentMethod ?? null,
      subTotal: Number(r.subTotal),
      total: Number(r.total),
      cashReceived: r.cashReceived ? Number(r.cashReceived) : null,
      itemCount: Number(r.itemCount),
      createdAt: r.createdAt,
    }));
  }

  private static async deductInventory(items: { productId: number; qty: number }[]) {
    for (const item of items) {
      const recipe = await db
        .select()
        .from(recipeItem)
        .where(eq(recipeItem.productId, item.productId));

      for (const ri of recipe) {
        const totalQty = Number(ri.qty) * item.qty;

        if (ri.unit === 'unit') {
          await db
            .update(ingredient)
            .set({ qtyUnit: sql`GREATEST(0, COALESCE(${ingredient.qtyUnit}, 0) - ${totalQty})` })
            .where(eq(ingredient.id, ri.ingredientId));
        } else {
          await db
            .update(ingredient)
            .set({ qtyPound: sql`GREATEST(0, COALESCE(${ingredient.qtyPound}, 0) - ${totalQty})` })
            .where(eq(ingredient.id, ri.ingredientId));
        }
      }
    }
  }
}
