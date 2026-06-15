'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { verifySession, ROLE_HOME } from '@/lib/session';

export async function loginAction(formData: FormData): Promise<{ error: string } | void> {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Credenciales requeridas' };

  const token = await AuthService.login(username, password);
  if (!token) return { error: 'Usuario o contraseña incorrectos' };

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });

  const session = await verifySession(token);
  redirect(ROLE_HOME[session!.role]);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}

export async function getSessionAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}
