'use server';

import { CategoryService } from '@/services/category.service';
import { revalidatePath } from 'next/cache';

export async function getCategoriesAction() {
  return CategoryService.getAll();
}

export async function createCategoryAction(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  if (!name) return { error: 'El nombre de categoría es requerido' };
  try {
    const result = await CategoryService.create({ name });
    revalidatePath('/products');
    return result;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear categoría' };
  }
}

export async function updateCategoryAction(id: number, data: { name?: string }) {
  await CategoryService.update(id, data);
  revalidatePath('/products');
}

export async function deleteCategoryAction(id: number) {
  await CategoryService.delete(id);
  revalidatePath('/products');
}
