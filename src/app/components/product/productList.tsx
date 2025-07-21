'use client';
import { ProductWithType } from '@/models/product.model';
import { useEffect, useState } from 'react';
import { getProductsAction, deleteProductAction } from '@/actions/product';
import { ProductEditForm } from './productEditForm';

export function ProductList() {
  const [products, setProducts] = useState<ProductWithType[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    getProductsAction().then(setProducts);
  }, []);

  async function handleDelete(id: number) {
    await deleteProductAction(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEditDone() {
    setEditingId(null);
    getProductsAction().then(setProducts);
  }

  return (
    <div className="space-y-4">
      {products.map((product) =>
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
