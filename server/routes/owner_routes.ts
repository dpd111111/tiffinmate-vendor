/**
 * =========================================================================
 * OWNER SERVER ROUTES
 * =========================================================================
 * API Handlers for Owner analytics, daily ledger recording,
 * payroll approval, and secret vault updates.
 */

export interface OwnerLedgerRequest {
  category: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
}

export function validateLedgerEntry(entry: OwnerLedgerRequest): { isValid: boolean; error?: string } {
  if (!entry.amount || Number(entry.amount) <= 0) {
    return { isValid: false, error: 'कृपया शून्य से अधिक वैध राशि दर्ज करें।' };
  }
  if (!entry.description || entry.description.trim().length === 0) {
    return { isValid: false, error: 'कृपया ख़र्च या आय का विवरण दर्ज करें।' };
  }
  return { isValid: true };
}
