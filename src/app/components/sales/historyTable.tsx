'use client';

import { SaleHistory } from '@/models/sale.model';

type Props = {
  sales: SaleHistory[];
};

export function HistoryTable({ sales }: Props) {
  if (!sales.length) {
    return <p className="text-gray-400 text-sm py-6">No hay ventas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Fecha</th>
            <th className="py-2 pr-4 font-medium">Productos</th>
            <th className="py-2 pr-4 font-medium">Subtotal</th>
            <th className="py-2 pr-4 font-medium">Total</th>
            <th className="py-2 pr-4 font-medium">Vuelto</th>
            <th className="py-2 pr-4 font-medium">Tipo</th>
            <th className="py-2 font-medium">Pago</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b hover:bg-gray-50">
              <td className="py-2.5 pr-4 text-gray-400 font-mono text-xs">#{sale.id}</td>
              <td className="py-2.5 pr-4 text-gray-600">
                {new Date(sale.createdAt).toLocaleDateString('es-HN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-2.5 pr-4">
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {sale.itemCount} {sale.itemCount === 1 ? 'producto' : 'productos'}
                </span>
              </td>
              <td className="py-2.5 pr-4">L {sale.subTotal.toFixed(2)}</td>
              <td className="py-2.5 pr-4 font-semibold">L {sale.total.toFixed(2)}</td>
              <td className="py-2.5 pr-4 text-green-600">
                {sale.cashReceived != null
                  ? `L ${Math.max(0, sale.cashReceived - sale.total).toFixed(2)}`
                  : '—'}
              </td>
              <td className="py-2.5 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  sale.saleType === 'Contado'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {sale.saleType ?? '—'}
                </span>
              </td>
              <td className="py-2.5 text-gray-600">{sale.paymentMethod ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
