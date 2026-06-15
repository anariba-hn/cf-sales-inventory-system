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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">CF Sales System</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
