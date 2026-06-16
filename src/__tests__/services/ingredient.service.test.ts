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
    mockUpdateReturning, mockSet, mockUpdate,
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
vi.mock('@/db/schema', () => ({ ingredient: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

import { IngredientService } from '@/services/ingredient.service';

const {
  mockWhere, mockFrom,
  mockReturning, mockInsert,
  mockUpdateReturning,
  mockDeleteWhere,
} = mocks;

const fakeRow = {
  id: 1,
  SKU: 'SKU-001',
  name: 'Frijoles',
  costUnit: '5.00',
  costPound: '15.00',
  qtyUnit: 100,
  qtyPound: '2.50',
  outDate: null,
  createdAt: new Date(),
};

describe('IngredientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
  });

  describe('getAll', () => {
    it('maps Postgres numeric strings to numbers', async () => {
      mockFrom.mockResolvedValueOnce([fakeRow]);
      const result = await IngredientService.getAll();
      expect(result[0].costUnit).toBe(5);
      expect(result[0].costPound).toBe(15);
      expect(result[0].qtyPound).toBe(2.5);
      expect(result[0].qtyUnit).toBe(100);
    });

    it('keeps null numeric fields as null', async () => {
      mockFrom.mockResolvedValueOnce([
        { ...fakeRow, costUnit: null, costPound: null, qtyPound: null },
      ]);
      const result = await IngredientService.getAll();
      expect(result[0].costUnit).toBeNull();
      expect(result[0].costPound).toBeNull();
      expect(result[0].qtyPound).toBeNull();
    });
  });

  describe('getById', () => {
    it('returns null when ingredient is not found', async () => {
      mockWhere.mockResolvedValue([]);
      expect(await IngredientService.getById(999)).toBeNull();
    });

    it('returns the ingredient with numeric coercions', async () => {
      mockWhere.mockResolvedValue([fakeRow]);
      const result = await IngredientService.getById(1);
      expect(result).not.toBeNull();
      expect(result!.costUnit).toBe(5);
      expect(result!.costPound).toBe(15);
      expect(result!.qtyPound).toBe(2.5);
    });
  });

  describe('create', () => {
    it('throws when SKU already exists', async () => {
      mockWhere.mockResolvedValue([fakeRow]);
      await expect(
        IngredientService.create({ SKU: 'SKU-001', name: 'Frijoles' })
      ).rejects.toThrow('Ingredient with SKU "SKU-001" already exists');
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('inserts and returns the mapped ingredient', async () => {
      mockWhere.mockResolvedValue([]);
      mockReturning.mockResolvedValue([fakeRow]);
      const result = await IngredientService.create({ SKU: 'SKU-001', name: 'Frijoles' });
      expect(result.costUnit).toBe(5);
      expect(mockInsert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('returns null when ingredient does not exist', async () => {
      mockUpdateReturning.mockResolvedValue([]);
      expect(await IngredientService.update(99, { name: 'X' })).toBeNull();
    });

    it('returns the updated ingredient with numeric coercions', async () => {
      mockUpdateReturning.mockResolvedValue([{ ...fakeRow, name: 'Frijoles Negros' }]);
      const result = await IngredientService.update(1, { name: 'Frijoles Negros' });
      expect(result!.name).toBe('Frijoles Negros');
      expect(result!.costUnit).toBe(5);
    });
  });

  describe('delete', () => {
    it('returns true when a row was deleted', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 1 });
      expect(await IngredientService.delete(1)).toBe(true);
    });

    it('returns false when no row matched', async () => {
      mockDeleteWhere.mockResolvedValue({ rowCount: 0 });
      expect(await IngredientService.delete(99)).toBe(false);
    });
  });
});
