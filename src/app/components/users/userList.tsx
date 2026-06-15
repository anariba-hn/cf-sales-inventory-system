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
  admin: 'bg-purple-100 text-purple-700',
  inventory_manager: 'bg-blue-100 text-blue-700',
  cashier: 'bg-green-100 text-green-700',
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
    return <p className="text-gray-400 text-sm py-6">No hay usuarios registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Usuario</th>
            <th className="py-2 pr-4 font-medium">Rol</th>
            <th className="py-2 pr-4 font-medium">Creado</th>
            <th className="py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50">
              <td className="py-3 pr-4 font-medium">{u.username}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>
                  {ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(u.createdAt).toLocaleDateString('es-HN')}
              </td>
              <td className="py-3 text-right">
                {u.id !== currentUserId ? (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={pending}
                    className="text-red-400 hover:text-red-600 disabled:opacity-40"
                    title="Eliminar usuario"
                  >
                    <Trash2 size={15} />
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 italic">tú</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
