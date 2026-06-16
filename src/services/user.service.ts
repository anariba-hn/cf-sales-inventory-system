import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto } from '@/dtos/user.dto';
import { User } from '@/models/user.model';
import type { Role } from '@/lib/session';

const toModel = (r: typeof user.$inferSelect): User => ({
  id: r.id,
  username: r.username,
  role: r.role as Role,
  createdAt: r.createdAt,
});

export class UserService {
  static async getAll(): Promise<User[]> {
    const data = await db
      .select({ id: user.id, username: user.username, role: user.role, createdAt: user.createdAt })
      .from(user);
    return data.map((r) => ({ ...r, role: r.role as Role }));
  }

  static async getByUsername(username: string) {
    const [result] = await db.select().from(user).where(eq(user.username, username));
    return result ?? null;
  }

  static async create(data: CreateUserDto): Promise<User> {
    const exists = await db.select().from(user).where(eq(user.username, data.username));
    if (exists.length) throw new Error(`El usuario "${data.username}" ya existe`);
    const hashed = await bcrypt.hash(data.password, 10);
    const [result] = await db
      .insert(user)
      .values({ username: data.username, password: hashed, role: data.role })
      .returning();
    return toModel(result);
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.delete(user).where(eq(user.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  static async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
