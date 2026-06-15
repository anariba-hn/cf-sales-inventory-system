import { logoutAction } from '@/actions/auth';
import { LogOut } from 'lucide-react';

type Props = { username: string };

export function Header({ username }: Props) {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b bg-white">
      <h1 className="text-base font-semibold text-gray-700 hidden md:block">
        CF Inventory Sale System
      </h1>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-gray-500">
          Hola, <strong className="text-gray-700">{username}</strong>
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
