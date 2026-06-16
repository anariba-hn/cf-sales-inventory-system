'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductGrid } from '@/app/components/sales/productGrid';
import { Cart, CartItem } from '@/app/components/sales/cart';
import { getProductsAction } from '@/actions/product';
import { getSaleTypesAction, getPaymentMethodsAction } from '@/actions/sale';
import { ProductWithCategory } from '@/models/product.model';
import { SaleType, PaymentMethod } from '@/models/sale.model';
import Link from 'next/link';
import { History } from 'lucide-react';

export default function SalesPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [saleTypes, setSaleTypes] = useState<SaleType[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    Promise.all([
      getProductsAction(),
      getSaleTypesAction(),
      getPaymentMethodsAction(),
    ]).then(([prods, types, methods]) => {
      setProducts(prods);
      setSaleTypes(types);
      setPaymentMethods(methods);
    });
  }, []);

  const handleAdd = useCallback((product: ProductWithCategory) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }, []);

  const handleUpdateQty = useCallback((productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const handleRemove = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const handleSaleComplete = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-60px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Punto de Venta</h1>
        <Link
          href="/sales/history"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border rounded px-3 py-1.5"
        >
          <History size={14} />
          Historial
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 min-h-0">
        {/* Product menu */}
        <div className="border rounded-lg p-4 overflow-hidden flex flex-col">
          <ProductGrid products={products} onAdd={handleAdd} />
        </div>

        {/* Cart + payment */}
        <div className="border rounded-lg p-4 flex flex-col overflow-hidden">
          <Cart
            items={cart}
            saleTypes={saleTypes}
            paymentMethods={paymentMethods}
            onUpdateQty={handleUpdateQty}
            onRemove={handleRemove}
            onSaleComplete={handleSaleComplete}
          />
        </div>
      </div>
    </div>
  );
}
