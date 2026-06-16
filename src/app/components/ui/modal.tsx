'use client';

import { useEffect, useId } from 'react';
import { X } from 'lucide-react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl
                   border border-zinc-200 dark:border-zinc-700
                   w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
          <h2 id={titleId} className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="size-10 flex items-center justify-center rounded-lg
                       text-zinc-400 dark:text-zinc-500
                       hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                       transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 text-zinc-900 dark:text-zinc-100">{children}</div>
      </div>
    </div>
  );
}
