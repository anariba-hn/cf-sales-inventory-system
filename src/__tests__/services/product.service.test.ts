// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockReturning = vi.fn();
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  const mockDelete = vi.fn();
  return { mockWhere, mockFrom, mockSelect, mockReturning, mockValues, mockInsert, mockDelete };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    delete: mocks.mockDelete,
  },
}));
vi.mock('@/db/schema', () => ({ product: {}, category: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

import { ProductService } from '@/services/product.service';

const { mockWhere, mockFrom, mockSelect, mockReturning, mockInsert, mockDelete } = mocks;

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
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
