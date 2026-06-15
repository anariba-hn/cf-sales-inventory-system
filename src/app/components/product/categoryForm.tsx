'use client';

import { useState, useTransition } from 'react';
import { createCategoryAction } from '@/actions/category';
import { Category } from '@/models/category.model';

type Props = {
  onCreate: (category: Category) => void;
};

export function CategoryForm({ onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const newCategory = await createCategoryAction(formData);
      if (newCategory) {
        onCreate(newCategory);
        setName('');
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex gap-2">
      <input
        name="name"
        placeholder="Nombre de categoría"
        className="border p-2 flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={pending}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={pending}>
        {pending ? 'Guardando...' : 'Agregar'}
      </button>
    </form>
  );
}
