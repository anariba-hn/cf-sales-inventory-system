import { db } from '@/db/index';
import {
  productItem,
  productType,
  product,
  saleType,
  paymentMethod,
  sales,
  saleProduct,
} from '@/db/schema';

async function seed() {
  // 🟡 Ingredientes
  const items: (typeof productItem.$inferInsert)[] = [
    {
      SKU: 'FRJ001',
      name: 'Frijoles',
      costUnit: '2.00',
      qtyUnit: 1,
    },
    {
      SKU: 'HUE001',
      name: 'Huevo',
      costUnit: '1.50',
      qtyUnit: 2,
    },
    {
      SKU: 'AGU001',
      name: 'Aguacate',
      costPound: '3.00',
      qtyPound: '0.4',
    },
    {
      SKU: 'PLL001',
      name: 'Pollo',
      costPound: '5.00',
      qtyPound: '0.3',
    },
  ];
  await db.insert(productItem).values(items);

  // 🟢 Tipos de producto
  const types: (typeof productType.$inferInsert)[] = [
    { name: 'Baleada con todo' },
    { name: 'Almuerzo típico' },
  ];
  const [baleada, almuerzo] = await db.insert(productType).values(types).returning();

  // 🔵 Productos
  const products: (typeof product.$inferInsert)[] = [
    {
      name: 'Baleada sencilla',
      price: '25.00',
      typeProductId: baleada.id,
    },
    {
      name: 'Almuerzo con pollo',
      price: '75.00',
      typeProductId: almuerzo.id,
    },
  ];
  const [prodBaleada, prodAlmuerzo] = await db.insert(product).values(products).returning();

  // 🟣 Tipos de venta
  const salesTypes: (typeof saleType.$inferInsert)[] = [{ name: 'Contado' }, { name: 'Crédito' }];
  const [contado, credito] = await db.insert(saleType).values(salesTypes).returning();

  // 🔶 Métodos de pago
  const methods: (typeof paymentMethod.$inferInsert)[] = [
    { name: 'Efectivo' },
    { name: 'Tarjeta' },
    { name: 'Transferencia' },
  ];
  const [efectivo, tarjeta] = await db.insert(paymentMethod).values(methods).returning();

  // 🔺 Ventas
  const salesData: (typeof sales.$inferInsert)[] = [
    {
      saleTypeId: contado.id,
      paymentMethodId: efectivo.id,
      subTotal: '100.00',
      total: '115.00',
    },
    {
      saleTypeId: credito.id,
      paymentMethodId: tarjeta.id,
      subTotal: '80.00',
      total: '90.40',
    },
  ];
  const [venta1, venta2] = await db.insert(sales).values(salesData).returning();

  // 🧩 Relación venta-producto
  const soldProducts: (typeof saleProduct.$inferInsert)[] = [
    {
      saleId: venta1.id,
      productId: prodBaleada.id,
      qty: 2,
    },
    {
      saleId: venta1.id,
      productId: prodAlmuerzo.id,
      qty: 1,
    },
    {
      saleId: venta2.id,
      productId: prodAlmuerzo.id,
      qty: 2,
    },
  ];
  await db.insert(saleProduct).values(soldProducts);

  console.log('✅ Seed executed successfully.');
}

seed().catch((err) => {
  console.error('❌ Error on seed.ts:', err);
});
