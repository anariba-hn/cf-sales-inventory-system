'use client';

import { useTransition } from 'react';
import { deleteUserAction } from '@/actions/user';
import { User } from '@/models/user.model';
import { Trash2 } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  inventory_manager: 'Gestor de Inventario',
  cashier: 'Cajero',
};

const ROLE_COLORS: Record<string, string> = {
  admin:             'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  inventory_manager: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  cashier:           'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
};

type Props = {
  users: User[];
  currentUserId?: number;
  onDelete: (id: number) => void;
};

export function UserList({ users, currentUserId, onDelete }: Props) {
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteUserAction(id);
      onDelete(id);
    });
  };

  if (!users.length) {
    return <p className="text-zinc-400 dark:text-zinc-500 text-sm py-6">No hay usuarios registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-zinc-500 dark:text-zinc-400">
            <th className="py-2 pr-4 font-medium">Usuario</th>
            <th className="py-2 pr-4 font-medium">Rol</th>
            <th className="py-2 pr-4 font-medium">Creado</th>
            <th className="py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{u.username}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                  {ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                {new Date(u.createdAt).toLocaleDateString('es-HN')}
              </td>
              <td className="py-3 text-right">
                {u.id !== currentUserId ? (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={pending}
                    aria-label={`Eliminar usuario ${u.username}`}
                    className="size-9 flex items-center justify-center rounded-lg ml-auto
                               text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400
                               hover:bg-red-50 dark:hover:bg-red-900/20
                               disabled:opacity-40 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">tú</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
