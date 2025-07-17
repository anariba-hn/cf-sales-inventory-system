'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/sales', label: 'Sales' },
  { href: '/products', label: 'Products' },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setOpen(false); // Close sidebar on mobile when link is clicked
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="flex items-center justify-between md:hidden p-4 border-b">
        <button onClick={() => setOpen(!open)} className="text-gray-700">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-lg font-bold">My App</span>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed z-30 top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform md:static md:translate-x-0 md:block',
          {
            '-translate-x-full': !open,
            'translate-x-0': open,
          }
        )}
      >
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Menu</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'block text-gray-800 hover:text-black',
                  pathname === item.href && 'font-semibold text-blue-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
