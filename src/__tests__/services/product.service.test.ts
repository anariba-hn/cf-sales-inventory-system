// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockLeftJoin = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDelete = vi.fn();
  const mockUpdateReturning = vi.fn();
  const mockUpdateWhere = vi.fn(() => ({ returning: mockUpdateReturning }));
  const mockSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockSet }));
  return {
    mockWhere, mockLeftJoin, mockFrom, mockSelect,
    mockReturning, mockValues, mockInsert,
    mockDelete,
    mockUpdateReturning, mockUpdateWhere, mockSet, mockUpdate,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    delete: mocks.mockDelete,
    update: mocks.mockUpdate,
  },
}));
vi.mock('@/db/schema', () => ({ product: {}, category: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

import { ProductService } from '@/services/product.service';

const {
  mockWhere, mockLeftJoin, mockFrom, mockSelect,
  mockReturning, mockInsert, mockDelete,
  mockUpdateReturning,
} = mocks;

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  describe('getAll', () => {
    it('returns all products with category name and numeric price', async () => {
      const rows = [
        { id: 1, name: 'Baleada sencilla', price: '25.00', categoryId: 1, category: 'Baleadas' },
        { id: 2, name: 'Almuerzo típico', price: '60.50', categoryId: 2, category: 'Almuerzos' },
      ];
      mockLeftJoin.mockResolvedValueOnce(rows);
      const result = await ProductService.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].price).toBe(25);
      expect(result[1].price).toBe(60.5);
      expect(result[0].category).toBe('Baleadas');
    });
  });

  describe('getById', () => {
    it('returns null when product is not found', async () => {
      mockWhere.mockResolvedValue([]);
      expect(await ProductService.getById(999)).toBeNull();
    });

    it('returns the product with a numeric price', async () => {
      mockWhere.mockResolvedValue([
        { id: 1, name: 'Baleada sencilla', price: '25.50', categoryId: 2 },
      ]);
      const result = await ProductService.getById(1);
      expect(result).not.toBeNull();
      expect(result!.price).toBe(25.5);
      expect(typeof result!.price).toBe('number');
    });
  });

  describe('create', () => {
    it('throws when the category does not exist', async () => {
      mockWhere.mockResolvedValue([]);

      await expect(
        ProductService.create({ name: 'Baleada', price: '25.00', categoryId: 99 })
      ).rejects.toThrow('Category ID 99 does not exist');

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('inserts and returns the new product when category exists', async () => {
      mockWhere.mockResolvedValue([{ id: 2, name: 'Baleadas' }]);
      mockReturning.mockResolvedValue([
        { id: 10, name: 'Baleada sencilla', price: '25.00', categoryId: 2 },
      ]);

      const result = await ProductService.create({
        name: 'Baleada sencilla',
        price: '25.00',
        categoryId: 2,
      });

      expect(result.id).toBe(10);
      expect(result.price).toBe(25);
      expect(mockInsert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('returns null when product does not exist', async () => {
      mockUpdateReturning.mockResolvedValue([]);
      expect(await ProductService.update(99, { name: 'X' })).toBeNull();
    });

    it('returns the updated product with numeric price', async () => {
      mockUpdateReturning.mockResolvedValue([
        { id: 1, name: 'Baleada con todo', price: '30.00', categoryId: 1 },
      ]);
      const result = await ProductService.update(1, { name: 'Baleada con todo' });
      expect(result!.price).toBe(30);
      expect(result!.name).toBe('Baleada con todo');
    });
  });

  describe('delete', () => {
    it('returns true when a row was deleted', async () => {
      mockDelete.mockReturnValue({ where: vi.fn().mockResolvedValue({ rowCount: 1 }) });
      expect(await ProductService.delete(1)).toBe(true);
    });

    it('returns false when no row was deleted', async () => {
      mockDelete.mockReturnValue({ where: vi.fn().mockResolvedValue({ rowCount: 0 }) });
      expect(await ProductService.delete(999)).toBe(false);
    });

    it('returns false when rowCount is null', async () => {
      mockDelete.mockReturnValue({ where: vi.fn().mockResolvedValue({ rowCount: null }) });
      expect(await ProductService.delete(1)).toBe(false);
    });
  });
});
