'use server';

import { UserService } from '@/services/user.service';
import { revalidatePath } from 'next/cache';
import type { Role } from '@/lib/session';
import type { User } from '@/models/user.model';

export async function getUsersAction() {
  return UserService.getAll();
}

export async function createUserAction(formData: FormData): Promise<{ error: string } | User> {
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;
  const role = formData.get('role') as Role;

  if (!username || !password || !role) return { error: 'Todos los campos son requeridos' };
  if (password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' };

  try {
    const result = await UserService.create({ username, password, role });
    revalidatePath('/users');
    return result;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al crear usuario' };
  }
}

export async function deleteUserAction(id: number) {
  await UserService.delete(id);
  revalidatePath('/users');
}
