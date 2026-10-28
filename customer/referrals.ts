/**
 * =========================================================================
 * CUSTOMER REFERRALS & REWARDS PROGRAM
 * =========================================================================
 * Manages customer unique referral links, invite bonuses, and discounts.
 */

export interface CustomerReferralStats {
  referralCode: string;
  totalInvited: number;
  successfulSubscriptions: number;
  walletBalance: number;
  discountPerNextOrder: number;
}

export function generateCustomerReferralCode(customerPhone: string): string {
  const clean = customerPhone.replace(/\D/g, '').slice(-4);
  return `TIFFIN${clean}`;
}
