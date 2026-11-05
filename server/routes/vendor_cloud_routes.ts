/**
 * =========================================================================
 * TIFFINMATE VENDOR CLOUD ROUTER & SETTLEMENT ENGINE
 * =========================================================================
 * Fullstack API handler for:
 * 1. Vendor Authentication & Profile
 * 2. Digitized Settlement Rate Card (PDF-Authoritative & Google Sheets Synced)
 * 3. 3rd-Party Multi-Meal Order Punching (Single Order ID with Multiple Dishes)
 * 4. Auto-Synced TiffinMate Website Orders (Customer PII Masked)
 * 5. Vendor Wallet:
 *    - Strict ₹2,000 Minimum Reserve
 *    - Friday-Thursday Billing Cycle
 *    - Weekly Monday Transfer
 *    - 10-Day Rolling Security Hold (DNS / Quality Clearance)
 * 6. Google Sheets Integration:
 *    - Auto-create & Sync "NOV TIFFIN - Master Vendor Ledger & Rate Card"
 *    - RateCard, DishApprovals, LiveOrders, RefundsDeductions, MondayPayouts
 * 7. Customer Refund & Cancellation Deductions (Vendor portion deducted from wallet)
 * 8. Real-Time Kitchen Inventory & Packaging Tracker
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { VENDOR_MASTER_RATE_CARD } from '../../management/vendor/vendor_rate_card_data';
import { readJsonSafe, writeJsonSafe, syncFromFirestoreSnapshot } from '../database/core_database';

export { VENDOR_MASTER_RATE_CARD };

export interface VendorOrderItem {
  itemId: string;
  itemName: string;
  hindiName?: string;
  portionSize: string;
  quantity: number;
  listingPrice: number;
  vendorPayoutRate: number;
  totalVendorPayout: number;
}

export interface VendorPunchedOrder {
  id: string;
  orderNumber: string;
  source: 'zomato' | 'swiggy' | 'magicpin' | 'direct' | 'tiffin_website';
  platformOrderId: string;
  items?: VendorOrderItem[];
  itemId: string;
  itemName: string;
  portionSize: string;
  quantity: number;
  listingPrice: number;
  vendorPayoutRate: number;
  totalVendorPayout: number;
  status: 'received' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
  createdAt: string;
  timeSlot?: string;
  riderName?: string;
  riderEta?: string;
  notes?: string;
  dietaryType?: string;
  payoutCreditedToWallet: boolean;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isMultiItem?: boolean;
}

export interface IncentiveTier {
  id: string;
  milestoneMeals: number; // e.g. 25, 50, 100, 200
  bonusAmount: number; // e.g. 150, 350, 800, 1800
  title: string;
  badge: string;
  description: string;
}

export interface IncentiveRecord {
  id: string;
  vendorId: string;
  type: 'milestone' | 'spot_bonus' | 'ontime_rating' | 'festival_surge';
  amount: number;
  mealsCompleted?: number;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  cyclePeriod?: string;
  tierId?: string;
}

export interface IncentiveSystemConfig {
  enabled: boolean;
  tiers: IncentiveTier[];
  onTimeBonusPerMeal: number;
  zeroComplaintWeeklyBonus: number;
  dailyZeroCancellationBonus: number;
  weeklyHundredPercentOnlineBonus: number;
}

export interface WeeklyIncentiveStats {
  deliveredMealsThisCycle: number;
  currentMilestoneTier: IncentiveTier | null;
  nextMilestoneTier: IncentiveTier | null;
  mealsNeededForNextTier: number;
  progressPercent: number;
  totalIncentiveEarnedThisCycle: number;
  totalLifetimeIncentives: number;
  cycleStart: string;
  cycleEnd: string;
}

export const DEFAULT_INCENTIVE_CONFIG: IncentiveSystemConfig = {
  enabled: true,
  tiers: [
    { id: 'tier_bronze', milestoneMeals: 25, bonusAmount: 150, title: 'ब्राउन स्टार बोनस', badge: '🥉', description: '25 टिफिन डिलीवरी पर ₹150 बोनस' },
    { id: 'tier_silver', milestoneMeals: 50, bonusAmount: 350, title: 'सिल्वर स्टार बोनस', badge: '🥈', description: '50 टिफिन डिलीवरी पर ₹350 बोनस' },
    { id: 'tier_gold', milestoneMeals: 100, bonusAmount: 800, title: 'गोल्ड स्टार बोनस', badge: '🥇', description: '100 टिफिन डिलीवरी पर ₹800 बोनस' },
    { id: 'tier_platinum', milestoneMeals: 200, bonusAmount: 1800, title: 'प्लैटिनम स्टार बोनस', badge: '💎', description: '200+ टिफिन डिलीवरी पर ₹1800 बोनस' }
  ],
  onTimeBonusPerMeal: 5,
  zeroComplaintWeeklyBonus: 250,
  dailyZeroCancellationBonus: 50,
  weeklyHundredPercentOnlineBonus: 300
};

export interface VendorWalletTransaction {
  id: string;
  date: string;
  type: 'order_credit' | 'payout_disbursed' | 'hold_reserve' | 'dns_adjustment' | 'refund_deduction' | 'incentive_bonus';
  amount: number;
  description: string;
  referenceId?: string; // Order ID or Payout UTR
  balanceAfter: number;
  status: 'settled' | 'hold' | 'approved';
  ownerApprovedBy?: string;
  utrNumber?: string;
  cyclePeriod?: string;
}

export interface RefundDeductionRecord {
  id: string;
  orderId: string;
  customerRefundAmount: number;
  vendorCutDeducted: number;
  reason: string;
  timestamp: string;
  status: 'deducted' | 'disputed' | 'reversed';
}

export interface CustomDishSubmission {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  categoryLabel: string;
  portions: Array<{ size: string; listingPrice: number; vendorPayoutRate: number }>;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  notes?: string;
}

export interface KitchenInventoryItem {
  id: string;
  name: string;
  hindiName: string;
  category: 'raw_materials' | 'dairy' | 'packaging' | 'spices_oils';
  currentStock: number;
  unit: string;
  minThreshold: number;
  status: 'sufficient' | 'low' | 'critical';
  lastUpdated: string;
}

export interface DailyMenuItem {
  dishId: string;
  name: string;
  hindiName: string;
  category?: string;
  listingPrice: number;
  vendorPayoutRate: number;
  mealSlot: 'lunch' | 'dinner' | 'breakfast_snack' | 'all_day';
  isFixedDaily?: boolean;
}

export interface CalendarDateSchedule {
  date: string; // YYYY-MM-DD e.g. "2026-11-01"
  dayNameHindi: string;
  specialCurry?: string;
  specialRice?: string;
  specialBread?: string;
  lunchDishes: DailyMenuItem[];
  dinnerDishes: DailyMenuItem[];
  regularFixedDishes?: DailyMenuItem[];
  isCustomOverride?: boolean;
  notes?: string;
}

export interface DailyMenuConfig {
  regularFixedDishes: DailyMenuItem[];
  dayWiseSchedules: Record<string, DayScheduleDetails>;
  monthlyCalendarOverrides?: Record<string, CalendarDateSchedule>;
  lunchSlotTime: string;
  dinnerSlotTime: string;
  breakfastSlotTime: string;
  lastUpdated: string;
}

export const DEFAULT_DAILY_MENU_CONFIG: DailyMenuConfig = {
  lunchSlotTime: '12:00 PM - 3:30 PM',
  dinnerSlotTime: '7:30 PM - 10:30 PM',
  breakfastSlotTime: '7:30 AM - 11:30 AM',
  lastUpdated: new Date().toISOString(),
  regularFixedDishes: [
    { dishId: 'cmb_paratha_chai', name: 'Aloo Paratha (2 Pcs) + Cutting Chai Combo', hindiName: 'आलू पराठा (2 Pcs) + कटिंग चाय कॉम्बो', listingPrice: 129, vendorPayoutRate: 45, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'cmb_poha_chai', name: 'Indori Poha + Masala Chai Combo', hindiName: 'इंदौरी पोहा + मसाला चाय कॉम्बो', listingPrice: 99, vendorPayoutRate: 35, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'cmb_samosa_chai', name: 'Desi Samosa (2 Pcs) + Adrak Chai Combo', hindiName: 'देसी समोसा (2 Pcs) + अदरक चाय कॉम्बो', listingPrice: 89, vendorPayoutRate: 30, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'brd_tawa_roti', name: 'Plain Tawa Roti', hindiName: 'तवा रोटी (प्लेन)', listingPrice: 15, vendorPayoutRate: 5, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'mon_yellow_dal_tadka', name: 'Yellow Dal Tadka', hindiName: 'येलो दाल तड़का', listingPrice: 129, vendorPayoutRate: 50, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'brd_plain_rice', name: 'Plain Basmati Rice (300g)', hindiName: 'प्लेन बासमती राइस (300 ग्राम)', listingPrice: 99, vendorPayoutRate: 35, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'snk_adrak_chai', name: 'Kulhad Adrak Chai (2 Cups)', hindiName: 'कुल्हड़ अदरक चाय (2 कप)', listingPrice: 59, vendorPayoutRate: 20, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'mon_daily_thali', name: 'TiffinMate Homestyle Executive Thali', hindiName: 'टिफ़िनमैट होमस्टाइल एग्जीक्यूटिव थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'snk_paneer_paratha', name: 'Amul Butter Paneer Paratha (2 Pcs)', hindiName: 'अमुल बटर पनीर पराठा (2 Pcs)', listingPrice: 149, vendorPayoutRate: 55, mealSlot: 'all_day', isFixedDaily: true },
    { dishId: 'vrat_sabudana_khichdi', name: 'Sabudana Khichdi (Vrat Special)', hindiName: 'साबूदाना खिचड़ी (व्रत स्पेशल)', listingPrice: 149, vendorPayoutRate: 55, mealSlot: 'all_day', isFixedDaily: true }
  ],
  dayWiseSchedules: {
    monday: {
      dayId: 'monday',
      dayNameHindi: 'सोमवार (Monday)',
      specialCurry: 'आलू मटर व कड़ाई पनीर',
      specialRice: 'जीरा राइस',
      specialBread: 'तवा रोटी',
      lunchDishes: [
        { dishId: 'mon_aloo_matar', name: 'Aloo Matar', hindiName: 'आलू मटर', listingPrice: 149, vendorPayoutRate: 50, mealSlot: 'lunch' },
        { dishId: 'mon_yellow_dal_tadka', name: 'Yellow Dal Tadka', hindiName: 'येलो दाल तड़का', listingPrice: 129, vendorPayoutRate: 50, mealSlot: 'lunch' },
        { dishId: 'mon_kadhai_paneer', name: 'Kadhai Paneer', hindiName: 'कढ़ाई पनीर', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'lunch' },
        { dishId: 'mon_kadhai_paneer_rice_bowl', name: 'Kadhai Paneer with Rice Bowl', hindiName: 'कढ़ाई पनीर विथ राइस बाउल', listingPrice: 199, vendorPayoutRate: 75, mealSlot: 'lunch' },
        { dishId: 'mon_daily_thali', name: 'Monday Daily Thali', hindiName: 'सोमवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'mon_kadhai_paneer', name: 'Kadhai Paneer', hindiName: 'कढ़ाई पनीर', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'mon_yellow_dal_rice_bowl', name: 'Yellow Dal Tadka with Rice Bowl', hindiName: 'दाल तड़का विथ राइस बाउल', listingPrice: 169, vendorPayoutRate: 60, mealSlot: 'dinner' },
        { dishId: 'mon_deluxe_thali', name: 'Monday Deluxe Thali', hindiName: 'सोमवार डीलक्स थाली', listingPrice: 299, vendorPayoutRate: 100, mealSlot: 'dinner' },
        { dishId: 'mon_premium_thali', name: 'Monday Premium Thali', hindiName: 'सोमवार प्रीमियम थाली', listingPrice: 399, vendorPayoutRate: 135, mealSlot: 'dinner' }
      ]
    },
    tuesday: {
      dayId: 'tuesday',
      dayNameHindi: 'मंगलवार (Tuesday)',
      specialCurry: 'भिंडी मसाला व शाही पनीर',
      specialRice: 'प्लेन बासमती राइस',
      specialBread: 'बटर तवा रोटी',
      lunchDishes: [
        { dishId: 'tue_bhindi_masala', name: 'Bhindi Masala', hindiName: 'भिंडी मसाला', listingPrice: 139, vendorPayoutRate: 48, mealSlot: 'lunch' },
        { dishId: 'tue_chana_dal', name: 'Chana Dal Fry', hindiName: 'चना दाल फ्राइड', listingPrice: 129, vendorPayoutRate: 45, mealSlot: 'lunch' },
        { dishId: 'tue_shahi_paneer', name: 'Shahi Paneer', hindiName: 'शाही पनीर', listingPrice: 179, vendorPayoutRate: 70, mealSlot: 'lunch' },
        { dishId: 'tue_daily_thali', name: 'Tuesday Daily Thali', hindiName: 'मंगलवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'tue_shahi_paneer', name: 'Shahi Paneer', hindiName: 'शाही पनीर', listingPrice: 179, vendorPayoutRate: 70, mealSlot: 'dinner' },
        { dishId: 'tue_rajma_masala', name: 'Rajma Masala with Rice Bowl', hindiName: 'राजमा चावल बाउल', listingPrice: 179, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'tue_deluxe_thali', name: 'Tuesday Deluxe Thali', hindiName: 'मंगलवार डीलक्स थाली', listingPrice: 299, vendorPayoutRate: 100, mealSlot: 'dinner' }
      ]
    },
    wednesday: {
      dayId: 'wednesday',
      dayNameHindi: 'बुधवार (Wednesday)',
      specialCurry: 'राजमा मसाला व पनीर बटर मसाला',
      specialRice: 'मटर पुलाव',
      specialBread: 'तवा रोटी',
      lunchDishes: [
        { dishId: 'wed_rajma_masala', name: 'Punjabi Rajma Masala', hindiName: 'पंजाबी राजमा मसाला', listingPrice: 149, vendorPayoutRate: 52, mealSlot: 'lunch' },
        { dishId: 'wed_paneer_butter_masala', name: 'Paneer Butter Masala', hindiName: 'पनीर बटर मसाला', listingPrice: 189, vendorPayoutRate: 72, mealSlot: 'lunch' },
        { dishId: 'wed_daily_thali', name: 'Wednesday Daily Thali', hindiName: 'बुधवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'wed_paneer_butter_masala', name: 'Paneer Butter Masala', hindiName: 'पनीर बटर मसाला', listingPrice: 189, vendorPayoutRate: 72, mealSlot: 'dinner' },
        { dishId: 'wed_rajma_rice_bowl', name: 'Rajma Chawal Combo Bowl', hindiName: 'राजमा चावल कॉम्बो बाउल', listingPrice: 179, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'wed_premium_thali', name: 'Wednesday Premium Thali', hindiName: 'बुधवार प्रीमियम थाली', listingPrice: 399, vendorPayoutRate: 135, mealSlot: 'dinner' }
      ]
    },
    thursday: {
      dayId: 'thursday',
      dayNameHindi: 'गुरुवार (Thursday)',
      specialCurry: 'कढ़ी पकोड़ा व मटर पनीर',
      specialRice: 'स्टीम्ड बासमती राइस',
      specialBread: 'तवा रोटी',
      lunchDishes: [
        { dishId: 'thu_kadhi_pakoda', name: 'Punjabi Kadhi Pakoda', hindiName: 'पंजाबी कढ़ी पकोड़ा', listingPrice: 139, vendorPayoutRate: 48, mealSlot: 'lunch' },
        { dishId: 'thu_matar_paneer', name: 'Matar Paneer', hindiName: 'मटर पनीर', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'lunch' },
        { dishId: 'thu_daily_thali', name: 'Thursday Daily Thali', hindiName: 'गुरुवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'thu_matar_paneer', name: 'Matar Paneer', hindiName: 'मटर पनीर', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'thu_kadhi_rice_bowl', name: 'Kadhi Chawal Combo Bowl', hindiName: 'कढ़ी चावल कॉम्बो बाउल', listingPrice: 169, vendorPayoutRate: 60, mealSlot: 'dinner' },
        { dishId: 'thu_deluxe_thali', name: 'Thursday Deluxe Thali', hindiName: 'गुरुवार डीलक्स थाली', listingPrice: 299, vendorPayoutRate: 100, mealSlot: 'dinner' }
      ]
    },
    friday: {
      dayId: 'friday',
      dayNameHindi: 'शुक्रवार (Friday)',
      specialCurry: 'छोले मसाला व पनीर दो प्याज़ा',
      specialRice: 'जीरा राइस',
      specialBread: 'तवा रोटी / भटूरे',
      lunchDishes: [
        { dishId: 'fri_chhole_masala', name: 'Amritsari Chhole Masala', hindiName: 'अमृतसरी छोले मसाला', listingPrice: 149, vendorPayoutRate: 52, mealSlot: 'lunch' },
        { dishId: 'fri_paneer_do_pyaza', name: 'Paneer Do Pyaza', hindiName: 'पनीर दो प्याज़ा', listingPrice: 179, vendorPayoutRate: 70, mealSlot: 'lunch' },
        { dishId: 'fri_daily_thali', name: 'Friday Daily Thali', hindiName: 'शुक्रवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'fri_paneer_do_pyaza', name: 'Paneer Do Pyaza', hindiName: 'पनीर दो प्याज़ा', listingPrice: 179, vendorPayoutRate: 70, mealSlot: 'dinner' },
        { dishId: 'fri_chhole_rice_bowl', name: 'Chhole Chawal Combo Bowl', hindiName: 'छोले चावल कॉम्बो बाउल', listingPrice: 179, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'fri_premium_thali', name: 'Friday Premium Thali', hindiName: 'शुक्रवार प्रीमियम थाली', listingPrice: 399, vendorPayoutRate: 135, mealSlot: 'dinner' }
      ]
    },
    saturday: {
      dayId: 'saturday',
      dayNameHindi: 'शनिवार (Saturday)',
      specialCurry: 'दम आलू व दाल मखनी',
      specialRice: 'वेज पुलाव',
      specialBread: 'तवा रोटी',
      lunchDishes: [
        { dishId: 'sat_dum_aloo', name: 'Kashmiri Dum Aloo', hindiName: 'कश्मीरी दम आलू', listingPrice: 149, vendorPayoutRate: 50, mealSlot: 'lunch' },
        { dishId: 'sat_dal_makhani', name: 'Special Dal Makhani', hindiName: 'स्पेशल दाल मखनी', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'lunch' },
        { dishId: 'sat_daily_thali', name: 'Saturday Daily Thali', hindiName: 'शनिवार डेली थाली', listingPrice: 249, vendorPayoutRate: 80, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'sat_dal_makhani', name: 'Special Dal Makhani', hindiName: 'स्पेशल दाल मखनी', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'sat_malai_kofta', name: 'Malai Kofta Special', hindiName: 'मलाई कोफ्ता स्पेशल', listingPrice: 189, vendorPayoutRate: 75, mealSlot: 'dinner' },
        { dishId: 'sat_deluxe_thali', name: 'Saturday Deluxe Thali', hindiName: 'शनिवार डीलक्स थाली', listingPrice: 299, vendorPayoutRate: 100, mealSlot: 'dinner' }
      ]
    },
    sunday: {
      dayId: 'sunday',
      dayNameHindi: 'रविवार (Sunday)',
      specialCurry: 'शाही पनीर व स्पेशल वेज बिरयानी',
      specialRice: 'वेज बिरयानी विथ रायता',
      specialBread: 'बटर तवा रोटी व गुलाब जामुन',
      lunchDishes: [
        { dishId: 'sun_veg_biryani', name: 'Special Veg Dum Biryani with Raita', hindiName: 'स्पेशल वेज दम बिरयानी विथ रायता', listingPrice: 199, vendorPayoutRate: 75, mealSlot: 'lunch' },
        { dishId: 'sun_shahi_paneer', name: 'Desi Ghee Shahi Paneer', hindiName: 'देसी घी शाही पनीर', listingPrice: 189, vendorPayoutRate: 75, mealSlot: 'lunch' },
        { dishId: 'sun_sunday_special_thali', name: 'Sunday Royal Feast Thali', hindiName: 'रविवार रॉयल फीस्ट थाली', listingPrice: 349, vendorPayoutRate: 120, mealSlot: 'lunch' }
      ],
      dinnerDishes: [
        { dishId: 'sun_shahi_paneer', name: 'Desi Ghee Shahi Paneer', hindiName: 'देसी घी शाही पनीर', listingPrice: 189, vendorPayoutRate: 75, mealSlot: 'dinner' },
        { dishId: 'sun_dal_makhani', name: 'Royal Dal Makhani', hindiName: 'रॉयल दाल मखनी', listingPrice: 169, vendorPayoutRate: 65, mealSlot: 'dinner' },
        { dishId: 'sun_premium_thali', name: 'Sunday Premium Thali with Gulab Jamun', hindiName: 'रविवार प्रीमियम थाली (गुलाब जामुन सहित)', listingPrice: 399, vendorPayoutRate: 135, mealSlot: 'dinner' }
      ]
    }
  }
};

export interface VendorVaultState {
  vendorId: string;
  orders: VendorPunchedOrder[];
  transactions: VendorWalletTransaction[];
  inventory: KitchenInventoryItem[];
  refundDeductions?: RefundDeductionRecord[];
  pendingDishes?: CustomDishSubmission[];
  payoutRequests?: Array<{
    id: string;
    amount: number;
    requestedAt: string;
    status: 'PENDING' | 'DISBURSED' | 'REJECTED';
    utrNumber?: string;
    notes?: string;
    upiId?: string;
  }>;
  incentiveConfig?: IncentiveSystemConfig;
  incentiveHistory?: IncentiveRecord[];
  dailyMenuConfig?: DailyMenuConfig;
  sheetConfig?: {
    spreadsheetId: string;
    spreadsheetUrl: string;
    scriptWebhookUrl?: string;
    lastSynced: string;
  };
  wallet: {
    totalLifetimeEarned: number;
    currentBalance: number;
    minimumReserve: number; // Always 2000
    tenDayHoldAmount: number;
    lastSettlementDate: string;
    billingCycle: string; // Friday to Thursday
    payoutDay: string; // Monday
  };
}

export async function pushEventToGoogleSheet(_action: string, _payload: Record<string, any>): Promise<void> {
  // Google Sheets completely removed as requested. All data managed internally via Owner Panel.
}

const VENDOR_STORAGE_FILE = path.join(process.cwd(), 'server_vendor_vault.json');
const VENDOR_BACKUP_FILE = path.join(process.cwd(), 'server_vendor_vault_backup.json');
const VENDOR_SNAPSHOT_FILE = path.join(process.cwd(), 'server_vendor_vault_snapshot.json');
const VENDOR_PERMANENT_FILE = path.join(process.cwd(), 'server_vendor_vault_permanent.json');
const EXTERNAL_IMPORTED_ORDERS_FILE = path.join(process.cwd(), 'server_external_zomato_orders.json');

function mergeExternalImportedOrders(vault: VendorVaultState) {
  try {
    const fileExists = fs.existsSync(EXTERNAL_IMPORTED_ORDERS_FILE);
    if (fileExists) {
      const raw = fs.readFileSync(EXTERNAL_IMPORTED_ORDERS_FILE, 'utf-8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        const externalOrders: VendorPunchedOrder[] = Array.isArray(parsed.orders) 
          ? parsed.orders 
          : (Array.isArray(parsed) ? parsed : []);
        
        if (externalOrders.length > 0) {
          if (!vault.orders) vault.orders = [];
          const existingIds = new Set(vault.orders.map(o => o.id));
          for (const extOrd of externalOrders) {
            if (!existingIds.has(extOrd.id)) {
              vault.orders.push(extOrd);
              existingIds.add(extOrd.id);
            }
          }
        }
      }
    } else {
      // Import file deleted by user: purge all imported Zomato orders from vault state
      if (vault.orders && Array.isArray(vault.orders)) {
        vault.orders = vault.orders.filter(o => !o.id || !o.id.startsWith('ORD-ZOMATO-'));
      }
    }
  } catch (err) {
    console.warn('[External Orders Sync Warning]:', err);
  }
}

let inMemoryVendorVault: VendorVaultState | null = null;
let inMemoryRateCard: any[] | null = null;

function saveVendorVault(state: VendorVaultState): boolean {
  try {
    if (!state || typeof state !== 'object') return false;

    // If import file was deleted, make sure state.orders doesn't contain ORD-ZOMATO- orders
    const fileExists = fs.existsSync(EXTERNAL_IMPORTED_ORDERS_FILE);
    if (!fileExists && state.orders && Array.isArray(state.orders)) {
      state.orders = state.orders.filter(o => !o.id || !o.id.startsWith('ORD-ZOMATO-'));
    }

    // Safety Safeguard: Deep merge with disk data so no records are lost due to state race conditions
    let existingOnDisk: VendorVaultState | null = null;
    try {
      const diskPath = fs.existsSync(VENDOR_STORAGE_FILE) ? VENDOR_STORAGE_FILE : 
                       (fs.existsSync(VENDOR_BACKUP_FILE) ? VENDOR_BACKUP_FILE : VENDOR_PERMANENT_FILE);
      if (fs.existsSync(diskPath)) {
        const raw = fs.readFileSync(diskPath, 'utf-8');
        if (raw && raw.trim()) {
          existingOnDisk = JSON.parse(raw);
        }
      }
    } catch {}

    if (existingOnDisk) {
      // Merge orders (skipping ORD-ZOMATO- if import file is missing)
      if (Array.isArray(existingOnDisk.orders) && existingOnDisk.orders.length > 0) {
        const diskOrders = fileExists 
          ? existingOnDisk.orders 
          : existingOnDisk.orders.filter(o => !o.id || !o.id.startsWith('ORD-ZOMATO-'));
        const stateIds = new Set((state.orders || []).map(o => o.id));
        const missingOrders = diskOrders.filter(o => !stateIds.has(o.id));
        state.orders = [...(state.orders || []), ...missingOrders];
      }

      // Merge wallet transactions
      if (Array.isArray(existingOnDisk.transactions) && existingOnDisk.transactions.length > 0) {
        const stateIds = new Set((state.transactions || []).map(t => t.id));
        const missingTxns = existingOnDisk.transactions.filter(t => !stateIds.has(t.id));
        state.transactions = [...(state.transactions || []), ...missingTxns];
      }

      // Merge incentive history
      if (Array.isArray(existingOnDisk.incentiveHistory) && existingOnDisk.incentiveHistory.length > 0) {
        const stateIds = new Set((state.incentiveHistory || []).map(h => h.id));
        const missingHistory = existingOnDisk.incentiveHistory.filter(h => !stateIds.has(h.id));
        state.incentiveHistory = [...(state.incentiveHistory || []), ...missingHistory];
      }

      // Merge kitchen inventory
      if (Array.isArray(existingOnDisk.inventory) && existingOnDisk.inventory.length > 0) {
        const stateIds = new Set((state.inventory || []).map(i => i.id));
        const missingItems = existingOnDisk.inventory.filter(i => !stateIds.has(i.id));
        state.inventory = [...(state.inventory || []), ...missingItems];
      }

      // Merge pending dishes
      if (Array.isArray(existingOnDisk.pendingDishes) && existingOnDisk.pendingDishes.length > 0) {
        const stateIds = new Set((state.pendingDishes || []).map(d => d.id));
        const missingDishes = existingOnDisk.pendingDishes.filter(d => !stateIds.has(d.id));
        state.pendingDishes = [...(state.pendingDishes || []), ...missingDishes];
      }

      // Merge refund deductions
      if (Array.isArray(existingOnDisk.refundDeductions) && existingOnDisk.refundDeductions.length > 0) {
        const stateIds = new Set((state.refundDeductions || []).map(r => r.id));
        const missingRefunds = existingOnDisk.refundDeductions.filter(r => !stateIds.has(r.id));
        state.refundDeductions = [...(state.refundDeductions || []), ...missingRefunds];
      }

      // Preserve incentive config
      if (!state.incentiveConfig && existingOnDisk.incentiveConfig) {
        state.incentiveConfig = existingOnDisk.incentiveConfig;
      }

      // Preserve calendar overrides
      if (existingOnDisk.dailyMenuConfig?.monthlyCalendarOverrides) {
        if (!state.dailyMenuConfig) {
          state.dailyMenuConfig = existingOnDisk.dailyMenuConfig;
        } else if (!state.dailyMenuConfig.monthlyCalendarOverrides) {
          state.dailyMenuConfig.monthlyCalendarOverrides = existingOnDisk.dailyMenuConfig.monthlyCalendarOverrides;
        } else {
          state.dailyMenuConfig.monthlyCalendarOverrides = {
            ...existingOnDisk.dailyMenuConfig.monthlyCalendarOverrides,
            ...state.dailyMenuConfig.monthlyCalendarOverrides
          };
        }
      }
    }

    const jsonStr = JSON.stringify(state, null, 2);
    if (!jsonStr || jsonStr.length < 10) return false;

    inMemoryVendorVault = state;

    // Save atomically across 4 redundant backup locations & Firestore cloud database
    fs.writeFileSync(VENDOR_STORAGE_FILE, jsonStr, 'utf-8');
    fs.writeFileSync(VENDOR_BACKUP_FILE, jsonStr, 'utf-8');
    fs.writeFileSync(VENDOR_SNAPSHOT_FILE, jsonStr, 'utf-8');
    fs.writeFileSync(VENDOR_PERMANENT_FILE, jsonStr, 'utf-8');
    writeJsonSafe(VENDOR_STORAGE_FILE, state);
    return true;
  } catch (err) {
    console.error('[Vendor Vault Save Error]:', err);
    return false;
  }
}

function loadVendorVault(): VendorVaultState {
  if (inMemoryVendorVault && inMemoryVendorVault.vendorId) {
    return inMemoryVendorVault;
  }

  const tryLoadFile = (filePath: string): VendorVaultState | null => {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        if (!raw || !raw.trim()) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.vendorId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`[Vault Read Warning for ${filePath}]:`, e);
    }
    return null;
  };

  // Multi-Source Recovery: try primary, backup, snapshot, permanent file
  let vault = tryLoadFile(VENDOR_STORAGE_FILE) || 
              tryLoadFile(VENDOR_BACKUP_FILE) || 
              tryLoadFile(VENDOR_SNAPSHOT_FILE) ||
              tryLoadFile(VENDOR_PERMANENT_FILE);

  if (vault) {
    inMemoryVendorVault = vault;
    // Deep preserve existing user data collections
    if (!vault.orders) vault.orders = [];
    if (!vault.transactions) vault.transactions = [];
    if (!vault.inventory) vault.inventory = [];
    if (!vault.refundDeductions) vault.refundDeductions = [];
    if (!vault.pendingDishes) vault.pendingDishes = [];
    if (!vault.payoutRequests) vault.payoutRequests = [];
    if (!vault.incentiveHistory) vault.incentiveHistory = [];

    if (!vault.wallet) {
      vault.wallet = {
        totalLifetimeEarned: 0,
        currentBalance: 0,
        minimumReserve: 2000,
        tenDayHoldAmount: 0,
        lastSettlementDate: 'None',
        billingCycle: 'Friday to Thursday',
        payoutDay: 'Monday'
      };
    }

    if (!vault.incentiveConfig) {
      vault.incentiveConfig = JSON.parse(JSON.stringify(DEFAULT_INCENTIVE_CONFIG));
    } else {
      vault.incentiveConfig = {
        ...DEFAULT_INCENTIVE_CONFIG,
        ...vault.incentiveConfig,
        tiers: (vault.incentiveConfig.tiers && vault.incentiveConfig.tiers.length > 0)
          ? vault.incentiveConfig.tiers
          : DEFAULT_INCENTIVE_CONFIG.tiers
      };
    }

    if (!vault.dailyMenuConfig) {
      vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
    } else {
      if (!vault.dailyMenuConfig.regularFixedDishes) {
        vault.dailyMenuConfig.regularFixedDishes = DEFAULT_DAILY_MENU_CONFIG.regularFixedDishes;
      }
      if (!vault.dailyMenuConfig.dayWiseSchedules) {
        vault.dailyMenuConfig.dayWiseSchedules = DEFAULT_DAILY_MENU_CONFIG.dayWiseSchedules;
      }
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) {
        vault.dailyMenuConfig.monthlyCalendarOverrides = {};
      }
    }

    mergeExternalImportedOrders(vault);
    return vault;
  }

  // Only if no vault file exists anywhere, create clean seed state
  console.log('[Vendor Vault]: Initializing clean vault file...');
  const seedState: VendorVaultState = {
    vendorId: 'NIR8800',
    orders: [],
    transactions: [],
    inventory: [],
    refundDeductions: [],
    pendingDishes: [],
    payoutRequests: [],
    incentiveConfig: JSON.parse(JSON.stringify(DEFAULT_INCENTIVE_CONFIG)),
    incentiveHistory: [],
    dailyMenuConfig: JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG)),
    wallet: {
      totalLifetimeEarned: 0,
      currentBalance: 0,
      minimumReserve: 2000,
      tenDayHoldAmount: 0,
      lastSettlementDate: 'None',
      billingCycle: 'Friday to Thursday',
      payoutDay: 'Monday'
    }
  };

  mergeExternalImportedOrders(seedState);
  saveVendorVault(seedState);
  return seedState;
}

export function calculateVendorWeeklyIncentiveStats(vault: VendorVaultState): WeeklyIncentiveStats {
  const config = vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG;
  const tiers = config.tiers || [];
  
  // Delivered meals in current cycle (orders verified/delivered within last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let deliveredCount = 0;
  for (const o of (vault.orders || [])) {
    const isApprovedOrDelivered = o.verificationStatus === 'APPROVED' || o.status === 'delivered';
    const orderDate = o.createdAt ? new Date(o.createdAt) : now;
    if (isApprovedOrDelivered && orderDate >= sevenDaysAgo) {
      if (Array.isArray(o.items) && o.items.length > 0) {
        deliveredCount += o.items.reduce((s, it) => s + (it.quantity || 1), 0);
      } else {
        deliveredCount += (o.quantity || 1);
      }
    }
  }

  // Sort tiers ascending by milestoneMeals
  const sortedTiers = [...tiers].sort((a, b) => a.milestoneMeals - b.milestoneMeals);
  let currentTier: IncentiveTier | null = null;
  let nextTier: IncentiveTier | null = null;

  for (const t of sortedTiers) {
    if (deliveredCount >= t.milestoneMeals) {
      currentTier = t;
    } else {
      if (!nextTier) {
        nextTier = t;
      }
    }
  }

  const mealsNeeded = nextTier ? Math.max(0, nextTier.milestoneMeals - deliveredCount) : 0;
  const targetDenominator = nextTier ? nextTier.milestoneMeals : (currentTier ? currentTier.milestoneMeals : 50);
  const progressPercent = Math.min(100, Math.round((deliveredCount / targetDenominator) * 100));

  // Calculate incentive earned from history
  const history = vault.incentiveHistory || [];
  const cycleIncentives = history.filter(h => h.grantedAt && new Date(h.grantedAt) >= sevenDaysAgo);
  const totalIncentiveEarnedThisCycle = cycleIncentives.reduce((sum, h) => sum + (h.amount || 0), 0);
  const totalLifetimeIncentives = history.reduce((sum, h) => sum + (h.amount || 0), 0);

  return {
    deliveredMealsThisCycle: deliveredCount,
    currentMilestoneTier: currentTier,
    nextMilestoneTier: nextTier,
    mealsNeededForNextTier: mealsNeeded,
    progressPercent,
    totalIncentiveEarnedThisCycle,
    totalLifetimeIncentives,
    cycleStart: sevenDaysAgo.toISOString().split('T')[0],
    cycleEnd: now.toISOString().split('T')[0]
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function loadDynamicRateCard(): any[] {
  const syncedJsonPath = path.join(process.cwd(), 'server_rate_card_synced.json');
  const jsonBackup = readJsonSafe<any[]>(syncedJsonPath, []);
  if (Array.isArray(jsonBackup) && jsonBackup.length > 0) {
    return jsonBackup;
  }

  const syncedFile = path.join(process.cwd(), 'server_rate_card_synced.csv');
  const assetFile = path.join(process.cwd(), 'public/assets/aistudio/NOV_TIFFIN_-_Master_Vendor_Ledger___Rate_Card_142d571c');
  const filePath = fs.existsSync(syncedFile) ? syncedFile : (fs.existsSync(assetFile) ? assetFile : null);

  if (filePath) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const lines = raw.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 1) {
        const itemsMap = new Map<string, any>();
        for (let i = 1; i < lines.length; i++) {
          const parts = parseCSVLine(lines[i]);
          if (!parts || parts.length < 2 || !parts[0]) continue;
          const id = parts[0];
          const name = parts[1] || id;
          const hindiName = parts[2] || name;
          const categoryLabel = parts[3] || 'नाश्ता व स्नैक्स';
          const size = parts[4] || 'Standard';
          const listingPrice = parseFloat(parts[5]) || 99;
          const vendorPayoutRate = parseFloat(parts[6]) || 40;
          const inStock = String(parts[7] || 'YES').toUpperCase() !== 'NO';
          let cat = 'breakfast_snacks';
          let catLabel = categoryLabel || 'नाश्ता व स्नैक्स';

          const masterMatch = VENDOR_MASTER_RATE_CARD.find(m => m.id === id);
          if (masterMatch) {
            cat = masterMatch.category;
            catLabel = masterMatch.categoryLabel;
          } else {
            const lower = (id + ' ' + name + ' ' + (categoryLabel || '')).toLowerCase();
            if (lower.includes('tea') || lower.includes('chai') || lower.includes('snack') || lower.includes('samosa') || lower.includes('breakfast')) {
              cat = 'breakfast_snacks';
              catLabel = 'नाश्ता व स्नैक्स';
            } else if (lower.startsWith('mon_') || lower.includes('monday') || lower.includes('सोमवार')) {
              cat = 'monday';
              catLabel = 'सोमवार का मेनू';
            } else if (lower.startsWith('tue_') || lower.includes('tuesday') || lower.includes('मंगलवार')) {
              cat = 'tuesday';
              catLabel = 'मंगलवार का मेनू';
            } else if (lower.startsWith('wed_') || lower.includes('wednesday') || lower.includes('बुधवार')) {
              cat = 'wednesday';
              catLabel = 'बुधवार का मेनू';
            } else if (lower.startsWith('thu_') || lower.includes('thursday') || lower.includes('गुरुवार')) {
              cat = 'thursday';
              catLabel = 'गुरुवार का मेनू';
            } else if (lower.startsWith('fri_') || lower.includes('friday') || lower.includes('शुक्रवार')) {
              cat = 'friday';
              catLabel = 'शुक्रवार का मेनू';
            } else if (lower.startsWith('sat_') || lower.includes('saturday') || lower.includes('शनिवार')) {
              cat = 'saturday';
              catLabel = 'शनिवार का मेनू';
            } else if (lower.startsWith('sun_') || lower.includes('sunday') || lower.includes('रविवार')) {
              cat = 'sunday';
              catLabel = 'रविवार का मेनू';
            } else if (lower.includes('thali')) {
              cat = 'special_thali';
              catLabel = 'विशेष थाली';
            } else if (lower.includes('vrat')) {
              cat = 'vrat_special';
              catLabel = 'व्रत स्पेशल';
            } else if (lower.includes('roti') || lower.includes('paratha') || lower.includes('rice') || lower.includes('sweet') || lower.includes('halwa') || lower.includes('kheer')) {
              cat = 'breads_desserts';
              catLabel = 'ब्रेड्स, चावल व मीठा';
            }
          }

          const cleanHindi = (hindiName && hindiName !== id) ? hindiName : (id === 'tea' ? 'चाय (Special Tea)' : name);
          const cleanName = (name && name !== id) ? name : (id === 'tea' ? 'Special Tea / Chai' : name);

          if (!itemsMap.has(id)) {
            itemsMap.set(id, {
              id,
              name: cleanName,
              hindiName: cleanHindi,
              category: cat,
              categoryLabel: catLabel,
              portions: [],
              inStock
            });
          }
          const entry = itemsMap.get(id);
          entry.portions.push({
            size,
            listingPrice,
            vendorPayoutRate
          });
        }
        if (itemsMap.size > 0) {
          return Array.from(itemsMap.values());
        }
      }
    } catch (err) {
      console.error('[Rate Card CSV Parse Error]:', err);
    }
  }

  return VENDOR_MASTER_RATE_CARD;
}

export function saveRateCardToCSV(items: any[]): void {
  try {
    const headers = 'Item ID,Dish Name,Hindi Name,Category,Portion Size,Listing Price (₹),Vendor Payout Rate (₹),In Stock,Last Updated';
    const lines = [headers];
    for (const item of items) {
      const portions = Array.isArray(item.portions) ? item.portions : [{ size: item.size || 'Standard', listingPrice: item.listingPrice || 99, vendorPayoutRate: item.vendorPayoutRate || 40 }];
      for (const p of portions) {
        const row = [
          item.id || '',
          item.name || '',
          item.hindiName || item.name || '',
          item.categoryLabel || item.category || 'विविध डिशेज़',
          p.size || 'Standard',
          p.listingPrice || 99,
          p.vendorPayoutRate || 40,
          item.inStock !== false ? 'YES' : 'NO',
          new Date().toISOString().split('T')[0]
        ];
        lines.push(row.map(c => {
          const str = String(c ?? '').replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        }).join(','));
      }
    }
    const syncedFilePath = path.join(process.cwd(), 'server_rate_card_synced.csv');
    fs.writeFileSync(syncedFilePath, lines.join('\n'), 'utf-8');
    const syncedJsonPath = path.join(process.cwd(), 'server_rate_card_synced.json');
    writeJsonSafe(syncedJsonPath, items);
  } catch (e) {
    console.error('[saveRateCardToCSV Error]:', e);
  }
}

export function addRateCardItemToCSV(newItem: { id?: string; name: string; hindiName?: string; category?: string; categoryLabel?: string; portions: Array<{ size: string; listingPrice: number; vendorPayoutRate: number }>; inStock?: boolean }): string {
  const currentCard = loadDynamicRateCard();
  let baseId = (newItem.id || newItem.name.toLowerCase().replace(/[^a-z0-9]/g, '_')).replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (!baseId) baseId = `dish_${Date.now()}`;
  let finalId = baseId;
  let counter = 1;
  while (currentCard.some(i => i.id === finalId)) {
    finalId = `${baseId}_${counter++}`;
  }

  currentCard.push({
    id: finalId,
    name: newItem.name,
    hindiName: newItem.hindiName || newItem.name,
    category: newItem.category || 'breakfast_snacks',
    categoryLabel: newItem.categoryLabel || 'नाश्ता व स्नैक्स',
    portions: newItem.portions && newItem.portions.length > 0 ? newItem.portions : [{ size: 'Standard', listingPrice: 99, vendorPayoutRate: 40 }],
    inStock: newItem.inStock !== false
  });
  saveRateCardToCSV(currentCard);
  return finalId;
}

export function updateRateCardItemInCSV(itemId: string, updatedData: { name?: string; hindiName?: string; categoryLabel?: string; inStock?: boolean; portions?: Array<{ size: string; listingPrice: number; vendorPayoutRate: number }> }): boolean {
  const currentCard = loadDynamicRateCard();
  const index = currentCard.findIndex(i => i.id === itemId);
  if (index >= 0) {
    currentCard[index] = {
      ...currentCard[index],
      ...updatedData
    };
  } else {
    currentCard.push({
      id: itemId,
      name: updatedData.name || itemId,
      hindiName: updatedData.hindiName || updatedData.name || itemId,
      category: 'breakfast_snacks',
      categoryLabel: updatedData.categoryLabel || 'नाश्ता व स्नैक्स',
      portions: updatedData.portions || [{ size: 'Standard', listingPrice: 99, vendorPayoutRate: 40 }],
      inStock: updatedData.inStock !== false
    });
  }
  saveRateCardToCSV(currentCard);
  return true;
}

export function deleteRateCardItemFromCSV(itemId: string): boolean {
  const currentCard = loadDynamicRateCard();
  const filtered = currentCard.filter(i => i.id !== itemId);
  saveRateCardToCSV(filtered);
  return true;
}

/**
 * Register Vendor Routes on Express App
 */
export function registerVendorRoutes(app: express.Express, authenticateStaffOrOwner: (req: express.Request) => any, getSubscriptions: () => any[]): void {

  // 1. Get Master Rate Card (Live loaded from CSV + approved custom dishes)
  app.get('/api/vendor/rate-card', async (_req, res) => {
    const vault = loadVendorVault();
    const dynamicRateCard = loadDynamicRateCard();
    const approvedCustom = (vault.pendingDishes || []).filter(d => d.status === 'APPROVED');
    
    // Merge master dynamic rate card with approved custom dishes if not already in dynamicRateCard
    const existingIds = new Set(dynamicRateCard.map(i => i.id));
    const fullRateCard = [...dynamicRateCard];
    for (const d of approvedCustom) {
      if (!existingIds.has(d.id)) {
        fullRateCard.push({
          id: d.id,
          name: d.name,
          hindiName: d.hindiName,
          category: d.category as any,
          categoryLabel: d.categoryLabel,
          portions: d.portions as any,
          inStock: true
        });
      }
    }

    res.json({
      success: true,
      rateCard: fullRateCard,
      pendingDishes: (vault.pendingDishes || []).filter(d => d.status === 'PENDING'),
      syncedSource: 'Owner Managed Master Rate Card (Internal)',
      contractTerms: {
        vendorId: 'NIR8800',
        paymentCycle: 'Friday to Thursday',
        payoutDay: 'Every Monday',
        minimumReserveAmount: 2000,
        tenDayHoldApplicable: true,
        wastageLossBufferPercent: '7% - 12%'
      }
    });
  });

  // 1b-2. Vendor Change / Setup Password Endpoint
  app.post('/api/vendor/change-password', (req, res) => {
    try {
      const { vendorId, currentPassword, newPassword } = req.body || {};
      const targetId = String(vendorId || 'NIR8800').trim();
      const cleanNew = String(newPassword || '').trim();
      const cleanCurrent = String(currentPassword || '').trim();

      if (!cleanNew || cleanNew.length < 4) {
        return res.status(400).json({ success: false, message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' });
      }

      const staffVaultPath = path.join(process.cwd(), 'server_staff_vault.json');
      if (fs.existsSync(staffVaultPath)) {
        const staff = JSON.parse(fs.readFileSync(staffVaultPath, 'utf-8'));
        const member = staff.find((s: any) => 
          s.id.toLowerCase() === targetId.toLowerCase() || 
          (Array.isArray(s.userIds) && s.userIds.map((u: string) => u.toLowerCase()).includes(targetId.toLowerCase()))
        );
        if (member) {
          if (cleanCurrent && Array.isArray(member.passwords) && !member.passwords.includes(cleanCurrent)) {
            return res.status(401).json({ success: false, message: 'वर्तमान पासवर्ड अमान्य है।' });
          }
          if (!member.passwords) member.passwords = [];
          if (!member.passwords.includes(cleanNew)) {
            member.passwords.unshift(cleanNew);
          }
          fs.writeFileSync(staffVaultPath, JSON.stringify(staff, null, 2), 'utf-8');
          return res.json({ success: true, message: 'नया वेंडर पासवर्ड सफलतापूर्वक सेट व सुरक्षित हो गया!' });
        }
      }
      return res.status(404).json({ success: false, message: 'वेंडर खाता नहीं मिला।' });
    } catch (err: any) {
      console.error('[Vendor Change Password Error]:', err);
      return res.status(500).json({ success: false, message: 'पासवर्ड अपडेट करने में सर्वर समस्या।' });
    }
  });

  // 1b. Manually Upload / Sync CSV Rate Card
  app.post('/api/vendor/rate-card/sync-csv', (req, res) => {
    try {
      const { csvContent } = req.body || {};
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ success: false, message: 'CSV कंटेंट अनिवार्य है।' });
      }

      fs.writeFileSync(path.join(process.cwd(), 'server_rate_card_synced.csv'), csvContent.trim(), 'utf-8');
      const updated = loadDynamicRateCard();
      res.json({
        success: true,
        count: updated.length,
        rateCard: updated,
        message: `सफलतापूर्वक ${updated.length} डिशेज़ Google Sheet / CSV से लोड हो गई हैं!`
      });
    } catch (err: any) {
      console.error('[Sync CSV Error]:', err);
      res.status(500).json({ success: false, message: 'CSV सिंक करने में सर्वर समस्या।' });
    }
  });

  // 2. Submit Custom Food Item for Owner Approval
  app.post('/api/vendor/rate-card/submit-dish', (req, res) => {
    try {
      const { name, hindiName, category, categoryLabel, portions, notes } = req.body || {};
      if (!name || !portions || !Array.isArray(portions) || portions.length === 0) {
        return res.status(400).json({ success: false, message: 'डिश का नाम और पोर्शन रेट आवश्यक हैं।' });
      }

      const vault = loadVendorVault();
      if (!vault.pendingDishes) vault.pendingDishes = [];

      const newDish: CustomDishSubmission = {
        id: `dish_custom_${Date.now()}`,
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        category: category || 'custom_special',
        categoryLabel: categoryLabel || 'स्पेशल मील',
        portions: portions.map((p: any) => ({
          size: String(p.size || 'Standard'),
          listingPrice: Number(p.listingPrice || 149),
          vendorPayoutRate: Number(p.vendorPayoutRate || 60)
        })),
        submittedAt: new Date().toISOString(),
        status: 'PENDING',
        notes: notes || ''
      };

      vault.pendingDishes.unshift(newDish);
      saveVendorVault(vault);

      // Auto-push to Google Sheet DishApprovals tab if Web App deployed!
      pushEventToGoogleSheet('vendor_dish_submission', { dish: newDish });

      console.log(`[Vendor Custom Dish]: Submitted ${newDish.name} for Owner Approval.`);
      res.json({
        success: true,
        dish: newDish,
        message: 'डिश ओनर अप्रूवल हेतु सबमिट कर दी गई है। अप्रूव होते ही आपके मेन्यू में लाइव होगी।'
      });
    } catch (err: any) {
      console.error('[Submit Dish Error]:', err);
      res.status(500).json({ success: false, message: 'डिश सबमिट करने में सर्वर समस्या।' });
    }
  });

  // 3. Get Vendor Wallet Summary & Financial Rules
  app.get('/api/vendor/wallet', (_req, res) => {
    const vault = loadVendorVault();
    const balance = vault.wallet.currentBalance;
    const reserve = vault.wallet.minimumReserve || 2000;
    const hold = vault.wallet.tenDayHoldAmount || 0;
    
    // Reserve calculation logic
    const currentReserveAccumulated = Math.min(balance, reserve);
    const remainingReserveNeeded = Math.max(0, reserve - balance);
    const eligibleAmount = Math.max(0, balance - reserve - hold);
    const incentiveStats = calculateVendorWeeklyIncentiveStats(vault);

    res.json({
      success: true,
      wallet: {
        ...vault.wallet,
        currentBalance: balance,
        minimumReserve: reserve,
        currentReserveAccumulated,
        remainingReserveNeeded,
        tenDayHoldAmount: hold,
        eligibleTuesdayPayout: eligibleAmount,
        eligibleMondayPayout: eligibleAmount,
        canRequestPayout: eligibleAmount > 0,
        refundDeductionsTotal: (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0),
        ruleSummary: {
          minimumReserveRule: 'वॉलेट में हमेशा ₹2,000 न्यूनतम रिज़र्व बैलेंस रहेगा।',
          payoutSchedule: 'शुक्रवार से गुरुवार के बिलिंग चक्र का भुगतान 1 हफ्ते के रोलिंग अंतराल पर हर मंगलवार (Tuesday) को ट्रांसफर होगा।',
          tenDayHoldRule: '10 दिन का भुगतान होल्ड पर रहेगा, जो DNS/डिस्प्यूट समाधान के समय रिलीज होगा।',
          refundDeductionRule: 'कस्टमर कैंसिलेशन/रिफंड होने पर तय वेंडर का हिस्सा वॉलेट से स्वतः कटेगा।'
        }
      },
      transactions: vault.transactions.slice(0, 50),
      refundDeductions: (vault.refundDeductions || []).slice(0, 30),
      payoutRequests: vault.payoutRequests || [],
      incentiveStats,
      incentiveConfig: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
      incentiveHistory: (vault.incentiveHistory || []).slice(0, 50)
    });
  });

  // 3b. Vendor Submit Payout Request (No upper limit - any amount up to eligible balance > 2000)
  app.post('/api/vendor/payout/request', (req, res) => {
    try {
      const { amount, upiId, notes } = req.body || {};
      const numAmt = Number(amount);
      const vault = loadVendorVault();
      if (!vault.payoutRequests) vault.payoutRequests = [];

      const balance = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2000;
      const eligibleAmount = Math.max(0, balance - reserve);

      if (eligibleAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: `पेआउट रिक्वेस्ट केवल तभी भेजी जा सकती है जब वॉलेट बैलेंस ₹2,000 रिज़र्व से अधिक हो। आपका वर्तमान बैलेंस: ₹${balance}`
        });
      }

      if (!numAmt || numAmt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'कृपया मान्य पेआउट राशि दर्ज करें।'
        });
      }

      if (numAmt > eligibleAmount) {
        return res.status(400).json({
          success: false,
          message: `अनुरोधित राशि (₹${numAmt}) आपकी अधिकतम देय राशि (₹${eligibleAmount}) से अधिक नहीं हो सकती।`
        });
      }

      const newRequest = {
        id: `payout_req_${Date.now()}`,
        amount: numAmt,
        requestedAt: new Date().toISOString(),
        status: 'PENDING' as const,
        upiId: String(upiId || '9118409672@upi').trim(),
        notes: String(notes || '').trim()
      };

      vault.payoutRequests.unshift(newRequest);
      saveVendorVault(vault);

      res.json({
        success: true,
        payoutRequest: newRequest,
        message: `₹${numAmt} की पेआउट रिक्वेस्ट सफलतापूर्वक ओनर पैनल में भेज दी गई है! मालिक द्वारा अप्रूव होते ही आपके UPI/बैंक में ट्रांसफर हो जाएगी।`
      });
    } catch (err: any) {
      console.error('[Vendor Payout Request Error]:', err);
      res.status(500).json({ success: false, message: 'पेआउट रिक्वेस्ट दर्ज करने में समस्या।' });
    }
  });

  // 4. Record Customer Refund / Cancellation Deduction from Vendor Wallet
  app.post('/api/vendor/orders/refund-deduct', (req, res) => {
    try {
      const { orderId, customerRefundAmount, vendorCutDeduction, reason } = req.body || {};
      if (!orderId || !vendorCutDeduction) {
        return res.status(400).json({ success: false, message: 'Order ID और वेंडर कटौती राशि अनिवार्य है।' });
      }

      const vault = loadVendorVault();
      if (!vault.refundDeductions) vault.refundDeductions = [];

      const cut = Math.max(0, Number(vendorCutDeduction));
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - cut);

      const record: RefundDeductionRecord = {
        id: `deduct_${Date.now()}`,
        orderId: String(orderId).trim(),
        customerRefundAmount: Number(customerRefundAmount || 0),
        vendorCutDeducted: cut,
        reason: String(reason || 'Customer Cancellation / Food Quality Refund').trim(),
        timestamp: new Date().toISOString(),
        status: 'deducted'
      };

      vault.refundDeductions.unshift(record);

      vault.transactions.unshift({
        id: `txn_deduct_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'refund_deduction',
        amount: -cut,
        description: `रिफंड कटौती: Order #${record.orderId} (${record.reason})`,
        referenceId: record.orderId,
        balanceAfter: vault.wallet.currentBalance,
        status: 'settled',
        cyclePeriod: 'Current Settlement Cycle'
      });

      saveVendorVault(vault);
      console.log(`[Vendor Refund Deduction]: Deducted ₹${cut} for Order #${record.orderId}. New Balance: ₹${vault.wallet.currentBalance}`);

      res.json({
        success: true,
        deduction: record,
        wallet: vault.wallet,
        message: `सफलतापूर्वक ₹${cut} वेंडर के वॉलेट से काट लिए गए (Order #${record.orderId})।`
      });
    } catch (err: any) {
      console.error('[Refund Deduct Error]:', err);
      res.status(500).json({ success: false, message: 'रिफंड कटौती प्रोसेस करने में सर्वर समस्या।' });
    }
  });

  // 5. Get Live Orders (Both 3P Punched + Auto-Synced TiffinMate Website Orders)
  app.get('/api/vendor/orders', (_req, res) => {
    const vault = loadVendorVault();
    const subs = getSubscriptions() || [];

    // Auto-sync active subscriptions into vendor feed WITHOUT leaking Customer PII
    const autoSyncedTiffinOrders: VendorPunchedOrder[] = subs
      .filter(s => s && s.status === 'active' && s.approvalStatus !== 'pending_approval')
      .slice(0, 20)
      .map(s => {
        const planName = s.planName || 'Homestyle Executive Thali';
        const isDiet = String(s.dietaryType || '').toLowerCase().includes('diet');
        const isJain = String(s.dietaryType || '').toLowerCase().includes('jain');
        
        let payout = 80; // Standard Daily Thali
        if (planName.toLowerCase().includes('deluxe')) payout = 100;
        if (planName.toLowerCase().includes('premium')) payout = 135;

        return {
          id: `tiffin_sync_${s.id}`,
          orderNumber: `TFN-${String(s.id).slice(-6).toUpperCase()}`,
          source: 'tiffin_website',
          platformOrderId: `TFN-WEB-${String(s.id).slice(-6)}`,
          itemId: 'auto_tiffin_thali',
          itemName: `Tiffin: ${planName}`,
          portionSize: 'Standard',
          quantity: 1,
          listingPrice: s.pricePerMeal || 130,
          vendorPayoutRate: payout,
          totalVendorPayout: payout,
          status: 'ready',
          createdAt: s.startDate || new Date().toISOString(),
          timeSlot: s.mealTime || 'Lunch 12:30 PM - 1:30 PM',
          riderName: 'TiffinMate Central Fleet Rider',
          riderEta: 'Scheduled Dispatch',
          notes: `${isJain ? 'No Onion No Garlic (Jain)' : isDiet ? 'High Protein Less Oil' : 'Pure Desi Ghee Homestyle'}`,
          dietaryType: s.dietaryType || 'Veg',
          payoutCreditedToWallet: true
        };
      });

    // Combine 3P orders and Auto-synced Tiffin orders
    const allOrders = [...vault.orders, ...autoSyncedTiffinOrders];

    res.json({
      success: true,
      vendorId: vault.vendorId,
      orders: allOrders,
      counts: {
        total: allOrders.length,
        thirdParty: vault.orders.length,
        tiffinAutoSynced: autoSyncedTiffinOrders.length,
        pending: allOrders.filter(o => o.status === 'received' || o.status === 'preparing').length,
        ready: allOrders.filter(o => o.status === 'ready').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length
      }
    });
  });

  // 6. Punch 3P Order (Supports BOTH Multi-Meal Basket & Single Item with 1 Order ID)
  app.post('/api/vendor/orders/punch-3p', (req, res) => {
    try {
      const {
        source,
        platformOrderId,
        items, // Optional array of items in this single order: [{ itemId, portionSize, quantity }]
        itemId,
        portionSize,
        quantity,
        timeSlot,
        notes
      } = req.body || {};

      if (!source || !platformOrderId) {
        return res.status(400).json({
          success: false,
          message: 'कृपया प्लेटफॉर्म (Zomato/Swiggy) और आर्डर ID दर्ज करें।'
        });
      }

      const vault = loadVendorVault();
      
      // Prevent duplicate order ID
      const existing = vault.orders.find(o => o.platformOrderId === String(platformOrderId).trim());
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `ऑर्डर ID "${platformOrderId}" पहले से दर्ज है (No Duplicate Allowed)।`
        });
      }

      const allDishes = [...loadDynamicRateCard(), ...(vault.pendingDishes || []).filter(d => d.status === 'APPROVED')];

      // Build items array
      let orderItems: VendorOrderItem[] = [];
      let totalPayout = 0;
      let totalQty = 0;

      if (Array.isArray(items) && items.length > 0) {
        // Multi-meal order
        for (const itm of items) {
          const rateItem = allDishes.find(i => i.id === itm.itemId);
          if (rateItem) {
            const cleanQty = Math.max(1, parseInt(itm.quantity, 10) || 1);
            const portionData = rateItem.portions.find(p => p.size.toLowerCase() === String(itm.portionSize || '').toLowerCase()) || rateItem.portions[0];
            const rate = portionData.vendorPayoutRate;
            const itemTotal = rate * cleanQty;

            orderItems.push({
              itemId: rateItem.id,
              itemName: rateItem.name,
              hindiName: rateItem.hindiName,
              portionSize: portionData.size,
              quantity: cleanQty,
              listingPrice: portionData.listingPrice,
              vendorPayoutRate: rate,
              totalVendorPayout: itemTotal
            });

            totalPayout += itemTotal;
            totalQty += cleanQty;
          }
        }
      } else if (itemId) {
        // Single item fallback
        const rateItem = allDishes.find(i => i.id === itemId);
        if (rateItem) {
          const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);
          const portionData = rateItem.portions.find(p => p.size.toLowerCase() === String(portionSize || '').toLowerCase()) || rateItem.portions[0];
          const rate = portionData.vendorPayoutRate;
          const itemTotal = rate * cleanQty;

          orderItems.push({
            itemId: rateItem.id,
            itemName: rateItem.name,
            hindiName: rateItem.hindiName,
            portionSize: portionData.size,
            quantity: cleanQty,
            listingPrice: portionData.listingPrice,
            vendorPayoutRate: rate,
            totalVendorPayout: itemTotal
          });

          totalPayout = itemTotal;
          totalQty = cleanQty;
        }
      }

      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'कृपया कम से कम एक मान्य आइटम बास्केट में जोड़ें।'
        });
      }

      // Readable summary of dishes in this single order
      const summaryName = orderItems.map(i => `${i.itemName} (${i.portionSize}) x${i.quantity}`).join(' + ');

      const newOrder: VendorPunchedOrder = {
        id: `ord_3p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderNumber: String(platformOrderId).trim(),
        source: source as any,
        platformOrderId: String(platformOrderId).trim(),
        items: orderItems,
        itemId: orderItems[0].itemId,
        itemName: summaryName,
        portionSize: orderItems.length === 1 ? orderItems[0].portionSize : 'Multiple Portions',
        quantity: totalQty,
        listingPrice: orderItems.reduce((acc, i) => acc + (i.listingPrice * i.quantity), 0),
        vendorPayoutRate: totalPayout / Math.max(1, totalQty),
        totalVendorPayout: totalPayout,
        status: 'preparing',
        createdAt: new Date().toISOString(),
        timeSlot: timeSlot || 'Immediate Dispatch (15-20 mins)',
        riderName: `${source.toUpperCase()} Rider Assigned`,
        riderEta: '12 mins',
        notes: notes || '',
        payoutCreditedToWallet: false,
        verificationStatus: 'PENDING',
        isMultiItem: orderItems.length > 1
      };

      vault.orders.unshift(newOrder);

      // Consume packaging boxes from inventory
      const packagingItem = vault.inventory.find(i => i.category === 'packaging' && i.currentStock > 0);
      if (packagingItem) {
        packagingItem.currentStock = Math.max(0, packagingItem.currentStock - totalQty);
        packagingItem.lastUpdated = new Date().toISOString();
        if (packagingItem.currentStock <= packagingItem.minThreshold) {
          packagingItem.status = packagingItem.currentStock === 0 ? 'critical' : 'low';
        }
      }

      saveVendorVault(vault);

      // Auto-push to Google Sheet LiveOrders tab if Web App deployed!
      pushEventToGoogleSheet('new_vendor_order', { order: newOrder });

      console.log(`[Vendor 3P Punch]: Order ${newOrder.orderNumber} punched with ${orderItems.length} items. Total Payout: ₹${totalPayout}`);

      res.json({
        success: true,
        order: newOrder,
        message: `ऑर्डर ${newOrder.orderNumber} (${orderItems.length} आइटम्स) सफलतापूर्वक दर्ज हुआ! कुक स्टेशन पर तैयारी शुरू।`
      });
    } catch (err: any) {
      console.error('[Vendor 3P Punch Error]:', err);
      res.status(500).json({ success: false, message: 'ऑर्डर दर्ज करने में सर्वर समस्या।' });
    }
  });

  // 7. Update Order Status & Credit Wallet upon Delivery
  app.post('/api/vendor/orders/update-status', (req, res) => {
    try {
      const { orderId, newStatus } = req.body || {};
      if (!orderId || !newStatus) {
        return res.status(400).json({ success: false, message: 'Order ID और स्टेटस अनिवार्य हैं।' });
      }

      const vault = loadVendorVault();
      const order = vault.orders.find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'ऑर्डर नहीं मिला।' });
      }

      order.status = newStatus;

      // When order is marked delivered by vendor, require Devi (Owner) approval before crediting wallet
      let message = `ऑर्डर स्टेटस "${newStatus}" अपडेट हो गया।`;
      if (newStatus === 'delivered') {
        if (order.verificationStatus === 'APPROVED' && !order.payoutCreditedToWallet) {
          order.payoutCreditedToWallet = true;
          const payout = order.totalVendorPayout || 0;
          vault.wallet.currentBalance += payout;
          vault.wallet.totalLifetimeEarned += payout;

          vault.transactions.unshift({
            id: `txn_ord_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'order_credit',
            amount: payout,
            description: `Order Settlement: ${order.itemName} (${order.orderNumber})`,
            referenceId: order.orderNumber,
            balanceAfter: vault.wallet.currentBalance,
            status: 'settled',
            cyclePeriod: 'Current Fri-Thu Cycle'
          });
          message = `ऑर्डर डिलीवर हो गया और ₹${payout} वॉलेट में क्रेडिट हो गया!`;
        } else if (!order.payoutCreditedToWallet) {
          order.verificationStatus = 'PENDING_APPROVAL';
          message = `ऑर्डर डिलीवर मार्क हो गया! 'देवी' (मालिक) द्वारा अप्रूवल मिलते ही ₹${order.totalVendorPayout} आपके वॉलेट में जुड़ जाएगा।`;
        }
      }

      saveVendorVault(vault);

      // Auto-push order status update to Google Sheet
      pushEventToGoogleSheet('order_status_update', { orderId, newStatus, currentBalance: vault.wallet.currentBalance });

      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message
      });
    } catch (err: any) {
      console.error('[Vendor Status Update Error]:', err);
      res.status(500).json({ success: false, message: 'स्टेटस अपडेट करने में समस्या।' });
    }
  });

  // 8. Google Sheets Integration Removed (Replaced by Owner Panel)
  app.get('/api/vendor/sheets/status', (_req, res) => {
    res.json({
      success: true,
      sheetConfig: null,
      managedViaOwnerPanel: true,
      message: 'Google Sheets removed cleanly. All rate cards, orders, and settlements managed in Owner Panel.'
    });
  });

  // 9. Kitchen Inventory & Stock (Vendor & Owner)
  app.get('/api/vendor/inventory', (_req, res) => {
    const vault = loadVendorVault();
    res.json({
      success: true,
      inventory: vault.inventory || []
    });
  });

  app.post('/api/vendor/inventory/update', (req, res) => {
    try {
      const { itemId, changeAmount, newQuantity } = req.body || {};
      const vault = loadVendorVault();
      const item = (vault.inventory || []).find(i => i.id === itemId);
      
      if (!item) {
        return res.status(404).json({ success: false, message: 'इन्वेंटरी आइटम नहीं मिला।' });
      }

      if (newQuantity !== undefined) {
        item.currentStock = Math.max(0, Number(newQuantity));
      } else if (changeAmount !== undefined) {
        item.currentStock = Math.max(0, item.currentStock + Number(changeAmount));
      }

      item.lastUpdated = new Date().toISOString();
      item.status = item.currentStock <= item.minThreshold 
        ? (item.currentStock === 0 ? 'critical' : 'low') 
        : 'sufficient';

      saveVendorVault(vault);

      res.json({
        success: true,
        item,
        message: `${item.name} का स्टॉक अपडेट हो गया (${item.currentStock} ${item.unit})`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'स्टॉक अपडेट करने में समस्या।' });
    }
  });

  app.post('/api/owner/vendor/inventory/add', (req, res) => {
    try {
      const { name, hindiName, category, currentStock, unit, minThreshold } = req.body || {};
      if (!name) return res.status(400).json({ success: false, message: 'आइटम का नाम आवश्यक है।' });
      
      const vault = loadVendorVault();
      if (!vault.inventory) vault.inventory = [];

      const newItem: KitchenInventoryItem = {
        id: `inv_${Date.now()}`,
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        category: (category || 'raw_materials') as any,
        currentStock: Math.max(0, Number(currentStock || 0)),
        unit: String(unit || 'KG').trim(),
        minThreshold: Math.max(1, Number(minThreshold || 5)),
        status: (Number(currentStock || 0) <= Number(minThreshold || 5)) ? 'low' : 'sufficient',
        lastUpdated: new Date().toISOString()
      };

      vault.inventory.push(newItem);
      saveVendorVault(vault);

      res.json({ success: true, item: newItem, message: `नया इन्वेंट्री आइटम "${newItem.name}" जोड़ा गया!` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'इन्वेंटरी आइटम जोड़ने में समस्या।' });
    }
  });

  // =========================================================================
  // 10. OWNER PANEL: MASTER RATE CARD & VENDOR OPERATIONS MANAGEMENT
  // Authoritative owner endpoints replacing Google Sheets
  // =========================================================================
  app.get('/api/owner/vendor/overview', (_req, res) => {
    try {
      const vault = loadVendorVault();
      const dynamicRateCard = loadDynamicRateCard();
      const grossEarned = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2000;
      const currentReserveAccumulated = Math.min(grossEarned, reserve);
      const remainingReserveNeeded = Math.max(0, reserve - grossEarned);
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);
      const incentiveStats = calculateVendorWeeklyIncentiveStats(vault);

      res.json({
        success: true,
        rateCard: dynamicRateCard,
        pendingDishes: vault.pendingDishes || [],
        orders: vault.orders || [],
        wallet: {
          ...vault.wallet,
          currentReserveAccumulated,
          remainingReserveNeeded,
          eligibleTuesdayPayout: eligiblePay,
          eligibleMondayPayout: eligiblePay,
          totalRefundDeductions
        },
        dailyMenuConfig: vault.dailyMenuConfig || DEFAULT_DAILY_MENU_CONFIG,
        transactions: vault.transactions || [],
        refundDeductions: vault.refundDeductions || [],
        inventory: vault.inventory || [],
        payoutRequests: vault.payoutRequests || [],
        incentiveStats,
        incentiveConfig: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
        incentiveHistory: (vault.incentiveHistory || []).slice(0, 50)
      });
    } catch (err: any) {
      console.error('[Owner Vendor Overview Error]:', err);
      res.status(500).json({ success: false, message: 'वेंडर डेटा लोड करने में त्रुटि।' });
    }
  });

  // =========================================================================
  // 11. DAILY MENU & REGULAR FIX MENU MANAGEMENT APIS (Vendor & Owner)
  // =========================================================================
  app.get('/api/vendor/daily-menu', (_req, res) => {
    try {
      const vault = loadVendorVault();
      const dailyConfig = vault.dailyMenuConfig || DEFAULT_DAILY_MENU_CONFIG;
      
      const now = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayId = dayNames[now.getDay()] || 'monday';

      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${yyyy}-${mm}-${dd}`;

      // Check date override first
      const override = dailyConfig.monthlyCalendarOverrides?.[todayDateStr];
      const weeklyFallback = dailyConfig.dayWiseSchedules[todayDayId] || dailyConfig.dayWiseSchedules.monday;

      const todaySchedule = override || weeklyFallback;

      res.json({
        success: true,
        todayDayId,
        todayDateStr,
        isCustomOverride: Boolean(override),
        todaySchedule,
        dailyMenuConfig: dailyConfig
      });
    } catch (err: any) {
      console.error('[Get Daily Menu Error]:', err);
      res.status(500).json({ success: false, message: 'दैनिक मेनू लोड करने में त्रुटि।' });
    }
  });

  // Get Monthly Calendar Grid Data (Owner & Vendor)
  app.get('/api/owner/daily-menu/monthly-calendar', (req, res) => {
    try {
      const year = parseInt(String(req.query.year || new Date().getFullYear()), 10);
      const month = parseInt(String(req.query.month || (new Date().getMonth() + 1)), 10); // 1-12

      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) vault.dailyMenuConfig.monthlyCalendarOverrides = {};

      const overrides = vault.dailyMenuConfig.monthlyCalendarOverrides;
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const hindiDayNames: Record<string, string> = {
        sunday: 'रविवार',
        monday: 'सोमवार',
        tuesday: 'मंगलवार',
        wednesday: 'बुधवार',
        thursday: 'गुरुवार',
        friday: 'शुक्रवार',
        saturday: 'शनिवार'
      };

      const daysInMonth = new Date(year, month, 0).getDate();
      const calendarDays: Array<{
        dateStr: string; // YYYY-MM-DD
        dayOfMonth: number;
        dayOfWeek: string;
        dayNameHindi: string;
        isCustomOverride: boolean;
        specialCurry: string;
        specialRice: string;
        specialBread: string;
        lunchCount: number;
        dinnerCount: number;
        scheduleDetails: any;
      }> = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const mm = String(month).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        const dayOfWeek = dayNames[dateObj.getDay()] || 'monday';

        const custom = overrides[dateStr];
        const weeklyFallback = vault.dailyMenuConfig.dayWiseSchedules[dayOfWeek] || vault.dailyMenuConfig.dayWiseSchedules.monday;

        if (custom) {
          calendarDays.push({
            dateStr,
            dayOfMonth: d,
            dayOfWeek,
            dayNameHindi: hindiDayNames[dayOfWeek] || 'सोमवार',
            isCustomOverride: true,
            specialCurry: custom.specialCurry || weeklyFallback.specialCurry || 'दैनिक विशेष',
            specialRice: custom.specialRice || weeklyFallback.specialRice || 'जीरा राइस',
            specialBread: custom.specialBread || weeklyFallback.specialBread || 'तवा रोटी',
            lunchCount: (custom.lunchDishes || []).length,
            dinnerCount: (custom.dinnerDishes || []).length,
            scheduleDetails: custom
          });
        } else {
          calendarDays.push({
            dateStr,
            dayOfMonth: d,
            dayOfWeek,
            dayNameHindi: hindiDayNames[dayOfWeek] || 'सोमवार',
            isCustomOverride: false,
            specialCurry: weeklyFallback.specialCurry || 'दैनिक विशेष',
            specialRice: weeklyFallback.specialRice || 'जीरा राइस',
            specialBread: weeklyFallback.specialBread || 'तवा रोटी',
            lunchCount: (weeklyFallback.lunchDishes || []).length,
            dinnerCount: (weeklyFallback.dinnerDishes || []).length,
            scheduleDetails: weeklyFallback
          });
        }
      }

      res.json({
        success: true,
        year,
        month,
        totalDays: daysInMonth,
        calendarDays,
        dailyMenuConfig: vault.dailyMenuConfig
      });
    } catch (err: any) {
      console.error('[Get Monthly Calendar Error]:', err);
      res.status(500).json({ success: false, message: 'कैलेंडर लोड करने में त्रुटि।' });
    }
  });

  // Bulk Update Calendar Dates (Owner Panel)
  app.post('/api/owner/daily-menu/bulk-update-calendar', (req, res) => {
    try {
      const { dates, action, templateDayId, specialCurry, specialRice, specialBread, lunchDishes, dinnerDishes, regularFixedDishes, notes } = req.body || {};
      
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ success: false, message: 'कम से कम एक तारीख (Date) चुनें।' });
      }

      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      if (!vault.dailyMenuConfig.monthlyCalendarOverrides) vault.dailyMenuConfig.monthlyCalendarOverrides = {};

      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const hindiDayNames: Record<string, string> = {
        sunday: 'रविवार',
        monday: 'सोमवार',
        tuesday: 'मंगलवार',
        wednesday: 'बुधवार',
        thursday: 'गुरुवार',
        friday: 'शुक्रवार',
        saturday: 'शनिवार'
      };

      if (action === 'clear_override') {
        // Remove overrides for selected dates
        for (const dt of dates) {
          delete vault.dailyMenuConfig.monthlyCalendarOverrides[dt];
        }
      } else if (action === 'apply_template' && templateDayId) {
        // Copy weekly day template to selected dates
        const template = vault.dailyMenuConfig.dayWiseSchedules[templateDayId] || vault.dailyMenuConfig.dayWiseSchedules.monday;
        for (const dt of dates) {
          const parts = dt.split('-');
          const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const dayOfWeek = dayNames[dateObj.getDay()] || 'monday';

          vault.dailyMenuConfig.monthlyCalendarOverrides[dt] = {
            date: dt,
            dayNameHindi: hindiDayNames[dayOfWeek] || 'सोमवार',
            specialCurry: template.specialCurry,
            specialRice: template.specialRice,
            specialBread: template.specialBread,
            lunchDishes: JSON.parse(JSON.stringify(template.lunchDishes || [])),
            dinnerDishes: JSON.parse(JSON.stringify(template.dinnerDishes || [])),
            isCustomOverride: true,
            notes: notes || `Template ${template.dayNameHindi} applied by Owner`
          };
        }
      } else {
        // Apply custom dishes & highlights to selected dates
        for (const dt of dates) {
          const parts = dt.split('-');
          const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const dayOfWeek = dayNames[dateObj.getDay()] || 'monday';
          const existing = vault.dailyMenuConfig.monthlyCalendarOverrides[dt] || {
            date: dt,
            dayNameHindi: hindiDayNames[dayOfWeek] || 'सोमवार',
            lunchDishes: [],
            dinnerDishes: []
          };

          if (specialCurry !== undefined) existing.specialCurry = String(specialCurry).trim();
          if (specialRice !== undefined) existing.specialRice = String(specialRice).trim();
          if (specialBread !== undefined) existing.specialBread = String(specialBread).trim();
          if (Array.isArray(lunchDishes)) existing.lunchDishes = lunchDishes;
          if (Array.isArray(dinnerDishes)) existing.dinnerDishes = dinnerDishes;
          existing.isCustomOverride = true;
          if (notes) existing.notes = String(notes).trim();

          vault.dailyMenuConfig.monthlyCalendarOverrides[dt] = existing;
        }
      }

      if (Array.isArray(regularFixedDishes) && regularFixedDishes.length > 0) {
        vault.dailyMenuConfig.regularFixedDishes = regularFixedDishes;
      }

      vault.dailyMenuConfig.lastUpdated = new Date().toISOString();
      saveVendorVault(vault);

      res.json({
        success: true,
        updatedDatesCount: dates.length,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `${dates.length} तारीखों पर दैनिक व फिक्स मेनू सफलता से बल्क अपडेट व सहेजा गया!`
      });
    } catch (err: any) {
      console.error('[Bulk Update Calendar Error]:', err);
      res.status(500).json({ success: false, message: 'बल्क कैलेंडर अपडेट करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/daily-menu/update-day', (req, res) => {
    try {
      const { dayId, specialCurry, specialRice, specialBread, lunchDishes, dinnerDishes } = req.body || {};
      if (!dayId) {
        return res.status(400).json({ success: false, message: 'Day ID (monday, tuesday, etc.) अनिवार्य है।' });
      }

      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));

      const existingDay = vault.dailyMenuConfig.dayWiseSchedules[dayId];
      if (!existingDay) {
        return res.status(404).json({ success: false, message: `दिन ${dayId} का शेड्यूल नहीं मिला।` });
      }

      if (specialCurry !== undefined) existingDay.specialCurry = String(specialCurry).trim();
      if (specialRice !== undefined) existingDay.specialRice = String(specialRice).trim();
      if (specialBread !== undefined) existingDay.specialBread = String(specialBread).trim();
      if (Array.isArray(lunchDishes)) existingDay.lunchDishes = lunchDishes;
      if (Array.isArray(dinnerDishes)) existingDay.dinnerDishes = dinnerDishes;

      vault.dailyMenuConfig.lastUpdated = new Date().toISOString();
      saveVendorVault(vault);

      res.json({
        success: true,
        updatedDay: existingDay,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `${existingDay.dayNameHindi} का मेनू शेड्यूल मालिक (देवी) द्वारा अपडेट व सहेजा गया!`
      });
    } catch (err: any) {
      console.error('[Update Day Menu Error]:', err);
      res.status(500).json({ success: false, message: 'दिन का मेनू अपडेट करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/daily-menu/add-dish', (req, res) => {
    try {
      const { target, dayId, mealSlot, dishId, name, hindiName, listingPrice, vendorPayoutRate } = req.body || {};
      if (!dishId || !name) {
        return res.status(400).json({ success: false, message: 'Dish ID और नाम अनिवार्य हैं।' });
      }

      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));

      const newDish: DailyMenuItem = {
        dishId: String(dishId).trim(),
        name: String(name).trim(),
        hindiName: String(hindiName || name).trim(),
        listingPrice: Math.max(1, Number(listingPrice || 99)),
        vendorPayoutRate: Math.max(1, Number(vendorPayoutRate || 40)),
        mealSlot: (mealSlot || 'all_day') as any,
        isFixedDaily: target === 'regular_fixed'
      };

      if (target === 'regular_fixed') {
        // Add to regular fixed menu
        const exists = vault.dailyMenuConfig.regularFixedDishes.some(d => d.dishId === newDish.dishId);
        if (!exists) {
          vault.dailyMenuConfig.regularFixedDishes.push(newDish);
        }
      } else if (dayId && vault.dailyMenuConfig.dayWiseSchedules[dayId]) {
        const dayObj = vault.dailyMenuConfig.dayWiseSchedules[dayId];
        if (mealSlot === 'dinner') {
          dayObj.dinnerDishes.push(newDish);
        } else {
          dayObj.lunchDishes.push(newDish);
        }
      }

      vault.dailyMenuConfig.lastUpdated = new Date().toISOString();
      saveVendorVault(vault);

      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: `डिश "${newDish.name}" सफलता से मेनू शेड्यूल में जोड़ दी गई!`
      });
    } catch (err: any) {
      console.error('[Add Daily Menu Dish Error]:', err);
      res.status(500).json({ success: false, message: 'डिश जोड़ने में त्रुटि।' });
    }
  });

  app.post('/api/owner/daily-menu/remove-dish', (req, res) => {
    try {
      const { target, dayId, mealSlot, dishId } = req.body || {};
      if (!dishId) {
        return res.status(400).json({ success: false, message: 'Dish ID आवश्यक है।' });
      }

      const vault = loadVendorVault();
      if (!vault.dailyMenuConfig) vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));

      if (target === 'regular_fixed') {
        vault.dailyMenuConfig.regularFixedDishes = vault.dailyMenuConfig.regularFixedDishes.filter(d => d.dishId !== dishId);
      } else if (dayId && vault.dailyMenuConfig.dayWiseSchedules[dayId]) {
        const dayObj = vault.dailyMenuConfig.dayWiseSchedules[dayId];
        if (mealSlot === 'dinner') {
          dayObj.dinnerDishes = dayObj.dinnerDishes.filter(d => d.dishId !== dishId);
        } else {
          dayObj.lunchDishes = dayObj.lunchDishes.filter(d => d.dishId !== dishId);
        }
      }

      vault.dailyMenuConfig.lastUpdated = new Date().toISOString();
      saveVendorVault(vault);

      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: 'डिश सफलतापूर्वक मेनू शेड्यूल से हटा दी गई!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'डिश हटाने में त्रुटि।' });
    }
  });

  app.post('/api/owner/daily-menu/reset', (_req, res) => {
    try {
      const vault = loadVendorVault();
      vault.dailyMenuConfig = JSON.parse(JSON.stringify(DEFAULT_DAILY_MENU_CONFIG));
      saveVendorVault(vault);
      res.json({
        success: true,
        dailyMenuConfig: vault.dailyMenuConfig,
        message: 'दैनिक व फिक्स मेनू शेड्यूल डिफ़ॉल्ट अधिकृत सूची पर रीसेट हो गया!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'मेनू रीसेट करने में त्रुटि।' });
    }
  });

  // 10b. Vendor & Owner Incentive APIs
  app.get('/api/vendor/incentives/overview', (_req, res) => {
    try {
      const vault = loadVendorVault();
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        stats,
        config: vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG,
        history: (vault.incentiveHistory || []).slice(0, 50)
      });
    } catch (err: any) {
      console.error('[Incentive Overview Error]:', err);
      res.status(500).json({ success: false, message: 'इंसेंटिव डेटा लोड करने में त्रुटि।' });
    }
  });

  // Owner 1-Click Spot Incentive Grant
  app.post('/api/owner/incentives/grant-spot', (req, res) => {
    try {
      const { vendorId, amount, reason } = req.body || {};
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'मान्य इंसेंटिव राशि दर्ज करें।' });
      }
      if (!reason) {
        return res.status(400).json({ success: false, message: 'इंसेंटिव का कारण आवश्यक है।' });
      }

      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];

      // Credit to vendor wallet directly
      vault.wallet.currentBalance += numAmount;
      vault.wallet.totalLifetimeEarned += numAmount;

      const record: IncentiveRecord = {
        id: `inc_${Date.now()}`,
        vendorId: String(vendorId || 'NIR8800').trim(),
        type: 'spot_bonus',
        amount: numAmount,
        reason: String(reason).trim(),
        grantedBy: 'Owner Operations Desk',
        grantedAt: new Date().toISOString(),
        cyclePeriod: 'Current Week'
      };

      vault.incentiveHistory.unshift(record);

      const txn: VendorWalletTransaction = {
        id: `txn_inc_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'incentive_bonus',
        amount: numAmount,
        description: `🎯 स्पॉट इंसेंटिव बोनस: ${record.reason}`,
        referenceId: record.id,
        balanceAfter: vault.wallet.currentBalance,
        status: 'settled',
        ownerApprovedBy: 'Owner Operations Desk',
        cyclePeriod: 'Incentive Reward'
      };

      vault.transactions.unshift(txn);
      saveVendorVault(vault);

      const stats = calculateVendorWeeklyIncentiveStats(vault);

      res.json({
        success: true,
        record,
        newBalance: vault.wallet.currentBalance,
        stats,
        message: `₹${numAmount} का इंसेंटिव बोनस वेंडर के वॉलेट में क्रेडिट हो गया! (नया बैलेंस: ₹${vault.wallet.currentBalance})`
      });
    } catch (err: any) {
      console.error('[Grant Spot Incentive Error]:', err);
      res.status(500).json({ success: false, message: 'इंसेंटिव क्रेडिट करने में त्रुटि।' });
    }
  });

  // Owner Process Weekly Milestone Incentives
  app.post('/api/owner/incentives/process-milestones', (_req, res) => {
    try {
      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      const config = vault.incentiveConfig || DEFAULT_INCENTIVE_CONFIG;

      if (!config.enabled) {
        return res.status(400).json({ success: false, message: 'इंसेंटिव सिस्टम वर्तमान में बंद (Disabled) है।' });
      }

      const tiers = [...(config.tiers || [])].sort((a, b) => a.milestoneMeals - b.milestoneMeals);
      const awarded: IncentiveRecord[] = [];

      // Check which tiers were achieved this cycle and not yet awarded
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentMilestoneAwards = vault.incentiveHistory.filter(h => 
        h.type === 'milestone' && 
        new Date(h.grantedAt) >= sevenDaysAgo
      );
      const awardedTierIds = new Set(recentMilestoneAwards.map(h => h.tierId).filter(Boolean));

      for (const tier of tiers) {
        if (stats.deliveredMealsThisCycle >= tier.milestoneMeals && !awardedTierIds.has(tier.id)) {
          // Award this tier!
          vault.wallet.currentBalance += tier.bonusAmount;
          vault.wallet.totalLifetimeEarned += tier.bonusAmount;

          const record: IncentiveRecord = {
            id: `inc_m_${tier.id}_${Date.now()}`,
            vendorId: vault.vendorId || 'NIR8800',
            type: 'milestone',
            amount: tier.bonusAmount,
            mealsCompleted: stats.deliveredMealsThisCycle,
            tierId: tier.id,
            reason: `साप्ताहिक माइलस्टोन रिवॉर्ड: ${tier.title} (${tier.milestoneMeals}+ टिफिन पूरे)`,
            grantedBy: 'Automated Milestone Engine (Owner Verified)',
            grantedAt: new Date().toISOString(),
            cyclePeriod: `${stats.cycleStart} to ${stats.cycleEnd}`
          };

          vault.incentiveHistory.unshift(record);

          vault.transactions.unshift({
            id: `txn_m_inc_${Date.now()}_${tier.id}`,
            date: new Date().toISOString().split('T')[0],
            type: 'incentive_bonus',
            amount: tier.bonusAmount,
            description: `🎯 माइलस्टोन इंसेंटिव: ${tier.title} (${tier.milestoneMeals}+ मील टारगेट)`,
            referenceId: record.id,
            balanceAfter: vault.wallet.currentBalance,
            status: 'settled',
            ownerApprovedBy: 'System Milestone Engine',
            cyclePeriod: 'Weekly Milestone Reward'
          });

          awarded.push(record);
        }
      }

      saveVendorVault(vault);
      const updatedStats = calculateVendorWeeklyIncentiveStats(vault);

      if (awarded.length === 0) {
        return res.json({
          success: true,
          awardedCount: 0,
          stats: updatedStats,
          message: `इस हफ़्ते के सभी योग्य माइलस्टोन इंसेंटिव पहले ही वितरित किए जा चुके हैं या लक्ष्य अभी तक पूरा नहीं हुआ। वर्तमान डिलीवरी: ${stats.deliveredMealsThisCycle} टिफिन।`
        });
      }

      res.json({
        success: true,
        awardedCount: awarded.length,
        awarded,
        stats: updatedStats,
        newBalance: vault.wallet.currentBalance,
        message: `${awarded.length} नए माइलस्टोन इंसेंटिव वेंडर वॉलेट में क्रेडिट किए गए! कुल राशि: ₹${awarded.reduce((s, a) => s + a.amount, 0)}`
      });
    } catch (err: any) {
      console.error('[Process Milestones Error]:', err);
      res.status(500).json({ success: false, message: 'माइलस्टोन प्रोसेस करने में त्रुटि।' });
    }
  });

  // Owner Update Incentive Rules Config
  app.post('/api/owner/incentives/update-config', (req, res) => {
    try {
      const { enabled, tiers, onTimeBonusPerMeal, zeroComplaintWeeklyBonus, dailyZeroCancellationBonus, weeklyHundredPercentOnlineBonus } = req.body || {};
      const vault = loadVendorVault();

      vault.incentiveConfig = {
        enabled: enabled !== false,
        tiers: Array.isArray(tiers) && tiers.length > 0 ? tiers : (vault.incentiveConfig?.tiers || DEFAULT_INCENTIVE_CONFIG.tiers),
        onTimeBonusPerMeal: Number(onTimeBonusPerMeal ?? 5),
        zeroComplaintWeeklyBonus: Number(zeroComplaintWeeklyBonus ?? 250),
        dailyZeroCancellationBonus: Number(dailyZeroCancellationBonus ?? 50),
        weeklyHundredPercentOnlineBonus: Number(weeklyHundredPercentOnlineBonus ?? 300)
      };

      saveVendorVault(vault);
      res.json({
        success: true,
        config: vault.incentiveConfig,
        message: 'इंसेंटिव रूल्स सफलतापूर्वक अपडेट व सुरक्षित हो गए!'
      });
    } catch (err: any) {
      console.error('[Update Incentive Config Error]:', err);
      res.status(500).json({ success: false, message: 'इंसेंटिव कॉन्फ़िगरेशन अपडेट करने में त्रुटि।' });
    }
  });

  // Owner Delete / Revoke Granted Incentive Record
  app.post('/api/owner/incentives/delete-granted', (req, res) => {
    try {
      const { recordId } = req.body || {};
      if (!recordId) {
        return res.status(400).json({ success: false, message: 'Record ID आवश्यक है।' });
      }

      const vault = loadVendorVault();
      if (!vault.incentiveHistory) vault.incentiveHistory = [];

      const index = vault.incentiveHistory.findIndex(h => h.id === recordId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'इंसेंटिव रिकॉर्ड नहीं मिला।' });
      }

      const record = vault.incentiveHistory[index];
      const amount = record.amount || 0;
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - amount);
      vault.wallet.totalLifetimeEarned = Math.max(0, vault.wallet.totalLifetimeEarned - amount);

      vault.incentiveHistory.splice(index, 1);

      if (vault.transactions) {
        vault.transactions = vault.transactions.filter(t => t.referenceId !== recordId && t.id !== `txn_${recordId}`);
      }

      saveVendorVault(vault);
      const stats = calculateVendorWeeklyIncentiveStats(vault);

      res.json({
        success: true,
        stats,
        newBalance: vault.wallet.currentBalance,
        message: `इंसेंटिव रिकॉर्ड #${recordId} सफलतापूर्वक हटा दिया गया (₹${amount} वॉलेट से रिवर्स किया गया)।`
      });
    } catch (err: any) {
      console.error('[Delete Granted Incentive Error]:', err);
      res.status(500).json({ success: false, message: 'इंसेंटिव रिकॉर्ड हटाने में त्रुटि।' });
    }
  });

  // Owner Clear All Incentive History
  app.post('/api/owner/incentives/clear-history', (_req, res) => {
    try {
      const vault = loadVendorVault();
      vault.incentiveHistory = [];
      saveVendorVault(vault);
      const stats = calculateVendorWeeklyIncentiveStats(vault);
      res.json({
        success: true,
        stats,
        message: 'सभी इंसेंटिव हिस्ट्री सफलतापूर्वक रिसेट कर दी गई!'
      });
    } catch (err: any) {
      console.error('[Clear Incentive History Error]:', err);
      res.status(500).json({ success: false, message: 'इंसेंटिव हिस्ट्री रिसेट करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/rate-card/update', (req, res) => {
    try {
      const { itemId, name, hindiName, categoryLabel, portions, inStock } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: 'Item ID आवश्यक है।' });

      updateRateCardItemInCSV(itemId, {
        name,
        hindiName,
        categoryLabel,
        inStock,
        portions
      });

      res.json({
        success: true,
        message: `डिश "${name || itemId}" का रेट कार्ड सफलतापूर्वक अपडेट हो गया!`
      });
    } catch (err: any) {
      console.error('[Rate Card Update Error]:', err);
      res.status(500).json({ success: false, message: 'रेट कार्ड अपडेट करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/rate-card/add', (req, res) => {
    try {
      const { name, hindiName, category, categoryLabel, portions, inStock } = req.body || {};
      if (!name) return res.status(400).json({ success: false, message: 'डिश का नाम अनिवार्य है।' });

      const newId = addRateCardItemToCSV({
        name,
        hindiName,
        category,
        categoryLabel,
        portions: Array.isArray(portions) && portions.length > 0 ? portions : [{ size: 'Standard', listingPrice: 99, vendorPayoutRate: 40 }],
        inStock: inStock !== false
      });

      res.json({
        success: true,
        dishId: newId,
        message: `नई डिश "${name}" मास्टर रेट कार्ड में सफलतापूर्वक जुड़ गई!`
      });
    } catch (err: any) {
      console.error('[Rate Card Add Error]:', err);
      res.status(500).json({ success: false, message: 'डिश जोड़ने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/rate-card/toggle-stock', (req, res) => {
    try {
      const { itemId, inStock } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: 'Item ID अनिवार्य है।' });

      const updated = updateRateCardItemInCSV(itemId, { inStock: Boolean(inStock) });
      res.json({
        success: updated,
        inStock: Boolean(inStock),
        message: `डिश का स्टॉक स्टेटस ${inStock ? 'उपलब्ध (In Stock)' : 'समाप्त (Out of Stock)'} सेट हो गया।`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'स्टॉक बदलने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/rate-card/delete', (req, res) => {
    try {
      const { itemId } = req.body || {};
      if (!itemId) return res.status(400).json({ success: false, message: 'Item ID अनिवार्य है।' });

      deleteRateCardItemFromCSV(itemId);
      res.json({ success: true, message: 'डिश मास्टर रेट कार्ड से हटा दी गई।' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'डिश हटाने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/rate-card/reset-to-master', (_req, res) => {
    try {
      saveRateCardToCSV(VENDOR_MASTER_RATE_CARD);
      const updated = loadDynamicRateCard();
      res.json({
        success: true,
        count: updated.length,
        rateCard: updated,
        message: `मास्टर रेट कार्ड सफलतापूर्वक रीसेट हो गया! कुल ${updated.length} अधिकृत डिशेज़ व कॉम्बो लोड हो गए हैं।`
      });
    } catch (err: any) {
      console.error('[Reset Rate Card Error]:', err);
      res.status(500).json({ success: false, message: 'मास्टर रेट कार्ड रीसेट करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/dishes/review', (req, res) => {
    try {
      const { dishId, action, notes, customPortions } = req.body || {};
      if (!dishId || !action) {
        return res.status(400).json({ success: false, message: 'Dish ID और Action (APPROVE / REJECT) अनिवार्य हैं।' });
      }

      const vault = loadVendorVault();
      const dish = (vault.pendingDishes || []).find(d => d.id === dishId);
      if (!dish) {
        return res.status(404).json({ success: false, message: 'डिश आवेदन नहीं मिला।' });
      }

      if (action.toUpperCase() === 'APPROVE') {
        dish.status = 'APPROVED';
        dish.approvedAt = new Date().toISOString();
        dish.notes = notes || 'मालिक (देवी) द्वारा अनुमोदित (Approved by Owner)';

        if (customPortions && Array.isArray(customPortions) && customPortions.length > 0) {
          dish.portions = customPortions.map((p: any) => ({
            size: String(p.size || 'Standard'),
            listingPrice: Math.max(1, Number(p.listingPrice || 99)),
            vendorPayoutRate: Math.max(1, Number(p.vendorPayoutRate || 40))
          }));
        }

        // Automatically append to master CSV rate card so it is immediately live for punching!
        addRateCardItemToCSV({
          id: dish.id,
          name: dish.name,
          hindiName: dish.hindiName,
          category: dish.category,
          categoryLabel: dish.categoryLabel,
          portions: dish.portions,
          inStock: true
        });

        saveVendorVault(vault);
        return res.json({
          success: true,
          message: `डिश "${dish.name}" स्वीकृत हो गई और मास्टर रेट कार्ड में जुड़ गई!`,
          dish
        });
      } else {
        dish.status = 'REJECTED';
        dish.notes = notes || 'मालिक (देवी) द्वारा अस्वीकृत (Rejected)';
        saveVendorVault(vault);
        return res.json({
          success: true,
          message: `डिश "${dish.name}" अस्वीकृत कर दी गई।`,
          dish
        });
      }
    } catch (err: any) {
      console.error('[Dish Review Error]:', err);
      res.status(500).json({ success: false, message: 'डिश समीक्षा करने में समस्या।' });
    }
  });

  app.post('/api/owner/vendor/payout/disburse', (req, res) => {
    try {
      const { amount, utrNumber, paymentMode, notes, requestId } = req.body || {};
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'मान्य पेआउट राशि दर्ज करें।' });
      }
      if (!utrNumber || String(utrNumber).trim().length < 3) {
        return res.status(400).json({ success: false, message: 'बैंक/UPI का मान्य UTR / रेफरेंस नंबर अनिवार्य है।' });
      }

      const vault = loadVendorVault();
      const currentBal = vault.wallet.currentBalance;

      if (numAmount > currentBal) {
        return res.status(400).json({
          success: false,
          message: `पेआउट राशि (₹${numAmount}) कुल वॉलेट बैलेंस (₹${currentBal}) से अधिक नहीं हो सकती।`
        });
      }

      // Mark request as disbursed if requestId provided
      if (requestId && vault.payoutRequests) {
        const reqObj = vault.payoutRequests.find(r => r.id === requestId);
        if (reqObj) {
          reqObj.status = 'DISBURSED';
          reqObj.utrNumber = String(utrNumber).trim();
          reqObj.notes = String(notes || '').trim();
        }
      }

      // Deduct from wallet
      vault.wallet.currentBalance = Math.max(0, currentBal - numAmount);
      vault.wallet.lastSettlementDate = new Date().toISOString().split('T')[0];

      const txn: VendorWalletTransaction = {
        id: `txn_payout_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'payout_disbursed',
        amount: numAmount,
        description: `Payout Paid via ${paymentMode || 'UPI'} (UTR: ${utrNumber})${notes ? ` - ${notes}` : ''}`,
        referenceId: String(utrNumber).trim(),
        utrNumber: String(utrNumber).trim(),
        balanceAfter: vault.wallet.currentBalance,
        status: 'settled',
        ownerApprovedBy: 'Owner / Navovia Next HQ',
        cyclePeriod: 'Settlement'
      };

      vault.transactions.unshift(txn);
      saveVendorVault(vault);

      res.json({
        success: true,
        newBalance: vault.wallet.currentBalance,
        transaction: txn,
        message: `₹${numAmount} का पेआउट सफलतापूर्वक ट्रांसफर दर्ज हुआ! नया बैलेंस: ₹${vault.wallet.currentBalance}`
      });
    } catch (err: any) {
      console.error('[Payout Disburse Error]:', err);
      res.status(500).json({ success: false, message: 'पेआउट दर्ज करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/refunds/add', (req, res) => {
    try {
      const { orderId, customerRefundAmount, vendorCutDeducted, reason } = req.body || {};
      const numDeduction = Number(vendorCutDeducted);
      if (!numDeduction || numDeduction <= 0) {
        return res.status(400).json({ success: false, message: 'मान्य कटौती राशि दर्ज करें।' });
      }
      if (!reason) {
        return res.status(400).json({ success: false, message: 'कटौती का कारण आवश्यक है।' });
      }

      const vault = loadVendorVault();
      if (!vault.refundDeductions) vault.refundDeductions = [];

      // Deduct from wallet balance
      vault.wallet.currentBalance = Math.max(0, vault.wallet.currentBalance - numDeduction);

      const record: RefundDeductionRecord = {
        id: `ded_${Date.now()}`,
        orderId: String(orderId || 'GEN-DEDUCT').trim(),
        customerRefundAmount: Number(customerRefundAmount || numDeduction),
        vendorCutDeducted: numDeduction,
        reason: String(reason).trim(),
        timestamp: new Date().toISOString(),
        status: 'deducted'
      };

      vault.refundDeductions.unshift(record);

      const txn: VendorWalletTransaction = {
        id: `txn_ded_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'refund_deduction',
        amount: numDeduction,
        description: `Refund / Cancellation Deduction: Order #${record.orderId} - ${record.reason}`,
        referenceId: record.orderId,
        balanceAfter: vault.wallet.currentBalance,
        status: 'settled',
        ownerApprovedBy: 'Owner Operations Desk'
      };

      vault.transactions.unshift(txn);
      saveVendorVault(vault);

      res.json({
        success: true,
        record,
        newBalance: vault.wallet.currentBalance,
        message: `₹${numDeduction} की कटौती दर्ज की गई। नया वॉलेट बैलेंस: ₹${vault.wallet.currentBalance}`
      });
    } catch (err: any) {
      console.error('[Refund Deduction Error]:', err);
      res.status(500).json({ success: false, message: 'कटौती दर्ज करने में त्रुटि।' });
    }
  });

  app.post('/api/owner/vendor/orders/update-status', (req, res) => {
    try {
      const { orderId, newStatus } = req.body || {};
      if (!orderId || !newStatus) {
        return res.status(400).json({ success: false, message: 'Order ID और Status अनिवार्य हैं।' });
      }

      const vault = loadVendorVault();
      const order = (vault.orders || []).find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'ऑर्डर नहीं मिला।' });
      }

      order.status = newStatus;
      if (newStatus === 'delivered' && !order.payoutCreditedToWallet) {
        order.payoutCreditedToWallet = true;
        const payout = order.totalVendorPayout || 0;
        vault.wallet.currentBalance += payout;
        vault.wallet.totalLifetimeEarned += payout;

        vault.transactions.unshift({
          id: `txn_ord_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'order_credit',
          amount: payout,
          description: `Order Settlement: ${order.itemName} (${order.orderNumber})`,
          referenceId: order.orderNumber,
          balanceAfter: vault.wallet.currentBalance,
          status: 'settled',
          cyclePeriod: 'Current Fri-Thu Cycle'
        });
      }

      saveVendorVault(vault);
      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message: `ऑर्डर स्टेटस "${newStatus}" अपडेट हो गया।`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'स्टेटस अपडेट करने में समस्या।' });
    }
  });

  app.post('/api/owner/vendor/orders/verify', (req, res) => {
    try {
      const { orderId, action, notes } = req.body || {};
      if (!orderId || !action) {
        return res.status(400).json({ success: false, message: 'Order ID और Action (APPROVE / REJECT) अनिवार्य हैं।' });
      }

      const vault = loadVendorVault();
      const order = (vault.orders || []).find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'ऑर्डर नहीं मिला।' });
      }

      if (action.toUpperCase() === 'APPROVE') {
        order.verificationStatus = 'APPROVED';
        
        // Credit to wallet if not credited yet!
        if (!order.payoutCreditedToWallet) {
          order.payoutCreditedToWallet = true;
          const payout = order.totalVendorPayout || 0;
          vault.wallet.currentBalance += payout;
          vault.wallet.totalLifetimeEarned += payout;

          vault.transactions.unshift({
            id: `txn_ord_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'order_credit',
            amount: payout,
            description: `Verified Order Payout: ${order.itemName} (${order.orderNumber})`,
            referenceId: order.orderNumber,
            balanceAfter: vault.wallet.currentBalance,
            status: 'settled',
            ownerApprovedBy: 'Owner Operations Desk',
            cyclePeriod: 'Current Fri-Thu Cycle'
          });
        }

        saveVendorVault(vault);
        return res.json({
          success: true,
          order,
          newBalance: vault.wallet.currentBalance,
          message: `ऑर्डर #${order.orderNumber} सत्यापित हुआ और ₹${order.totalVendorPayout} वेंडर वॉलेट में क्रेडिट हो गया!`
        });
      } else {
        order.verificationStatus = 'REJECTED';
        order.status = 'cancelled';
        order.payoutCreditedToWallet = false;
        order.totalVendorPayout = 0;
        const reasonStr = notes || 'भोजन गुणवत्ता / अमान्य बिल समस्या (मालिक देवी द्वारा अस्वीकृत)';
        (order as any).rejectionReason = reasonStr;
        (order as any).rejectedAt = new Date().toISOString();
        order.notes = (order.notes ? order.notes + ' | ' : '') + `मालिक (देवी) द्वारा अस्वीकृत: ${reasonStr}`;
        
        saveVendorVault(vault);
        return res.json({
          success: true,
          order,
          message: `ऑर्डर #${order.orderNumber} ओनर (देवी) द्वारा अस्वीकृत किया गया (वेंडर को 0 पेआउट)।`
        });
      }
    } catch (err: any) {
      console.error('[Order Verify Error]:', err);
      res.status(500).json({ success: false, message: 'ऑर्डर सत्यापन करने में समस्या।' });
    }
  });
}
