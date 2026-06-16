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
      <div className="flex items-center justify-between md:hidden p-4 border-b">
        <button onClick={() => setOpen(!open)} className="text-gray-700">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-lg font-bold">CF Sales</span>
      </div>

      <aside
        className={cn(
          'fixed z-30 top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform md:static md:translate-x-0 md:block',
          { '-translate-x-full': !open, 'translate-x-0': open }
        )}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold hidden md:block">CF Sales</h2>
          <nav className="space-y-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded text-sm text-gray-700 hover:bg-gray-100',
                  pathname === item.href && 'bg-blue-50 text-blue-600 font-semibold'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
