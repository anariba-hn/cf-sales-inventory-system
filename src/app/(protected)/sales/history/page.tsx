'use client';

import { useState, useEffect } from 'react';
import { HistoryTable } from '@/app/components/sales/historyTable';
import { getSaleHistoryAction } from '@/actions/sale';
import { SaleHistory } from '@/models/sale.model';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSaleHistoryAction()
      .then(setSales)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Link
          href="/sales"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Volver
        </Link>
        <h1 className="text-2xl font-bold">Historial de Ventas</h1>
      </div>

      {!loading && sales.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total ventas</p>
            <p className="text-2xl font-bold">{sales.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Ingresos totales</p>
            <p className="text-2xl font-bold">L {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Ticket promedio</p>
            <p className="text-2xl font-bold">
              L {(totalRevenue / sales.length).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <HistoryTable sales={sales} />
      )}
    </div>
  );
}
