'use client';

import { useState, useEffect, useTransition } from 'react';
import { updateProductAction } from '@/actions/product';
import { getCategoriesAction } from '@/actions/category';
import { Category } from '@/models/category.model';

const fieldClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

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
      const catId = categoryIdRaw ? Number(categoryIdRaw) : undefined;
      await updateProductAction(id, { name, price, categoryId: catId });
      onDone();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-800">
      <input type="hidden" name="id" value={product.id} />
      <input
        name="name"
        defaultValue={product.name}
        className={fieldClass}
        disabled={pending}
      />
      <input
        name="price"
        type="number"
        step="0.01"
        defaultValue={product.price}
        className={fieldClass}
        disabled={pending}
      />
      <select
        name="categoryId"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className={fieldClass}
        disabled={pending}
      >
        <option value="">Sin categoría</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500
                     text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors
                     disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {pending ? 'Actualizando...' : 'Actualizar'}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="py-2 px-4 rounded-lg text-sm font-medium
                     text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700
                     transition-colors disabled:opacity-50
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
