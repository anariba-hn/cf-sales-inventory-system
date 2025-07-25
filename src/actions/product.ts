'use server';

import { ProductService } from '@/services/product.service';

import { revalidatePath } from 'next/cache';

export async function getProductsAction() {
  return await ProductService.getAll();
}

export async function getTypeAction() {
  return await ProductService.getTypeAll();
}

export async function createProductAction(formData: FormData) {
  const name = formData.get('name') as string;
  const price = formData.get('price') as string;
  const typeProductId = parseInt(formData.get('typeProductId') as string, 10);

  if (!name || !price || isNaN(typeProductId)) {
    throw new Error('Invalid form data');
  }

  const result = await ProductService.create({ name, price, typeProductId });
  revalidatePath('/products');
  return result;
}

export async function createProductType(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) {
    throw new Error('Invalid form data');
  }

  const newType = await ProductService.createType({ name });
  revalidatePath('/products');
  return newType;
}

export async function updateProductAction(
  id: number,
  data: { name?: string; price?: string; typeProductId?: number }
) {
  await ProductService.update(id, data);
  revalidatePath('/products');
}

export async function deleteProductAction(id: number) {
  await ProductService.delete(id);
  revalidatePath('/products');
}
