'use client';

import { useState, useTransition } from 'react';
import { loginAction } from '@/actions/auth';

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = (formData: FormData) => {
    setError('');
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <form action={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Usuario</label>
        <input
          name="username"
          className="border rounded p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="admin"
          required
          disabled={pending}
          autoComplete="username"
          autoFocus
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
        <input
          name="password"
          type="password"
          className="border rounded p-2.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          required
          disabled={pending}
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded transition-colors disabled:opacity-50"
      >
        {pending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
