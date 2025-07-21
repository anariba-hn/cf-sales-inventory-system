'use client';

import { useState, useEffect } from 'react';
import { ProductFrom } from '@/app/components/product/productForm';
import { ProductList } from '@/app/components/product/productList';
import { ProductTypeForm } from '@/app/components/product/productTypeForm';
import { getTypeAction } from '@/actions/product';
import { ProductType } from '@/models/product.model';

export default function Products() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    getTypeAction().then(setProductTypes);
  }, []);

  const handleNewType = (newType: ProductType) => {
    setProductTypes((prev) => [...prev, newType]);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Productos</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Crear tipo de producto</h2>
        <ProductTypeForm onCreate={handleNewType} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Crear nuevo producto</h2>
        <ProductFrom productTypes={productTypes} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Lista de productos</h2>
        <ProductList />
      </section>
    </div>
  );
}
