import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const unitType = pgEnum('unit_type', ['unit', 'pound']);

export const category = pgTable('category', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const product = pgTable('product', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => category.id),
  name: varchar('name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ingredient = pgTable('ingredient', {
  id: serial('id').primaryKey(),
  SKU: varchar('SKU').notNull().unique(),
  name: varchar('name').notNull(),
  costUnit: numeric('cost_per_unit', { precision: 10, scale: 2 }),
  costPound: numeric('cost_per_pound', { precision: 10, scale: 2 }),
  qtyUnit: integer('qty_unit').default(0),
  qtyPound: numeric('qty_pound', { precision: 10, scale: 3 }).default('0'),
  outDate: timestamp('out_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recipeItem = pgTable('recipe_item', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => product.id, { onDelete: 'cascade' }),
  ingredientId: integer('ingredient_id')
    .notNull()
    .references(() => ingredient.id),
  qty: numeric('qty', { precision: 10, scale: 3 }).notNull(),
  unit: unitType('unit').notNull(),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const saleItem = pgTable('sale_item', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => product.id),
  qty: integer('qty').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
});

// -- RELATIONS

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  recipeItems: many(recipeItem),
  saleItems: many(saleItem),
}));

export const ingredientRelations = relations(ingredient, ({ many }) => ({
  recipeItems: many(recipeItem),
}));

export const recipeItemRelations = relations(recipeItem, ({ one }) => ({
  product: one(product, {
    fields: [recipeItem.productId],
    references: [product.id],
  }),
  ingredient: one(ingredient, {
    fields: [recipeItem.ingredientId],
    references: [ingredient.id],
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
  saleItems: many(saleItem),
}));

export const saleItemRelations = relations(saleItem, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItem.saleId],
    references: [sales.id],
  }),
  product: one(product, {
    fields: [saleItem.productId],
    references: [product.id],
  }),
}));
