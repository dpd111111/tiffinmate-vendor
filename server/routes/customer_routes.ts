/**
 * =========================================================================
 * CUSTOMER SERVER ROUTES
 * =========================================================================
 * API Handlers for customer meal booking, pause meal requests,
 * and live delivery tracking.
 */

export interface CustomerOrderRequest {
  customerName: string;
  phone: string;
  address: string;
  planId: string;
  durationDays: number;
  dietPreference: 'veg' | 'jain' | 'satvik';
  amount: number;
  paymentMode: 'online_upi' | 'doorstep_cash';
}

export function validateCustomerOrder(req: CustomerOrderRequest): { isValid: boolean; error?: string } {
  if (!req.phone || req.phone.trim().length < 10) {
    return { isValid: false, error: 'कृपया वैध 10-अंकों का मोबाइल नंबर दर्ज करें।' };
  }
  if (!req.address || req.address.trim().length < 5) {
    return { isValid: false, error: 'कृपया पूरा डिलीवरी पता दर्ज करें।' };
  }
  if (!req.amount || req.amount <= 0) {
    return { isValid: false, error: 'अमान्य भुगतान राशि।' };
  }
  return { isValid: true };
}
