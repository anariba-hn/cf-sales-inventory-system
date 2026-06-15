import type { Role } from '@/lib/session';

export interface User {
  id: number;
  username: string;
  role: Role;
  createdAt: Date;
}
