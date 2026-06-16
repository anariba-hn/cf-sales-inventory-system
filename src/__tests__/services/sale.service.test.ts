// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockLeftJoin = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockReturning }));
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
  const mockOffset = vi.fn();
  const mockLimit = vi.fn(() => ({ offset: mockOffset }));
  const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
  return {
    mockWhere, mockLeftJoin, mockFrom, mockSelect,
    mockReturning, mockInsertValues, mockInsert,
    mockOffset, mockLimit, mockOrderBy,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.mockSelect,
    insert: mocks.mockInsert,
  },
}));
vi.mock('@/db/schema', () => ({
  sales: {},
  saleItem: {},
  saleType: {},
  paymentMethod: {},
  recipeItem: {},
  ingredient: {},
  product: {},
}));
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  desc: vi.fn(),
  count: vi.fn(),
  sum: vi.fn(),
  gte: vi.fn(),
  sql: vi.fn(),
  inArray: vi.fn(),
}));

import { SaleService } from '@/services/sale.service';
import type { CreateSaleDto } from '@/dtos/sale.dto';

const {
  mockWhere, mockLeftJoin, mockFrom, mockSelect,
  mockReturning, mockInsert,
  mockOffset, mockOrderBy,
} = mocks;

const fakeSaleRow = {
  id: 1,
  saleTypeId: 1,
  paymentMethodId: 1,
  subTotal: '100.00',
  total: '100.00',
  cashReceived: null,
  createdAt: new Date(),
};

describe('SaleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLeftJoin.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  describe('create', () => {
    it('throws when items list is empty', async () => {
      mockReturning.mockResolvedValue([fakeSaleRow]);

      const dto: CreateSaleDto = {
        saleTypeId: 1,
        paymentMethodId: 1,
        subTotal: '100.00',
        total: '100.00',
        items: [],
      };

      await expect(SaleService.create(dto)).rejects.toThrow(
        'La venta debe tener al menos un producto'
      );
      expect(mockInsert).toHaveBeenCalledOnce();
    });
  });

  describe('getById', () => {
    it('returns null when sale is not found', async () => {
      mockWhere.mockResolvedValue([]);
      expect(await SaleService.getById(999)).toBeNull();
    });

    it('returns sale with numeric totals and mapped line items', async () => {
      mockWhere
        .mockResolvedValueOnce([
          {
            id: 1,
            saleType: 'Contado',
            paymentMethod: 'Efectivo',
            subTotal: '150.00',
            total: '150.00',
            cashReceived: '200.00',
            createdAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          { id: 1, productId: 2, productName: 'Baleada con todo', qty: 2, unitPrice: '75.00' },
        ]);

      const result = await SaleService.getById(1);

      expect(result).not.toBeNull();
      expect(result!.subTotal).toBe(150);
      expect(result!.total).toBe(150);
      expect(result!.cashReceived).toBe(200);
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0].lineTotal).toBe(150);
    });

    it('sets cashReceived to null when not provided', async () => {
      mockWhere
        .mockResolvedValueOnce([
          {
            id: 2,
            saleType: 'Crédito',
            paymentMethod: 'Tarjeta',
            subTotal: '80.00',
            total: '80.00',
            cashReceived: null,
            createdAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await SaleService.getById(2);
      expect(result!.cashReceived).toBeNull();
      expect(result!.items).toHaveLength(0);
    });

    it('falls back to empty string for productName when null', async () => {
      mockWhere
        .mockResolvedValueOnce([
          {
            id: 3,
            saleType: 'Contado',
            paymentMethod: 'Efectivo',
            subTotal: '50.00',
            total: '50.00',
            cashReceived: null,
            createdAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          { id: 5, productId: 7, productName: null, qty: 1, unitPrice: '50.00' },
        ]);

      const result = await SaleService.getById(3);
      expect(result!.items[0].productName).toBe('');
    });
  });

  describe('getSaleTypes', () => {
    it('returns all sale types', async () => {
      const types = [{ id: 1, name: 'Contado' }, { id: 2, name: 'Crédito' }];
      mockFrom.mockResolvedValueOnce(types);
      expect(await SaleService.getSaleTypes()).toEqual(types);
    });
  });

  describe('getPaymentMethods', () => {
    it('returns all payment methods', async () => {
      const methods = [{ id: 1, name: 'Efectivo' }, { id: 2, name: 'Tarjeta' }];
      mockFrom.mockResolvedValueOnce(methods);
      expect(await SaleService.getPaymentMethods()).toEqual(methods);
    });
  });

  describe('getHistory', () => {
    it('returns an empty page when there are no sales', async () => {
      mockWhere.mockResolvedValueOnce([{ total: 0, periodRevenue: null }]);
      mockWhere.mockReturnValueOnce({ orderBy: mockOrderBy });
      mockOffset.mockResolvedValue([]);

      const result = await SaleService.getHistory({ period: 'all', page: 1, pageSize: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.periodRevenue).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('returns paginated history with mapped items and numeric totals', async () => {
      const saleRow = {
        id: 1,
        saleType: 'Contado',
        paymentMethod: 'Efectivo',
        subTotal: '100.00',
        total: '100.00',
        cashReceived: null,
        createdAt: new Date(),
      };
      const itemRow = {
        saleId: 1,
        productId: 2,
        productName: 'Baleada con todo',
        qty: 2,
        unitPrice: '50.00',
      };

      mockWhere.mockResolvedValueOnce([{ total: 1, periodRevenue: '100.00' }]);
      mockWhere.mockReturnValueOnce({ orderBy: mockOrderBy });
      mockOffset.mockResolvedValue([saleRow]);
      mockWhere.mockResolvedValueOnce([itemRow]);

      const result = await SaleService.getHistory({ period: 'all', page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].total).toBe(100);
      expect(result.data[0].cashReceived).toBeNull();
      expect(result.data[0].items[0].unitPrice).toBe(50);
      expect(result.periodRevenue).toBe(100);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('uses gte filter for period=day and period=week', async () => {
      const { gte } = await import('drizzle-orm');

      for (const period of ['day', 'week'] as const) {
        vi.clearAllMocks();
        mockLeftJoin.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
        mockFrom.mockReturnValue({ where: mockWhere, leftJoin: mockLeftJoin });
        mockSelect.mockReturnValue({ from: mockFrom });
        mockWhere.mockResolvedValueOnce([{ total: 0, periodRevenue: null }]);
        mockWhere.mockReturnValueOnce({ orderBy: mockOrderBy });
        mockOffset.mockResolvedValue([]);

        await SaleService.getHistory({ period, page: 1, pageSize: 10 });

        expect(gte).toHaveBeenCalled();
      }
    });
  });
});
