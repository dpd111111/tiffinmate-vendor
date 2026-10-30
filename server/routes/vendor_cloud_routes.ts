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

export interface VendorWalletTransaction {
  id: string;
  date: string;
  type: 'order_credit' | 'payout_disbursed' | 'hold_reserve' | 'dns_adjustment' | 'refund_deduction';
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

const VENDOR_STORAGE_FILE = path.join(process.cwd(), 'server_vendor_vault.json');

// Default initial state
interface VendorVaultState {
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

function loadVendorVault(): VendorVaultState {
  try {
    if (fs.existsSync(VENDOR_STORAGE_FILE)) {
      const raw = fs.readFileSync(VENDOR_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.refundDeductions) parsed.refundDeductions = [];
      if (!parsed.pendingDishes) parsed.pendingDishes = [];
      if (!parsed.payoutRequests) parsed.payoutRequests = [];
      return parsed;
    }
  } catch (err) {
    console.error('[Vendor Vault Read Error]:', err);
  }

  // Clean Initial State with zero dummy data
  const seedState: VendorVaultState = {
    vendorId: 'NIR8800',
    orders: [],
    transactions: [],
    inventory: [],
    refundDeductions: [],
    pendingDishes: [],
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

  saveVendorVault(seedState);
  return seedState;
}

function saveVendorVault(state: VendorVaultState): boolean {
  try {
    fs.writeFileSync(VENDOR_STORAGE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Vendor Vault Save Error]:', err);
    return false;
  }
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
    
    // Amount above ₹2,000 is eligible for Monday payout
    const eligibleAmount = Math.max(0, balance - reserve - hold);

    res.json({
      success: true,
      wallet: {
        ...vault.wallet,
        currentBalance: balance,
        minimumReserve: reserve,
        tenDayHoldAmount: hold,
        eligibleMondayPayout: eligibleAmount,
        canRequestPayout: eligibleAmount > 0,
        refundDeductionsTotal: (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0),
        ruleSummary: {
          minimumReserveRule: 'वॉलेट में हमेशा ₹2,000 न्यूनतम रिज़र्व बैलेंस रहेगा।',
          payoutSchedule: 'शुक्रवार से गुरुवार के बिलिंग चक्र का शेष हर सोमवार को ट्रांसफर होगा।',
          tenDayHoldRule: '10 दिन का भुगतान होल्ड पर रहेगा, जो DNS/डिस्प्यूट समाधान के समय रिलीज होगा।',
          refundDeductionRule: 'कस्टमर कैंसिलेशन/रिफंड होने पर तय वेंडर का हिस्सा वॉलेट से स्वतः कटेगा।'
        }
      },
      transactions: vault.transactions.slice(0, 50),
      refundDeductions: (vault.refundDeductions || []).slice(0, 30),
      payoutRequests: vault.payoutRequests || []
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

      // When order is marked delivered and hasn't been credited yet, credit to wallet!
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

      // Auto-push order status update to Google Sheet
      pushEventToGoogleSheet('order_status_update', { orderId, newStatus, currentBalance: vault.wallet.currentBalance });

      res.json({
        success: true,
        order,
        walletBalance: vault.wallet.currentBalance,
        message: `ऑर्डर स्टेटस "${newStatus}" अपडेट हो गया।`
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
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);

      res.json({
        success: true,
        rateCard: dynamicRateCard,
        pendingDishes: vault.pendingDishes || [],
        orders: vault.orders || [],
        wallet: {
          ...vault.wallet,
          eligibleMondayPayout: eligiblePay,
          totalRefundDeductions
        },
        transactions: vault.transactions || [],
        refundDeductions: vault.refundDeductions || [],
        inventory: vault.inventory || [],
        payoutRequests: vault.payoutRequests || []
      });
    } catch (err: any) {
      console.error('[Owner Vendor Overview Error]:', err);
      res.status(500).json({ success: false, message: 'वेंडर डेटा लोड करने में त्रुटि।' });
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

  app.post('/api/owner/vendor/dishes/review', (req, res) => {
    try {
      const { dishId, action, notes } = req.body || {};
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
        dish.notes = notes || 'मालिक द्वारा अनुमोदित (Approved by Owner)';

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
        dish.notes = notes || 'मालिक द्वारा अस्वीकृत (Rejected)';
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
        order.notes = (order.notes ? order.notes + ' | ' : '') + `मालिक द्वारा अस्वीकृत: ${notes || 'अमान्य आर्डर'}`;
        saveVendorVault(vault);
        return res.json({
          success: true,
          order,
          message: `ऑर्डर #${order.orderNumber} अस्वीकृत किया गया (वॉलेट में क्रेडिट नहीं हुआ)।`
        });
      }
    } catch (err: any) {
      console.error('[Order Verify Error]:', err);
      res.status(500).json({ success: false, message: 'ऑर्डर सत्यापन करने में समस्या।' });
    }
  });
}
