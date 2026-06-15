'use client';

import { useState, useEffect, useTransition } from 'react';
import { updateProductAction } from '@/actions/product';
import { getCategoriesAction } from '@/actions/category';
import { Category } from '@/models/category.model';

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    categoryId: number | null;
  };
  onDone: () => void;
};

export function ProductEditForm({ product, onDone }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(product.categoryId?.toString() ?? '');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getCategoriesAction().then(setCategories);
  }, []);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const id = Number(formData.get('id'));
      const name = formData.get('name')?.toString();
      const price = formData.get('price')?.toString();
      const categoryIdRaw = formData.get('categoryId')?.toString();
      const categoryId = categoryIdRaw ? Number(categoryIdRaw) : undefined;
      await updateProductAction(id, { name, price, categoryId });
      onDone();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 border p-4">
      <input type="hidden" name="id" value={product.id} />
      <input name="name" defaultValue={product.name} className="border p-2 w-full" />
      <input name="price" type="number" defaultValue={product.price} className="border p-2 w-full" />
      <select
        name="categoryId"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">Sin categoría</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <button type="submit" className="bg-yellow-500 text-white p-2 rounded" disabled={pending}>
        {pending ? 'Actualizando...' : 'Actualizar'}
      </button>
      <button type="button" onClick={onDone} className="ml-2 p-2" disabled={pending}>
        Cancelar
      </button>
    </form>
  );
}
