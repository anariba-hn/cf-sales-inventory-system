'use client';

import { useState, useTransition } from 'react';
import { createProductAction } from '@/actions/product';
import { Category } from '@/models/category.model';
import { ProductWithCategory } from '@/models/product.model';

type Props = {
  categories: Category[];
  onCreate: (product: ProductWithCategory) => void;
};

export function ProductForm({ categories, onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const newProduct = await createProductAction(formData);
      if (newProduct) {
        onCreate(newProduct);
        setName('');
        setPrice('');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        name="name"
        placeholder="Nombre del producto"
        className="border p-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={pending}
      />
      <input
        name="price"
        type="number"
        placeholder="Precio"
        className="border p-2 w-full"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        disabled={pending}
      />
      <select
        name="categoryId"
        className="border p-2 w-full"
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
      <button type="submit" className="bg-blue-600 text-white p-2 rounded" disabled={pending}>
        {pending ? 'Creando...' : 'Crear producto'}
      </button>
    </form>
  );
}
