'use client';

import { useState, useTransition } from 'react';
import { createCategoryAction } from '@/actions/category';
import { Category } from '@/models/category.model';

const inputClass = `
  flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

type Props = {
  onCreate: (category: Category) => void;
};

export function CategoryForm({ onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createCategoryAction(formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      onCreate(result);
      setName('');
    });
  };

  return (
    <div className="space-y-2">
      <form action={handleSubmit} className="flex gap-2">
        <input
          name="name"
          placeholder="Nombre de categoría"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                     text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors
                     disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {pending ? 'Guardando...' : 'Agregar'}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
