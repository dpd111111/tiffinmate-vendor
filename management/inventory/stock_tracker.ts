/**
 * =========================================================================
 * KITCHEN INVENTORY & STOCK TRACKER
 * =========================================================================
 * Live pantry stock (oil, ghee, spices, rice, flour, packaging foil),
 * low-stock threshold alerts, and wastage logging.
 */

export interface PantryStockItem {
  id: string;
  itemName: string;
  currentStock: number;
  unit: 'kg' | 'liter' | 'packets' | 'boxes';
  reorderThreshold: number;
  isLowStock: boolean;
  lastUpdated: string;
}

export function checkLowStockWarning(item: PantryStockItem): boolean {
  return Number(item.currentStock || 0) <= Number(item.reorderThreshold || 0);
}
