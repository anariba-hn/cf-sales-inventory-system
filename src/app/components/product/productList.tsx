'use client';
import { ProductWithType } from '@/models/product.model';
import { useState } from 'react';
import { deleteProductAction } from '@/actions/product';
import { ProductEditForm } from './productEditForm';

type ProductListProps = {
  productWithType: ProductWithType[];
  onDelete?: (id: number) => void;
  onEditDone?: () => void;
};

export function ProductList({ productWithType, onDelete, onEditDone }: ProductListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    await deleteProductAction(id);
    setEditingId(null);
    if (onDelete) {
      onDelete(id);
    }
  }

  function handleEditDone() {
    setEditingId(null);
    if (onEditDone) {
      onEditDone();
    }
  }

  return (
    <div className="space-y-4">
      {productWithType.map((product) =>
        editingId === product.id ? (
          <ProductEditForm key={product.id} product={product} onDone={handleEditDone} />
        ) : (
          <div key={product.id} className="border p-3 flex justify-between items-center rounded">
            <div>
              <strong>{product.name}</strong> - ${product.price} ({product.type ?? 'Sin tipo'})
            </div>
            <div className="space-x-2">
              <button onClick={() => setEditingId(product.id)} className="text-blue-600">
                Editar
              </button>
              <button onClick={() => handleDelete(product.id)} className="text-red-600">
                Eliminar
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
