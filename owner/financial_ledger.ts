/**
 * =========================================================================
 * OWNER FINANCIAL & BUSINESS LEDGER
 * =========================================================================
 * Authoritative record of daily income, vegetables, groceries, petrol,
 * and operational expenses.
 */

export interface OwnerLedgerEntry {
  id: string;
  entryDate: string;
  category: 'subscription_income' | 'raw_grocery' | 'vegetable_market' | 'gas_cylinder' | 'rider_petrol' | 'miscellaneous';
  type: 'income' | 'expense';
  amount: number;
  description: string;
  recordedBy: string;
  paymentMode: 'cash' | 'upi' | 'bank_transfer';
  receiptUrl?: string;
}

export function computeNetDailyBalance(entries: OwnerLedgerEntry[]): { totalIncome: number; totalExpense: number; netProfit: number } {
  let totalIncome = 0;
  let totalExpense = 0;
  for (const e of entries) {
    if (e.type === 'income') totalIncome += Number(e.amount || 0);
    else if (e.type === 'expense') totalExpense += Number(e.amount || 0);
  }
  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense
  };
}
