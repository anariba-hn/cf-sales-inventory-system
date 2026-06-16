import { SignJWT, jwtVerify } from 'jose';

export type Role = 'admin' | 'inventory_manager' | 'cashier';

export interface SessionPayload {
  userId: number;
  username: string;
  role: Role;
}

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'cf-sales-dev-secret-change-in-production-32ch'
  );

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const ROLE_HOME: Record<Role, string> = {
  admin: '/dashboard',
  inventory_manager: '/inventory',
  cashier: '/sales',
};
