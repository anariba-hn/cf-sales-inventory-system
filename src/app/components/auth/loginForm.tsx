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
    <form action={handleSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 space-y-5">
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
          Usuario
        </label>
        <input
          name="username"
          aria-invalid={!!error}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50
                     placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     px-3 py-2.5 text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                     disabled:cursor-not-allowed disabled:opacity-50
                     aria-[invalid=true]:border-red-500"
          placeholder="admin"
          required
          disabled={pending}
          autoComplete="username"
          autoFocus
        />
      </div>
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          aria-invalid={!!error}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600
                     bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50
                     placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                     px-3 py-2.5 text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
                     disabled:cursor-not-allowed disabled:opacity-50
                     aria-[invalid=true]:border-red-500"
          placeholder="••••••••"
          required
          disabled={pending}
          autoComplete="current-password"
        />
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
                   text-white font-medium py-2.5 rounded-lg transition-colors
                   disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {pending ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
