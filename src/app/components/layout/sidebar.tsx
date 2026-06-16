'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import type { Role } from '@/lib/session';

type NavItem = {
  href: string;
  label: string;
  roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', roles: ['admin'] },
  { href: '/inventory', label: 'Inventario', roles: ['admin', 'inventory_manager'] },
  { href: '/products', label: 'Productos', roles: ['admin', 'inventory_manager', 'cashier'] },
  { href: '/sales', label: 'Ventas', roles: ['admin', 'cashier'] },
  { href: '/sales/history', label: 'Historial', roles: ['admin', 'cashier'] },
  { href: '/users', label: 'Usuarios', roles: ['admin'] },
];

type Props = { role: Role };

export function Sidebar({ role }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      <div className="flex items-center justify-between md:hidden p-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg
                     text-zinc-700 dark:text-zinc-300
                     hover:bg-zinc-100 dark:hover:bg-zinc-700
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                     transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">CF Sales</span>
      </div>

      <aside
        className={cn(
          'fixed z-30 top-0 left-0 h-full w-64 bg-white dark:bg-zinc-900 shadow-md transform transition-transform md:static md:translate-x-0 md:block',
          { '-translate-x-full': !open, 'translate-x-0': open }
        )}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold hidden md:block text-zinc-900 dark:text-zinc-50">CF Sales</h2>
          <nav className="space-y-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                  pathname === item.href && 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
