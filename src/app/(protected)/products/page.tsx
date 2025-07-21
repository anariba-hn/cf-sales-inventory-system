import { ProductFrom } from '@/app/components/product/productForm';
import { ProductList } from '@/app/components/product/productList';
import { ProductTypeForm } from '@/app/components/product/productTypeForm';

export default function Products() {
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Productos</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Crear tipo de producto</h2>
        <ProductTypeForm />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Crear nuevo producto</h2>
        <ProductFrom />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Lista de productos</h2>
        <ProductList />
      </section>
    </div>
  );
}
