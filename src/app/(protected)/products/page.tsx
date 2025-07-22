'use client';

import { useState, useEffect } from 'react';
import { ProductForm } from '@/app/components/product/productForm';
import { ProductList } from '@/app/components/product/productList';
import { ProductTypeForm } from '@/app/components/product/productTypeForm';
import { getProductsAction, getTypeAction } from '@/actions/product';
import { ProductType, ProductWithType } from '@/models/product.model';

export default function Products() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [products, setProducts] = useState<ProductWithType[]>([]);

  useEffect(() => {
    Promise.all([
      getTypeAction().then(setProductTypes),
      getProductsAction().then(setProducts),
    ]).catch((e) => {
      console.error('Error fetching data:', e);
    });
  }, []);

  const handleNewType = (newType: ProductType) => {
    setProductTypes((prev) => [...prev, newType]);
  };

  const handleNewProductWithType = (newProduct: ProductWithType) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleProductDeleted = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const refreshProducts = async () => {
    try {
      const updatedProducts = await getProductsAction();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
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
        <ProductForm productTypes={productTypes} onCreate={handleNewProductWithType} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Lista de productos</h2>
        <ProductList
          productWithType={products}
          onDelete={handleProductDeleted}
          onEditDone={refreshProducts}
        />
      </section>
    </div>
  );
}
