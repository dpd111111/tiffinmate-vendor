/**
 * =========================================================================
 * MANAGEMENT SERVER ROUTES
 * =========================================================================
 * API Handlers for staff task updates, cook batch handovers,
 * delivery rider reconciliation, and vendor procurement.
 */

export interface CookBatchStatusUpdate {
  mealSlot: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  cookedPortions: number;
  isReadyForPacking: boolean;
  updatedBy: string;
}

export function validateCookBatchUpdate(update: CookBatchStatusUpdate): { isValid: boolean; error?: string } {
  if (!update.dishName) {
    return { isValid: false, error: 'डिश का नाम अनिवार्य है।' };
  }
  if (update.cookedPortions < 0) {
    return { isValid: false, error: 'तैयार टिफिन की संख्या नकारात्मक नहीं हो सकती।' };
  }
  return { isValid: true };
}
