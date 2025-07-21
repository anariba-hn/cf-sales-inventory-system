'use client';

import { createProductAction } from '@/actions/product';

export function ProductTypeForm() {
  return (
    <form action={createProductAction} className="space-y-4 mt-6">
      <input
        name="name"
        placeholder="Nombre del tipo de producto"
        className="border p-2 w-full"
        required
      />
      <button type="submit" className="bg-green-600 text-white p-2 rounded">
        Crear tipo de producto
      </button>
    </form>
  );
}
