// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockLeftJoin = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
  const mockDeleteWhere = vi.fn();
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  return {
    mockWhere, mockLeftJoin, mockFrom, mockSelect,
    mockReturning, mockInsert,
    mockDeleteWhere, mockDelete,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
    delete: mocks.mockDelete,
  },
}));
vi.mock('@/db/schema', () => ({ recipeItem: {}, ingredient: {} }));
vi.mock('drizzle-orm', () => ({ eq: vi.fn() }));

import { RecipeService } from '@/services/recipe.service';

const { mockWhere, mockLeftJoin, mockFrom, mockReturning, mockInsert, mockDeleteWhere, mockDelete } =
  mocks;

describe('RecipeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLeftJoin.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockFrom.mockReturnValue({ leftJoin: mockLeftJoin, where: mockWhere });
  });

  describe('getByProduct', () => {
    it('returns an empty array when the product has no recipe items', async () => {
      mockWhere.mockResolvedValue([]);
      expect(await RecipeService.getByProduct(1)).toEqual([]);
    });

    it('maps null ingredientName and ingredientSKU to empty strings', async () => {
      mockWhere.mockResolvedValue([
        { id: 1, productId: 1, ingredientId: 5, ingredientName: null, ingredientSKU: null, qty: '1.5', unit: 'pound' },
      ]);
      const result = await RecipeService.getByProduct(1);
      expect(result[0].ingredientName).toBe('');
      expect(result[0].ingredientSKU).toBe('');
    });

    it('coerces qty string to number', async () => {
      mockWhere.mockResolvedValue([
        { id: 2, productId: 1, ingredientId: 3, ingredientName: 'Tortilla', ingredientSKU: 'T-001', qty: '2.50', unit: 'unit' },
      ]);
      const result = await RecipeService.getByProduct(1);
      expect(result[0].qty).toBe(2.5);
      expect(typeof result[0].qty).toBe('number');
    });
  });

  describe('addItem', () => {
    it('inserts and returns the new recipe item', async () => {
      const newItem = { id: 10, productId: 1, ingredientId: 3, qty: '2.00', unit: 'unit' };
      mockReturning.mockResolvedValue([newItem]);

      const result = await RecipeService.addItem({
        productId: 1,
        ingredientId: 3,
        qty: '2.00',
        unit: 'unit',
      });

      expect(result).toEqual(newItem);
      expect(mockInsert).toHaveBeenCalledOnce();
    });
  });

  describe('removeItem', () => {
    it('calls delete with the given id', async () => {
      mockDeleteWhere.mockResolvedValue(undefined);
      await RecipeService.removeItem(5);
      expect(mockDelete).toHaveBeenCalledOnce();
      expect(mockDeleteWhere).toHaveBeenCalledOnce();
    });
  });
});
