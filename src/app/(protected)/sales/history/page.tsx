import { SaleService } from '@/services/sale.service';
import { HistoryTable } from '@/app/components/sales/historyTable';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { HistoryPeriod } from '@/dtos/sale.dto';

const PAGE_SIZE = 15;

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: 'day', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'all', label: 'Todo' },
];

const VALID_PERIODS: HistoryPeriod[] = ['day', 'week', 'month', 'all'];

export default async function SalesHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const period: HistoryPeriod = VALID_PERIODS.includes(params.period as HistoryPeriod)
    ? (params.period as HistoryPeriod)
    : 'day';
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await SaleService.getHistory({ period, page, pageSize: PAGE_SIZE });
  const avgTicket = result.total > 0 ? result.periodRevenue / result.total : 0;

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

      {/* Period filter tabs */}
      <div className="flex gap-1 border rounded-lg p-1 w-fit bg-gray-50">
        {PERIODS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/sales/history?period=${key}&page=1`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Summary cards — reflect the full period, not just current page */}
      {result.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total ventas</p>
            <p className="text-2xl font-bold">{result.total}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Ingresos totales</p>
            <p className="text-2xl font-bold">L {result.periodRevenue.toFixed(2)}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Ticket promedio</p>
            <p className="text-2xl font-bold">L {avgTicket.toFixed(2)}</p>
          </div>
        </div>
      )}

      <HistoryTable sales={result.data} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Página {result.page} de {result.totalPages} &mdash; {result.total} ventas
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/sales/history?period=${period}&page=${page - 1}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
                Anterior
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded opacity-40 cursor-not-allowed">
                <ChevronLeft size={14} />
                Anterior
              </span>
            )}
            {page < result.totalPages ? (
              <Link
                href={`/sales/history?period=${period}&page=${page + 1}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
              >
                Siguiente
                <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded opacity-40 cursor-not-allowed">
                Siguiente
                <ChevronRight size={14} />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
