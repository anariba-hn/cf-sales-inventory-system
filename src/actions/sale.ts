'use server';

import { SaleService } from '@/services/sale.service';
import { CreateSaleDto, GetSaleHistoryDto } from '@/dtos/sale.dto';
import { revalidatePath } from 'next/cache';

export async function getSaleTypesAction() {
  return SaleService.getSaleTypes();
}

export async function getPaymentMethodsAction() {
  return SaleService.getPaymentMethods();
}

export async function createSaleAction(data: CreateSaleDto) {
  if (!data.items.length) return { error: 'La venta debe tener al menos un producto' };
  try {
    const result = await SaleService.create(data);
    revalidatePath('/sales');
    revalidatePath('/sales/history');
    revalidatePath('/inventory');
    return result;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error al procesar la venta' };
  }
}

export async function getSaleHistoryAction(dto: GetSaleHistoryDto) {
  return SaleService.getHistory(dto);
}
