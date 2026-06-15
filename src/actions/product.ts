'use server';

import { ProductService } from '@/services/product.service';
import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
  return ProductService.getAll();
}

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const price = formData.get('price') as string;
  const categoryId = parseInt(formData.get('categoryId') as string, 10);

  if (!name || !price || isNaN(categoryId)) throw new Error('Invalid form data');

  const result = await ProductService.create({ name, price, categoryId });
  revalidatePath('/products');
  return result;
}

export async function updateProductAction(
  id: number,
  data: { name?: string; price?: string; categoryId?: number }
) {
  await ProductService.update(id, data);
  revalidatePath('/products');
}

export async function deleteProductAction(id: number) {
  await ProductService.delete(id);
  revalidatePath('/products');
}
