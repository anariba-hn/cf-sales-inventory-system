'use client';

import { useState, useTransition } from 'react';
import { createProductAction } from '@/actions/product';
import { ProductType, ProductWithType } from '@/models/product.model';

type ProductFormProps = {
  productTypes: ProductType[];
  onCreate: (newProduct: ProductWithType) => void;
};

export function ProductForm({ productTypes, onCreate }: ProductFormProps) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [typeProductId, setTypeProductId] = useState('');

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const newProduct = await createProductAction(formData);
      if (newProduct) {
        onCreate(newProduct);
        setName('');
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
        name="typeProductId"
        className="border p-2 w-full"
        value={typeProductId}
        onChange={(e) => setTypeProductId(e.target.value)}
        required
        disabled={pending}
      >
        {productTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        {pending ? 'Creando...' : 'Crear producto'}
      </button>
    </form>
  );
}
