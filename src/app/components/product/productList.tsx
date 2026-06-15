'use client';

import { useTransition } from 'react';
import { deleteProductAction } from '@/actions/product';
import { ProductWithCategory } from '@/models/product.model';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';

type Props = {
  products: ProductWithCategory[];
  onEdit: (product: ProductWithCategory) => void;
  onRecipe: (product: ProductWithCategory) => void;
  onDelete: (id: number) => void;
};

export function ProductList({ products, onEdit, onRecipe, onDelete }: Props) {
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteProductAction(id);
      onDelete(id);
    });
  };

  if (!products.length) {
    return <p className="text-gray-400 text-sm py-6">No hay productos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Producto</th>
            <th className="py-2 pr-4 font-medium">Categoría</th>
            <th className="py-2 pr-4 font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium">{product.name}</td>
              <td className="py-3 pr-4 text-gray-500">{product.category ?? '—'}</td>
              <td className="py-3 pr-4">L {product.price.toFixed(2)}</td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onRecipe(product)}
                    title="Gestionar receta"
                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                  >
                    <BookOpen size={14} />
                    <span>Receta</span>
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    title="Editar"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Pencil size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={pending}
                    title="Eliminar"
                    className="text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
