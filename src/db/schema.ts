import { pgTable, serial, integer, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const product = pgTable('product', {
  id: serial('id').primaryKey(),
  typeProductId: integer('type_product_id').references(() => productType.id),
  name: varchar('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

export const productType = pgTable('product_type', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(),
});

export const productItem = pgTable('product_item', {
  id: serial('id').primaryKey(),
  SKU: varchar('SKU').notNull().unique(),
  name: varchar('name').notNull(),
  costUnit: numeric('cost_per_unit', { precision: 10, scale: 2 }),
  costPound: numeric('cost_peer_pound', { precision: 10, scale: 2 }),
  qtyUnit: integer('qty_unit'),
  qtyPound: numeric('qty_pound', { precision: 10, scale: 2 }),
  outDate: timestamp('out_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productTypeItem = pgTable('product_type_item', {
  id: serial('id').primaryKey(),
  productTypeId: integer('product_type_id')
    .notNull()
    .references(() => productType.id),
  productItemId: integer('product_item_id')
    .notNull()
    .references(() => productItem.id),
});

export const saleType = pgTable('sale_type', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
});

export const paymentMethod = pgTable('payment_method', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
});

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  saleTypeId: integer('sale_type_id').references(() => saleType.id),
  paymentMethodId: integer('payment_method_id').references(() => paymentMethod.id),
  subTotal: numeric('sub_total', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const saleProduct = pgTable('sale_product', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  productId: integer('product_id')
    .notNull()
    .references(() => product.id),
  qty: integer('qty').notNull(),
});

// -- RELATIONS
export const productRelations = relations(product, ({ one }) => ({
  productType: one(productType, {
    fields: [product.typeProductId],
    references: [productType.id],
  }),
}));

export const productTypeRelations = relations(productType, ({ many }) => ({
  products: many(product),
  productTypeItem: many(productTypeItem),
}));

export const productItemRelations = relations(productItem, ({ many }) => ({
  productTypeItems: many(productTypeItem),
}));

export const productTypeItemRelations = relations(productTypeItem, ({ one }) => ({
  productType: one(productType, {
    fields: [productTypeItem.productTypeId],
    references: [productType.id],
  }),
  productItem: one(productItem, {
    fields: [productTypeItem.productItemId],
    references: [productItem.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  saleType: one(saleType, {
    fields: [sales.saleTypeId],
    references: [saleType.id],
  }),
  paymentMethod: one(paymentMethod, {
    fields: [sales.paymentMethodId],
    references: [paymentMethod.id],
  }),
  saleProducts: many(saleProduct),
}));

export const saleProductRelations = relations(saleProduct, ({ one }) => ({
  sale: one(sales, {
    fields: [saleProduct.saleId],
    references: [sales.id],
  }),
  product: one(product, {
    fields: [saleProduct.productId],
    references: [product.id],
  }),
}));
