'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { createSaleAction } from '@/actions/sale';
import { SaleType, PaymentMethod } from '@/models/sale.model';

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
};

type Props = {
  items: CartItem[];
  saleTypes: SaleType[];
  paymentMethods: PaymentMethod[];
  onUpdateQty: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onSaleComplete: () => void;
};

export function Cart({
  items,
  saleTypes,
  paymentMethods,
  onUpdateQty,
  onRemove,
  onSaleComplete,
}: Props) {
  const [saleTypeId, setSaleTypeId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [pending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal;

  const selectedPayment = paymentMethods.find((p) => p.id === Number(paymentMethodId));
  const isEfectivo = selectedPayment?.name === 'Efectivo';
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = isEfectivo ? Math.max(0, cashAmount - total) : 0;

  const handleConfirm = () => {
    setError('');
    setSuccessMsg('');

    if (!items.length) return setError('Agrega al menos un producto');
    if (!saleTypeId) return setError('Selecciona el tipo de venta');
    if (!paymentMethodId) return setError('Selecciona el método de pago');
    if (isEfectivo && cashAmount < total)
      return setError(`El monto recibido (L ${cashAmount.toFixed(2)}) es menor al total`);

    startTransition(async () => {
      try {
        await createSaleAction({
          saleTypeId: Number(saleTypeId),
          paymentMethodId: Number(paymentMethodId),
          subTotal: subtotal.toFixed(2),
          total: total.toFixed(2),
          cashReceived: isEfectivo ? cashReceived : undefined,
          items: items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            unitPrice: i.price.toFixed(2),
          })),
        });

        const changeMsg = isEfectivo && change > 0 ? ` — Vuelto: L ${change.toFixed(2)}` : '';
        setSuccessMsg(`Venta registrada${changeMsg}`);
        setCashReceived('');
        setSaleTypeId('');
        setPaymentMethodId('');
        onSaleComplete();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al procesar la venta');
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold text-gray-700 mb-3">Orden actual</h2>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm py-6 text-center">
            Selecciona productos del menú
          </p>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 border rounded p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">L {item.price.toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.productId, -1)}
                  className="w-6 h-6 flex items-center justify-center rounded border hover:bg-gray-100"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                <button
                  onClick={() => onUpdateQty(item.productId, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded border hover:bg-gray-100"
                >
                  <Plus size={12} />
                </button>
              </div>
              <p className="text-sm font-semibold w-16 text-right">
                L {(item.price * item.qty).toFixed(2)}
              </p>
              <button
                onClick={() => onRemove(item.productId)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + payment */}
      <div className="border-t pt-3 mt-3 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>L {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-lg">L {total.toFixed(2)}</span>
        </div>

        <select
          value={saleTypeId}
          onChange={(e) => setSaleTypeId(e.target.value)}
          className="border p-2 w-full rounded text-sm"
          disabled={pending}
        >
          <option value="">Tipo de venta</option>
          {saleTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={paymentMethodId}
          onChange={(e) => { setPaymentMethodId(e.target.value); setCashReceived(''); }}
          className="border p-2 w-full rounded text-sm"
          disabled={pending}
        >
          <option value="">Método de pago</option>
          {paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {isEfectivo && (
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Monto recibido (L)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="border p-2 w-full rounded text-sm"
              disabled={pending}
            />
            {cashAmount > 0 && (
              <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                Vuelto: L {change.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
            {error}
          </p>
        )}
        {successMsg && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1.5">
            ✓ {successMsg}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={pending || !items.length}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded transition-colors disabled:opacity-40"
        >
          {pending ? 'Procesando...' : 'Confirmar venta'}
        </button>
      </div>
    </div>
  );
}
