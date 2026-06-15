'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/modal';
import { CategoryForm } from '@/app/components/product/categoryForm';
import { ProductForm } from '@/app/components/product/productForm';
import { ProductEditForm } from '@/app/components/product/productEditForm';
import { ProductList } from '@/app/components/product/productList';
import { RecipeManager } from '@/app/components/product/recipeManager';
import { getCategoriesAction } from '@/actions/category';
import { getProductsAction } from '@/actions/product';
import { Category } from '@/models/category.model';
import { ProductWithCategory } from '@/models/product.model';

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [recipeProduct, setRecipeProduct] = useState<ProductWithCategory | null>(null);

  const loadData = async () => {
    const [cats, prods] = await Promise.all([getCategoriesAction(), getProductsAction()]);
    setCategories(cats);
    setProducts(prods);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50"
          >
            + Categoría
          </button>
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat.id} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <ProductList
        products={products}
        onEdit={setEditingProduct}
        onRecipe={setRecipeProduct}
        onDelete={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
      />

      {showCategoryModal && (
        <Modal title="Nueva categoría" onClose={() => setShowCategoryModal(false)}>
          <CategoryForm
            onCreate={(cat) => {
              setCategories((prev) => [...prev, cat]);
              setShowCategoryModal(false);
            }}
          />
        </Modal>
      )}

      {showProductModal && (
        <Modal title="Nuevo producto" onClose={() => setShowProductModal(false)}>
          <ProductForm
            categories={categories}
            onCreate={(p) => {
              setProducts((prev) => [...prev, p]);
              setShowProductModal(false);
            }}
          />
        </Modal>
      )}

      {editingProduct && (
        <Modal title="Editar producto" onClose={() => setEditingProduct(null)}>
          <ProductEditForm
            product={editingProduct}
            onDone={async () => {
              setEditingProduct(null);
              const updated = await getProductsAction();
              setProducts(updated);
            }}
          />
        </Modal>
      )}

      {recipeProduct && (
        <Modal
          title={`Receta — ${recipeProduct.name}`}
          onClose={() => setRecipeProduct(null)}
        >
          <RecipeManager productId={recipeProduct.id} productName={recipeProduct.name} />
        </Modal>
      )}
    </div>
  );
}
