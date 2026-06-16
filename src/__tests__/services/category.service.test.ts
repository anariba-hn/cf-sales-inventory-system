// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockUpdateReturning = vi.fn();
  const mockUpdateWhere = vi.fn(() => ({ returning: mockUpdateReturning }));
  const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));
  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  return {
    mockWhere, mockFrom, mockSelect,
    mockReturning, mockValues, mockInsert,
    mockUpdateReturning, mockUpdateWhere, mockSet, mockUpdate,
    mockDeleteWhere, mockDelete,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    update: mocks.mockUpdate,
    delete: mocks.mockDelete,
  },
}));
vi.mock('@/db/schema', () => ({ category: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

import { CategoryService } from '@/services/category.service';

const {
  mockWhere, mockFrom,
  mockReturning, mockInsert,
  mockUpdateReturning,
  mockDeleteWhere, mockDelete,
} = mocks;

describe('CategoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  describe('getAll', () => {
    it('returns all categories', async () => {
      const cats = [{ id: 1, name: 'Baleadas' }, { id: 2, name: 'Almuerzos' }];
      mockFrom.mockResolvedValueOnce(cats);
      expect(await CategoryService.getAll()).toEqual(cats);
    });
  });

  describe('create', () => {
    it('throws when category name already exists', async () => {
      mockWhere.mockResolvedValue([{ id: 1, name: 'Baleadas' }]);
      await expect(CategoryService.create({ name: 'Baleadas' })).rejects.toThrow(
        'Category "Baleadas" already exists'
      );
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('inserts and returns the new category', async () => {
      mockWhere.mockResolvedValue([]);
      mockReturning.mockResolvedValue([{ id: 3, name: 'Sopas' }]);
      const result = await CategoryService.create({ name: 'Sopas' });
      expect(result).toEqual({ id: 3, name: 'Sopas' });
      expect(mockInsert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('returns null when category does not exist', async () => {
      mockUpdateReturning.mockResolvedValue([]);
      expect(await CategoryService.update(99, { name: 'X' })).toBeNull();
    });

    it('returns the updated category', async () => {
      mockUpdateReturning.mockResolvedValue([{ id: 1, name: 'Baleadas v2' }]);
      expect(await CategoryService.update(1, { name: 'Baleadas v2' })).toEqual({
        id: 1,
        name: 'Baleadas v2',
      });
    });
  });

  describe('delete', () => {
    it('returns true when a row was deleted', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 1 });
      expect(await CategoryService.delete(1)).toBe(true);
    });

    it('returns false when no row matched', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 0 });
      expect(await CategoryService.delete(99)).toBe(false);
    });

    it('returns false when rowCount is null', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: null });
      expect(await CategoryService.delete(1)).toBe(false);
    });
  });
});
