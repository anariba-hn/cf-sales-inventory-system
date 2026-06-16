import { db } from '@/db';
import { sales, saleItem, saleType, paymentMethod, recipeItem, ingredient, product } from '@/db/schema';
import { eq, sql, desc, count, sum, gte, inArray } from 'drizzle-orm';
import { CreateSaleDto, GetSaleHistoryDto, HistoryPeriod } from '@/dtos/sale.dto';
import {
  SaleHistory,
  SaleHistoryItem,
  SaleHistoryPage,
  SaleItemModel,
  SaleModel,
  SaleType,
  PaymentMethod,
} from '@/models/sale.model';

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

  static async getHistory(dto: GetSaleHistoryDto): Promise<SaleHistoryPage> {
    const { period, page, pageSize } = dto;
    const offset = (page - 1) * pageSize;
    const startDate = SaleService.getPeriodStart(period);
    const whereClause = startDate ? gte(sales.createdAt, startDate) : undefined;

    const [agg] = await db
      .select({ total: count(sales.id), periodRevenue: sum(sales.total) })
      .from(sales)
      .where(whereClause);

    const rows = await db
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
      .where(whereClause)
      .orderBy(desc(sales.createdAt))
      .limit(pageSize)
      .offset(offset);

    const saleIds = rows.map((r) => r.id);
    const itemRows = saleIds.length
      ? await db
          .select({
            saleId: saleItem.saleId,
            productId: saleItem.productId,
            productName: product.name,
            qty: saleItem.qty,
            unitPrice: saleItem.unitPrice,
          })
          .from(saleItem)
          .leftJoin(product, eq(saleItem.productId, product.id))
          .where(inArray(saleItem.saleId, saleIds))
      : [];

    const itemsBySale: Record<number, SaleHistoryItem[]> = {};
    for (const i of itemRows) {
      if (!itemsBySale[i.saleId]) itemsBySale[i.saleId] = [];
      itemsBySale[i.saleId].push({
        productId: i.productId,
        productName: i.productName ?? '',
        qty: i.qty,
        unitPrice: Number(i.unitPrice),
      });
    }

    const data: SaleHistory[] = rows.map((r) => ({
      id: r.id,
      saleType: r.saleType ?? null,
      paymentMethod: r.paymentMethod ?? null,
      subTotal: Number(r.subTotal),
      total: Number(r.total),
      cashReceived: r.cashReceived ? Number(r.cashReceived) : null,
      items: itemsBySale[r.id] ?? [],
      createdAt: r.createdAt,
    }));

    const total = agg.total;
    const periodRevenue = Number(agg.periodRevenue ?? 0);

    return {
      data,
      total,
      periodRevenue,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private static getPeriodStart(period: HistoryPeriod): Date | null {
    if (period === 'all') return null;
    const now = new Date();
    if (period === 'day') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
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
