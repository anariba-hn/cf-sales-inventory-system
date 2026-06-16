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
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => onAdd(product)}
            className="border rounded-lg p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-colors active:scale-95"
          >
            <p className="font-medium text-sm leading-tight">{product.name}</p>
            <p className="text-blue-600 font-semibold mt-1">L {product.price.toFixed(2)}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 text-gray-400 text-sm py-4">
            No hay productos en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
