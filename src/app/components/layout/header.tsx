import { logoutAction } from '@/actions/auth';
import { LogOut } from 'lucide-react';

type Props = { username: string };

export function Header({ username }: Props) {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <h1 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 hidden md:block">
        CF Inventory Sale System
      </h1>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Hola, <strong className="text-zinc-700 dark:text-zinc-200">{username}</strong>
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 min-h-[44px] px-2 text-sm
                       text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
