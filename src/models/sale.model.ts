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

export interface SaleHistoryItem {
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
}

export interface SaleHistory {
  id: number;
  saleType: string | null;
  paymentMethod: string | null;
  subTotal: number;
  total: number;
  cashReceived: number | null;
  items: SaleHistoryItem[];
  createdAt: Date;
}

export interface SaleHistoryPage {
  data: SaleHistory[];
  total: number;
  periodRevenue: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
