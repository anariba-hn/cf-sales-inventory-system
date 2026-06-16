'use client';

import { useState } from 'react';
import { ProductWithCategory } from '@/models/product.model';

type Props = {
  products: ProductWithCategory[];
  onAdd: (product: ProductWithCategory) => void;
};

export function ProductGrid({ products, onAdd }: Props) {
  const categories = Array.from(new Set(products.map((p) => p.category ?? 'Sin categoría')));
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? '');

  const filtered = products.filter(
    (p) => (p.category ?? 'Sin categoría') === activeCategory
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              activeCategory === cat
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => onAdd(product)}
            className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-left
                       bg-white dark:bg-zinc-800
                       hover:border-indigo-400 dark:hover:border-indigo-500
                       hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                       active:scale-95 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <p className="font-medium text-sm leading-tight text-zinc-900 dark:text-zinc-50">
              {product.name}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
              L {product.price.toFixed(2)}
            </p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-zinc-400 dark:text-zinc-500 text-sm py-4">
            No hay productos en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
