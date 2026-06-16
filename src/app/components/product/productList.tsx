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
    return <p className="text-zinc-400 dark:text-zinc-500 text-sm py-6">No hay productos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
            <th className="py-2 pr-4 font-medium">Producto</th>
            <th className="py-2 pr-4 font-medium">Categoría</th>
            <th className="py-2 pr-4 font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{product.name}</td>
              <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">{product.category ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">L {product.price.toFixed(2)}</td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => onRecipe(product)}
                    title="Gestionar receta"
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300
                               flex items-center gap-1 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    <BookOpen size={14} />
                    <span>Receta</span>
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    title="Editar"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300
                               flex items-center gap-1 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    <Pencil size={14} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={pending}
                    title="Eliminar"
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                               flex items-center gap-1 disabled:opacity-40 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
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
