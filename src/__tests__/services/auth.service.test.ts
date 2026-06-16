// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  mockGetByUsername: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockSignSession: vi.fn(),
}));

vi.mock('@/services/user.service', () => ({
  UserService: {
    getByUsername: mocks.mockGetByUsername,
    verifyPassword: mocks.mockVerifyPassword,
  },
}));

vi.mock('@/lib/session', () => ({
  signSession: mocks.mockSignSession,
}));

import { AuthService } from '@/services/auth.service';

const { mockGetByUsername, mockVerifyPassword, mockSignSession } = mocks;

const fakeUser = { id: 1, username: 'admin', password: 'hashed_pw', role: 'admin' };

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when user does not exist', async () => {
    mockGetByUsername.mockResolvedValue(null);
    expect(await AuthService.login('unknown', 'pw')).toBeNull();
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });

  it('returns null when password does not match', async () => {
    mockGetByUsername.mockResolvedValue(fakeUser);
    mockVerifyPassword.mockResolvedValue(false);
    expect(await AuthService.login('admin', 'wrong')).toBeNull();
    expect(mockSignSession).not.toHaveBeenCalled();
  });

  it('returns a signed JWT token on valid credentials', async () => {
    mockGetByUsername.mockResolvedValue(fakeUser);
    mockVerifyPassword.mockResolvedValue(true);
    mockSignSession.mockResolvedValue('jwt.token.here');

    const token = await AuthService.login('admin', 'correct');

    expect(token).toBe('jwt.token.here');
    expect(mockSignSession).toHaveBeenCalledWith({
      userId: 1,
      username: 'admin',
      role: 'admin',
    });
  });
});
