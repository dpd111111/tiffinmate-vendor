/**
 * =========================================================================
 * POST-PURCHASE CUSTOMER DASHBOARD
 * =========================================================================
 * Dedicated view for subscribed customers:
 * - Live Google Maps GPS Tiffin Tracking
 * - 1-Click Meal Pause / Leave Management (Auto-extends subscription)
 * - My Active Subscription Details & Remaining Days
 * - Download Digital Tax Invoice & Receipts
 */

export interface CustomerActiveSubscription {
  subscriptionId: string;
  customerPhone: string;
  planName: string;
  totalDays: number;
  remainingDays: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'expired';
  pausedDates: string[];
  todayDeliveryStatus: 'preparing' | 'packed' | 'out_for_delivery' | 'delivered';
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  estimatedDeliveryTime?: string;
}

export function validateMealPauseEligibility(
  targetDate: string,
  cutoffHour: number = 9 // 9:00 AM cutoff for lunch, 4:00 PM for dinner
): { canPause: boolean; reason?: string } {
  const now = new Date();
  const target = new Date(targetDate);
  
  if (target < now && target.toDateString() !== now.toDateString()) {
    return { canPause: false, reason: 'बीती हुई तारीख का भोजन पॉज़ नहीं किया जा सकता।' };
  }
  
  if (target.toDateString() === now.toDateString() && now.getHours() >= cutoffHour) {
    return { canPause: false, reason: `आज की तैयारी शुरू हो चुकी है (${cutoffHour}:00 AM के बाद पॉज़ नहीं हो सकता)।` };
  }
  
  return { canPause: true };
}
