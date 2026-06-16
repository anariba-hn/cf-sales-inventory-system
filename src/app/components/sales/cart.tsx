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

const selectClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

const inputClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

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
      const result = await createSaleAction({
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

      if ('error' in result) {
        setError(result.error);
        return;
      }

      const changeMsg = isEfectivo && change > 0 ? ` — Vuelto: L ${change.toFixed(2)}` : '';
      setSuccessMsg(`Venta registrada${changeMsg}`);
      setCashReceived('');
      setSaleTypeId('');
      setPaymentMethodId('');
      onSaleComplete();
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Orden actual</h2>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {items.length === 0 ? (
          <p className="text-zinc-400 dark:text-zinc-500 text-sm py-6 text-center">
            Selecciona productos del menú
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 bg-white dark:bg-zinc-800"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{item.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">L {item.price.toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.productId, -1)}
                  aria-label={`Reducir cantidad de ${item.name}`}
                  className="size-8 flex items-center justify-center rounded-md
                             border border-zinc-200 dark:border-zinc-700
                             text-zinc-600 dark:text-zinc-400
                             hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {item.qty}
                </span>
                <button
                  onClick={() => onUpdateQty(item.productId, 1)}
                  aria-label={`Aumentar cantidad de ${item.name}`}
                  className="size-8 flex items-center justify-center rounded-md
                             border border-zinc-200 dark:border-zinc-700
                             text-zinc-600 dark:text-zinc-400
                             hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Plus size={12} />
                </button>
              </div>
              <p className="text-sm font-semibold w-16 text-right text-zinc-900 dark:text-zinc-50">
                L {(item.price * item.qty).toFixed(2)}
              </p>
              <button
                onClick={() => onRemove(item.productId)}
                aria-label={`Eliminar ${item.name} del carrito`}
                className="size-8 flex items-center justify-center rounded-md
                           text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="text-zinc-900 dark:text-zinc-50">L {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span className="text-zinc-900 dark:text-zinc-50">Total</span>
          <span className="text-lg text-zinc-900 dark:text-zinc-50">L {total.toFixed(2)}</span>
        </div>

        <select
          value={saleTypeId}
          onChange={(e) => setSaleTypeId(e.target.value)}
          className={selectClass}
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
          className={selectClass}
          disabled={pending}
        >
          <option value="">Método de pago</option>
          {paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {isEfectivo && (
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Monto recibido (L)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className={inputClass}
              disabled={pending}
            />
            {cashAmount > 0 && (
              <p className={`text-sm font-medium ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                Vuelto: L {change.toFixed(2)}
              </p>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1.5">
            {error}
          </p>
        )}
        {successMsg && (
          <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2 py-1.5">
            ✓ {successMsg}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={pending || !items.length}
          className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600
                     text-white font-medium py-2.5 rounded-lg transition-colors
                     disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {pending ? 'Procesando...' : 'Confirmar venta'}
        </button>
      </div>
    </div>
  );
}
