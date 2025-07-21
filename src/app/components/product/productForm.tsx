'use client';

import { createProductAction } from '@/actions/product';
import { ProductType } from '@/models/product.model';

type ProductFormProps = {
  productTypes: ProductType[];
};

export function ProductFrom({ productTypes }: ProductFormProps) {
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
