'use client';

import { useState } from 'react';
import { createProductAction, getProductsAction } from '@/actions/product';
import { useEffect } from 'react';

export function ProductFrom() {
  const [productTypes, setProductTypes] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    getProductsAction().then(setProductTypes);
  }, []);

  return (
    <form action={createProductAction} className="space-y-4">
      <input name="name" placeholder="Nombre del producto" className="border p-2 w-full" />
      <input name="price" type="number" placeholder="Precio" className="border p-2 w-full" />
      <select name="typeProductId" className="border p-2 w-full">
        {productTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Crear producto
      </button>
    </form>
  );
}
