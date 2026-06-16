import { SaleHistory } from '@/models/sale.model';

type Props = {
  sales: SaleHistory[];
};

export function HistoryTable({ sales }: Props) {
  if (!sales.length) {
    return <p className="text-zinc-400 dark:text-zinc-500 text-sm py-6">No hay ventas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
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
            <tr key={sale.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800/50 align-top transition-colors">
              <td className="py-2.5 pr-4 text-zinc-400 dark:text-zinc-500 font-mono text-xs">#{sale.id}</td>
              <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                {new Date(sale.createdAt).toLocaleDateString('es-HN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-2.5 pr-4">
                {sale.items.length === 0 ? (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">—</span>
                ) : (
                  <ul className="space-y-0.5">
                    {sale.items.map((item) => (
                      <li key={item.productName} className="text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold">{item.qty}×</span> {item.productName}
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="py-2.5 pr-4 text-zinc-900 dark:text-zinc-100">L {sale.subTotal.toFixed(2)}</td>
              <td className="py-2.5 pr-4 font-semibold text-zinc-900 dark:text-zinc-50">L {sale.total.toFixed(2)}</td>
              <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400">
                {sale.cashReceived != null
                  ? `L ${Math.max(0, sale.cashReceived - sale.total).toFixed(2)}`
                  : '—'}
              </td>
              <td className="py-2.5 pr-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sale.saleType === 'Contado'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {sale.saleType ?? '—'}
                </span>
              </td>
              <td className="py-2.5 text-zinc-600 dark:text-zinc-400">{sale.paymentMethod ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
