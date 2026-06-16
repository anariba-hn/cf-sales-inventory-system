export interface SaleType {
  id: number;
  name: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface SaleItemModel {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleModel {
  id: number;
  saleType: string | null;
  paymentMethod: string | null;
  subTotal: number;
  total: number;
  cashReceived: number | null;
  createdAt: Date;
  items: SaleItemModel[];
}

export interface SaleHistory {
  id: number;
  saleType: string | null;
  paymentMethod: string | null;
  subTotal: number;
  total: number;
  cashReceived: number | null;
  itemCount: number;
  createdAt: Date;
}
