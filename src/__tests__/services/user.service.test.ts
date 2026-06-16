// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  const mockBcryptHash = vi.fn();
  const mockBcryptCompare = vi.fn();
  return {
    mockWhere, mockFrom, mockSelect,
    mockReturning, mockValues, mockInsert,
    mockDeleteWhere, mockDelete,
    mockBcryptHash, mockBcryptCompare,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    delete: mocks.mockDelete,
  },
}));
vi.mock('@/db/schema', () => ({ user: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));
vi.mock('bcryptjs', () => ({
  default: {
    hash: mocks.mockBcryptHash,
    compare: mocks.mockBcryptCompare,
  },
}));

import { UserService } from '@/services/user.service';

const {
  mockWhere, mockFrom,
  mockReturning, mockInsert,
  mockDeleteWhere,
  mockBcryptHash, mockBcryptCompare,
} = mocks;

const fakeUserRow = {
  id: 1,
  username: 'juan',
  password: 'hashed_pw',
  role: 'cashier',
  createdAt: new Date(),
};

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  describe('getAll', () => {
    it('returns all users mapped to the User model', async () => {
      const rows = [
        { id: 1, username: 'admin', role: 'admin', createdAt: new Date() },
        { id: 2, username: 'juan', role: 'cashier', createdAt: new Date() },
      ];
      mockFrom.mockResolvedValueOnce(rows);
      const result = await UserService.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('admin');
      expect(result[1].role).toBe('cashier');
    });
  });

  describe('getByUsername', () => {
    it('returns null when user is not found', async () => {
      mockWhere.mockResolvedValue([]);
      expect(await UserService.getByUsername('nonexistent')).toBeNull();
    });

    it('returns the user row when found', async () => {
      mockWhere.mockResolvedValue([fakeUserRow]);
      const result = await UserService.getByUsername('juan');
      expect(result).toEqual(fakeUserRow);
    });
  });

  describe('create', () => {
    it('throws when username already exists', async () => {
      mockWhere.mockResolvedValue([fakeUserRow]);
      await expect(
        UserService.create({ username: 'juan', password: 'pw', role: 'cashier' })
      ).rejects.toThrow('El usuario "juan" ya existe');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('hashes the password and returns the user without password field', async () => {
      mockWhere.mockResolvedValue([]);
      mockBcryptHash.mockResolvedValue('hashed_pw');
      mockReturning.mockResolvedValue([fakeUserRow]);

      const result = await UserService.create({ username: 'juan', password: 'plain', role: 'cashier' });

      expect(mockBcryptHash).toHaveBeenCalledWith('plain', 10);
      expect(result.id).toBe(1);
      expect(result.username).toBe('juan');
      expect(result.role).toBe('cashier');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('delete', () => {
    it('returns true when the user was deleted', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 1 });
      expect(await UserService.delete(1)).toBe(true);
    });

    it('returns false when no user matched', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 0 });
      expect(await UserService.delete(99)).toBe(false);
    });
  });

  describe('verifyPassword', () => {
    it('returns true when password matches the hash', async () => {
      mockBcryptCompare.mockResolvedValue(true);
      expect(await UserService.verifyPassword('plain', 'hashed')).toBe(true);
    });

    it('returns false when password does not match', async () => {
      mockBcryptCompare.mockResolvedValue(false);
      expect(await UserService.verifyPassword('wrong', 'hashed')).toBe(false);
    });
  });
});
