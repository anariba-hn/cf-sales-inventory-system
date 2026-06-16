'use client';

import { useState, useTransition } from 'react';
import { createProductAction } from '@/actions/product';
import { Category } from '@/models/category.model';
import { ProductWithCategory } from '@/models/product.model';

const fieldClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

type Props = {
  categories: Category[];
  onCreate: (product: ProductWithCategory) => void;
};

export function ProductForm({ categories, onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createProductAction(formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      onCreate(result);
      setName('');
      setPrice('');
    });
  };

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nombre del producto"
          className={fieldClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={pending}
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Precio"
          className={fieldClass}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          disabled={pending}
        />
        <select
          name="categoryId"
          className={fieldClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          disabled={pending}
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                     text-white font-medium py-2 rounded-lg text-sm transition-colors
                     disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {pending ? 'Creando...' : 'Crear producto'}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
