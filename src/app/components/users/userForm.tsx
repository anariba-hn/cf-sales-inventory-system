'use client';

import { useState, useTransition } from 'react';
import { createUserAction } from '@/actions/user';
import { User } from '@/models/user.model';

const ROLE_LABELS = {
  admin: 'Administrador',
  inventory_manager: 'Gestor de Inventario',
  cashier: 'Cajero',
};

type Props = {
  onCreate: (user: User) => void;
};

export function UserForm({ onCreate }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await createUserAction(formData);
      if (result && 'error' in result) {
        setError(result.error);
      } else if (result) {
        onCreate(result as unknown as User);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 block mb-1">Usuario</label>
        <input
          name="username"
          className="border p-2 w-full rounded text-sm"
          placeholder="nombre.usuario"
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className="text-sm text-gray-600 block mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          className="border p-2 w-full rounded text-sm"
          placeholder="Mínimo 6 caracteres"
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className="text-sm text-gray-600 block mb-1">Rol</label>
        <select name="role" className="border p-2 w-full rounded text-sm" required disabled={pending}>
          <option value="">Seleccionar rol</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  );
}
