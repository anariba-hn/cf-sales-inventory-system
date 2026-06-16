import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, ROLE_HOME } from '@/lib/session';
import { LoginForm } from '@/app/components/auth/loginForm';

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (token) {
    const session = await verifySession(token);
    if (session) redirect(ROLE_HOME[session.role]);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">CF Sales System</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
