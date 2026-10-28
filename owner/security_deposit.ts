/**
 * =========================================================================
 * OWNER TIFFIN SECURITY DEPOSIT & CUSTODY DESK
 * =========================================================================
 * Tracks stainless steel tiffin containers assigned to customers,
 * security deposit payments, and refunds upon plan completion.
 */

export interface TiffinCustodyRecord {
  customerId: string;
  customerName: string;
  customerPhone: string;
  assignedTiffinBoxNumber: string;
  securityDepositAmount: number; // e.g. ₹500
  depositStatus: 'deposited' | 'refunded' | 'forfeited';
  tiffinCondition: 'good' | 'damaged' | 'missing';
  updatedAt: string;
}
