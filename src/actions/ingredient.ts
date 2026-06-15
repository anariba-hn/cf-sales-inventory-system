'use server';

import { IngredientService } from '@/services/ingredient.service';
import { revalidatePath } from 'next/cache';

export async function getIngredientsAction() {
  return IngredientService.getAll();
}

export async function createIngredientAction(formData: FormData) {
  const SKU = formData.get('SKU') as string;
  const name = formData.get('name') as string;
  const costUnit = (formData.get('costUnit') as string) || undefined;
  const costPound = (formData.get('costPound') as string) || undefined;
  const qtyUnitRaw = formData.get('qtyUnit') as string;
  const qtyUnit = qtyUnitRaw ? parseInt(qtyUnitRaw, 10) : undefined;
  const qtyPound = (formData.get('qtyPound') as string) || undefined;
  const outDateRaw = formData.get('outDate') as string;
  const outDate = outDateRaw ? new Date(outDateRaw) : undefined;

  if (!SKU || !name) throw new Error('SKU and name are required');

  const result = await IngredientService.create({ SKU, name, costUnit, costPound, qtyUnit, qtyPound, outDate });
  revalidatePath('/inventory');
  return result;
}

export async function updateIngredientAction(id: number, data: {
  name?: string;
  costUnit?: string;
  costPound?: string;
  qtyUnit?: number;
  qtyPound?: string;
}) {
  await IngredientService.update(id, data);
  revalidatePath('/inventory');
}

export async function deleteIngredientAction(id: number) {
  await IngredientService.delete(id);
  revalidatePath('/inventory');
}
