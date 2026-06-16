export interface CreateSaleItemDto {
  productId: number;
  qty: number;
  unitPrice: string;
}

export interface CreateSaleDto {
  saleTypeId: number;
  paymentMethodId: number;
  subTotal: string;
  total: string;
  cashReceived?: string;
  items: CreateSaleItemDto[];
}
