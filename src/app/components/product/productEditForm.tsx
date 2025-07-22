'use client';

import { updateProductAction } from '@/actions/product';
import { useState, useEffect } from 'react';
import { getTypeAction } from '@/actions/product';
import { ProductType } from '@/models/product.model';

type Props = {
  product: {
    id: number;
    name: string;
    price: number;
    typeProductId: number | null;
  };
  onDone: () => void;
};

export function ProductEditForm({ product, onDone }: Props) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    getTypeAction().then(setProductTypes);
  }, []);

  return (
    <form
      action={async (formData) => {
        const id = Number(formData.get('id'));
        const name = formData.get('name')?.toString();
        const price = formData.get('price')?.toString();
        const typeProductIdRaw = formData.get('typeProductId')?.toString();
        const typeProductId = typeProductIdRaw ? Number(typeProductIdRaw) : undefined;

        await updateProductAction(id, { name, price, typeProductId });

        onDone();
      }}
      className="space-y-4 border p-4"
    >
      <input type="hidden" name="id" value={product.id} />
      <input name="name" defaultValue={product.name} className="border p-2 w-full" />
      <input
        name="price"
        type="number"
        defaultValue={product.price}
        className="border p-2 w-full"
      />
      <select
        name="typeProductId"
        defaultValue={product.typeProductId ?? ''}
        className="border p-2 w-full"
      >
        <option value="">Sin tipo</option>
        {productTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>

      <button type="submit" className="bg-yellow-500 text-white p-2 rounded">
        Actualizar
      </button>
      <button type="button" onClick={onDone} className="ml-2 p-2">
        Cancelar
      </button>
    </form>
  );
}
