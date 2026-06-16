// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { signSession, verifySession, ROLE_HOME, type SessionPayload } from '@/lib/session';

const payload: SessionPayload = { userId: 1, username: 'admin', role: 'admin' };

describe('signSession / verifySession', () => {
  it('roundtrip: signed token verifies back to original payload', async () => {
    const token = await signSession(payload);
    const result = await verifySession(token);
    expect(result).toMatchObject(payload);
  });

  it('returns null for a tampered token', async () => {
    const token = await signSession(payload);
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(await verifySession(tampered)).toBeNull();
  });

  it('returns null for a completely invalid string', async () => {
    expect(await verifySession('not.a.jwt')).toBeNull();
  });

  it('returns null for an empty string', async () => {
    expect(await verifySession('')).toBeNull();
  });
});

describe('ROLE_HOME', () => {
  it('maps admin to /dashboard', () => {
    expect(ROLE_HOME.admin).toBe('/dashboard');
  });

  it('maps inventory_manager to /inventory', () => {
    expect(ROLE_HOME.inventory_manager).toBe('/inventory');
  });

  it('maps cashier to /sales', () => {
    expect(ROLE_HOME.cashier).toBe('/sales');
  });

  it('covers all roles', () => {
    const roles: Array<keyof typeof ROLE_HOME> = ['admin', 'inventory_manager', 'cashier'];
    for (const role of roles) {
      expect(ROLE_HOME[role]).toBeTruthy();
    }
  });
});
