import type { Role } from '@/lib/session';

export interface CreateUserDto {
  username: string;
  password: string;
  role: Role;
}
