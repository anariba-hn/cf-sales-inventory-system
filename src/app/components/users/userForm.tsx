'use client';

import { useState, useTransition } from 'react';
import { createUserAction } from '@/actions/user';
import { User } from '@/models/user.model';

const ROLE_LABELS = {
  admin: 'Administrador',
  inventory_manager: 'Gestor de Inventario',
  cashier: 'Cajero',
};

const fieldClass = `
  w-full rounded-lg border border-zinc-300 dark:border-zinc-600
  bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50
  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
  px-3 py-2 text-sm
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
  disabled:cursor-not-allowed disabled:opacity-50
`.trim();

const labelClass = 'text-sm text-zinc-600 dark:text-zinc-400 block mb-1';

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
      if ('error' in result) {
        setError(result.error);
      } else {
        onCreate(result);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Usuario</label>
        <input
          name="username"
          className={fieldClass}
          placeholder="nombre.usuario"
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className={labelClass}>Contraseña</label>
        <input
          name="password"
          type="password"
          className={fieldClass}
          placeholder="Mínimo 6 caracteres"
          required
          disabled={pending}
        />
      </div>
      <div>
        <label className={labelClass}>Rol</label>
        <select name="role" className={fieldClass} required disabled={pending}>
          <option value="">Seleccionar rol</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                   text-white font-medium py-2 rounded-lg text-sm transition-colors
                   disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {pending ? 'Creando...' : 'Crear usuario'}
      </button>
    </form>
  );
}
