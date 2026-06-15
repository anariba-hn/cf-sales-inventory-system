export interface Ingredient {
  id: number;
  SKU: string;
  name: string;
  costUnit: number | null;
  costPound: number | null;
  qtyUnit: number | null;
  qtyPound: number | null;
  outDate: Date | null;
  createdAt: Date;
}
