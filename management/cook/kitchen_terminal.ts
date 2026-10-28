/**
 * =========================================================================
 * COOK KITCHEN TERMINAL
 * =========================================================================
 * Real-time batch cooking monitor:
 * - Live Veg, Jain, and Satvik batch counts
 * - Raw ingredient preparation calculator (kg flour, paneer, dal, potatoes)
 * - "Batch Ready & Handover" signaling to packing station
 */

export interface CookDailyBatchItem {
  mealSlot: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  category: 'sabzi' | 'dal' | 'roti' | 'rice' | 'sweet';
  dietType: 'pure_veg' | 'jain' | 'satvik';
  targetPortions: number;
  cookedPortions: number;
  status: 'raw_prep' | 'cooking' | 'ready_for_packing';
  chefNotes?: string;
}

export function calculateRawIngredientsForPortions(totalPortions: number) {
  return {
    attaFlourKg: (totalPortions * 0.12).toFixed(1), // ~120g flour per 4 rotis
    dalRawKg: (totalPortions * 0.045).toFixed(1),  // ~45g raw dal
    riceRawKg: (totalPortions * 0.05).toFixed(1),   // ~50g raw rice
    paneerKg: (totalPortions * 0.06).toFixed(1),    // ~60g paneer if paneer sabzi
    potatoesKg: (totalPortions * 0.08).toFixed(1)   // ~80g potatoes
  };
}
