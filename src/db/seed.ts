import { db } from '@/db/index';
import {
  category,
  ingredient,
  product,
  recipeItem,
  saleType,
  paymentMethod,
  sales,
  saleItem,
} from '@/db/schema';

async function seed() {
  // Categories
  const categories = await db
    .insert(category)
    .values([
      { name: 'Desayunos' },
      { name: 'Almuerzos' },
      { name: 'Bebidas' },
      { name: 'Misceláneos' },
    ])
    .returning();

  const desayunos = categories.find((c) => c.name === 'Desayunos')!;
  const almuerzos = categories.find((c) => c.name === 'Almuerzos')!;

  // Ingredients
  const ingredients = await db
    .insert(ingredient)
    .values([
      { SKU: 'FRJ001', name: 'Frijoles', costPound: '2.00', qtyPound: '10.000' },
      { SKU: 'HUE001', name: 'Huevo', costUnit: '1.50', qtyUnit: 30 },
      { SKU: 'AGU001', name: 'Aguacate', costPound: '3.00', qtyPound: '5.000' },
      { SKU: 'PLL001', name: 'Pollo', costPound: '5.00', qtyPound: '8.000' },
      { SKU: 'TOR001', name: 'Tortilla', costUnit: '0.50', qtyUnit: 50 },
      { SKU: 'CRM001', name: 'Crema', costPound: '4.00', qtyPound: '3.000' },
    ])
    .returning();

  const find = (sku: string) => ingredients.find((i) => i.SKU === sku)!;

  // Products
  const products = await db
    .insert(product)
    .values([
      { name: 'Baleada con Todo', price: '25.00', categoryId: desayunos.id },
      { name: 'Almuerzo Típico', price: '75.00', categoryId: almuerzos.id },
    ])
    .returning();

  const baleada = products.find((p) => p.name === 'Baleada con Todo')!;
  const almuerzo = products.find((p) => p.name === 'Almuerzo Típico')!;

  // Recipes
  await db.insert(recipeItem).values([
    { productId: baleada.id, ingredientId: find('FRJ001').id, qty: '0.100', unit: 'pound' },
    { productId: baleada.id, ingredientId: find('HUE001').id, qty: '2', unit: 'unit' },
    { productId: baleada.id, ingredientId: find('AGU001').id, qty: '0.050', unit: 'pound' },
    { productId: baleada.id, ingredientId: find('TOR001').id, qty: '1', unit: 'unit' },
    { productId: baleada.id, ingredientId: find('CRM001').id, qty: '0.050', unit: 'pound' },

    { productId: almuerzo.id, ingredientId: find('FRJ001').id, qty: '0.150', unit: 'pound' },
    { productId: almuerzo.id, ingredientId: find('HUE001').id, qty: '1', unit: 'unit' },
    { productId: almuerzo.id, ingredientId: find('PLL001').id, qty: '0.300', unit: 'pound' },
    { productId: almuerzo.id, ingredientId: find('TOR001').id, qty: '2', unit: 'unit' },
    { productId: almuerzo.id, ingredientId: find('CRM001').id, qty: '0.050', unit: 'pound' },
  ]);

  // Sale types
  const [contado] = await db
    .insert(saleType)
    .values([{ name: 'Contado' }, { name: 'Crédito' }])
    .returning();

  // Payment methods
  const [efectivo] = await db
    .insert(paymentMethod)
    .values([{ name: 'Efectivo' }, { name: 'Tarjeta' }, { name: 'Transferencia' }])
    .returning();

  // Sample sale
  const [venta1] = await db
    .insert(sales)
    .values([
      {
        saleTypeId: contado.id,
        paymentMethodId: efectivo.id,
        subTotal: '125.00',
        total: '125.00',
      },
    ])
    .returning();

  await db.insert(saleItem).values([
    { saleId: venta1.id, productId: baleada.id, qty: 2, unitPrice: '25.00' },
    { saleId: venta1.id, productId: almuerzo.id, qty: 1, unitPrice: '75.00' },
  ]);

  console.log('✅ Seed executed successfully.');
}

seed().catch((err) => {
  console.error('❌ Error on seed.ts:', err);
  process.exit(1);
});
