/**
 * =========================================================================
 * VENDOR SUPPLY PORTAL
 * =========================================================================
 * Vendor daily procurement slips, supply dispatch confirmation,
 * bill and invoice uploads, and dues ledger.
 */

export interface VendorDailyProcurementSlip {
  slipId: string;
  vendorId: string;
  vendorName: string;
  category: 'vegetables' | 'dairy' | 'grocery' | 'gas_packaging';
  itemsRequested: Array<{ itemName: string; quantity: string; unit: string }>;
  requiredByTime: string;
  status: 'pending' | 'supplied' | 'verified_by_cook';
  totalBillAmount?: number;
  invoiceUrl?: string;
}
