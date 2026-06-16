'use server';

import { IngredientService } from '@/services/ingredient.service';
import { revalidatePath } from 'next/cache';

export async function getIngredientsAction() {
  return IngredientService.getAll();
}

export async function createIngredientAction(formData: FormData) {
  const SKU = (formData.get('SKU') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const costUnit = (formData.get('costUnit') as string) || undefined;
  const costPound = (formData.get('costPound') as string) || undefined;
  const qtyUnitRaw = formData.get('qtyUnit') as string;
  const qtyUnit = qtyUnitRaw ? parseInt(qtyUnitRaw, 10) : undefined;
  const qtyPound = (formData.get('qtyPound') as string) || undefined;
  const outDateRaw = formData.get('outDate') as string;
  const outDate = outDateRaw ? new Date(outDateRaw) : undefined;

  if (!SKU || !name) return { error: 'SKU y nombre son requeridos' };

  try {
    const result = await IngredientService.create({ SKU, name, costUnit, costPound, qtyUnit, qtyPound, outDate });
    revalidatePath('/inventory');
    return result;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear ingrediente' };
  }
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
