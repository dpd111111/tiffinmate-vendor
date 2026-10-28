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

export async function pushEventToGoogleSheet(action: string, payload: Record<string, any>): Promise<void> {
  try {
    const vault = loadVendorVault();
    const webhookUrl = vault.sheetConfig?.scriptWebhookUrl;
    if (!webhookUrl) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal
    });
    clearTimeout(timer);
    console.log(`[Google Sheet Auto-Push]: Dispatched "${action}" to Sheet Web App`);
  } catch (err: any) {
    console.warn(`[Google Sheet Auto-Push Info]: Sheet Webhook not yet deployed or unreachable (${err.message})`);
  }
}

function loadVendorVault(): VendorVaultState {
  try {
    if (fs.existsSync(VENDOR_STORAGE_FILE)) {
      const raw = fs.readFileSync(VENDOR_STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.refundDeductions) parsed.refundDeductions = [];
      if (!parsed.pendingDishes) parsed.pendingDishes = [];
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

/**
 * Register Vendor Routes on Express App
 */
export function registerVendorRoutes(app: express.Express, authenticateStaffOrOwner: (req: express.Request) => any, getSubscriptions: () => any[]): void {

  // 1. Get Master Rate Card (Live synced from CSV/Sheet + custom dishes)
  app.get('/api/vendor/rate-card', async (_req, res) => {
    const vault = loadVendorVault();

    // Auto-fetch from Google Sheet if connected!
    if (vault.sheetConfig?.spreadsheetId) {
      try {
        const sheetCsvUrl = `https://docs.google.com/spreadsheets/d/${vault.sheetConfig.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=RateCard`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const csvRes = await fetch(sheetCsvUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (csvRes.ok) {
          const csvText = await csvRes.text();
          if (csvText && csvText.includes('Item ID')) {
            fs.writeFileSync(path.join(process.cwd(), 'server_rate_card_synced.csv'), csvText, 'utf-8');
            console.log('[Live Sheet RateCard]: Updated server_rate_card_synced.csv from Google Sheet');
          }
        }
      } catch (err) {
        // Fallback gracefully to local synced file
      }
    }

    const dynamicRateCard = loadDynamicRateCard();
    const approvedCustom = (vault.pendingDishes || []).filter(d => d.status === 'APPROVED');
    
    // Merge master dynamic rate card with approved custom dishes
    const fullRateCard = [...dynamicRateCard, ...approvedCustom.map(d => ({
      id: d.id,
      name: d.name,
      hindiName: d.hindiName,
      category: d.category,
      categoryLabel: d.categoryLabel,
      portions: d.portions,
      inStock: true
    }))];

    res.json({
      success: true,
      rateCard: fullRateCard,
      pendingDishes: (vault.pendingDishes || []).filter(d => d.status === 'PENDING'),
      syncedSource: fs.existsSync(path.join(process.cwd(), 'server_rate_card_synced.csv')) ? 'Google Sheet / CSV File' : 'Master Rate Card',
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
      refundDeductions: (vault.refundDeductions || []).slice(0, 30)
    });
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

  // 8. Google Sheets Auto-Connect & Two-Way Sync
  app.get('/api/vendor/sheets/status', (_req, res) => {
    const vault = loadVendorVault();
    res.json({
      success: true,
      sheetConfig: vault.sheetConfig || null
    });
  });

  // Direct Sheet URL Connect (Bypasses iframe cross-origin & popup issues, 100% reliable)
  app.post('/api/vendor/sheets/set-sheet-url', (req, res) => {
    try {
      const { sheetUrl } = req.body || {};
      if (!sheetUrl) {
        return res.status(400).json({ success: false, message: 'Google Sheet का URL या ID अनिवार्य है।' });
      }

      let spreadsheetId = String(sheetUrl).trim();
      const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        spreadsheetId = match[1];
      }

      const fullUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      const vault = loadVendorVault();
      vault.sheetConfig = {
        spreadsheetId,
        spreadsheetUrl: fullUrl,
        lastSynced: new Date().toISOString()
      };
      saveVendorVault(vault);

      console.log(`[Google Sheets]: Connected Sheet URL successfully: ${fullUrl}`);
      return res.json({
        success: true,
        spreadsheetId,
        spreadsheetUrl: fullUrl,
        lastSynced: vault.sheetConfig.lastSynced,
        message: 'Google Sheet सफलतापूर्वक कनेक्ट हो गई!'
      });
    } catch (err: any) {
      console.error('[Set Sheet URL Error]:', err);
      return res.status(500).json({ success: false, message: 'Sheet URL सेव करने में सर्वर समस्या।' });
    }
  });

  app.post('/api/vendor/sheets/auto-connect', async (req, res) => {
    try {
      const { accessToken } = req.body || {};
      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'Google Workspace access token आवश्यक है।'
        });
      }

      const vault = loadVendorVault();
      let spreadsheetId = vault.sheetConfig?.spreadsheetId;
      let spreadsheetUrl = vault.sheetConfig?.spreadsheetUrl;

      // If spreadsheet does not exist yet, CREATE IT via Google Sheets API v4!
      if (!spreadsheetId) {
        console.log('[Google Sheets]: Creating new Master Vendor Spreadsheet...');
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: 'NOV TIFFIN - Master Vendor Ledger & Rate Card'
            },
            sheets: [
              { properties: { title: 'RateCard', tabColor: { red: 0.18, green: 0.49, blue: 0.20 } } },
              { properties: { title: 'DishApprovals', tabColor: { red: 0.95, green: 0.60, blue: 0.07 } } },
              { properties: { title: 'LiveOrders', tabColor: { red: 0.13, green: 0.59, blue: 0.95 } } },
              { properties: { title: 'RefundsDeductions', tabColor: { red: 0.90, green: 0.22, blue: 0.21 } } },
              { properties: { title: 'MondayPayouts', tabColor: { red: 0.42, green: 0.19, blue: 0.64 } } }
            ]
          })
        });

        if (!createRes.ok) {
          const errData = await createRes.json();
          console.error('[Google Sheets Create Error]:', errData);
          return res.status(createRes.status).json({
            success: false,
            message: `Google Sheet बनाने में त्रुटि: ${errData?.error?.message || 'Permission Error'}`
          });
        }

        const createData = await createRes.json();
        spreadsheetId = createData.spreadsheetId;
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

        // Populate initial headers & RateCard data
        const rateCardRows = [
          ['Item ID', 'Dish Name', 'Hindi Name', 'Category', 'Portion Size', 'Listing Price (₹)', 'Vendor Payout Rate (₹)', 'In Stock', 'Last Updated']
        ];

        VENDOR_MASTER_RATE_CARD.forEach(item => {
          item.portions.forEach(p => {
            rateCardRows.push([
              item.id,
              item.name,
              item.hindiName,
              item.categoryLabel,
              p.size,
              String(p.listingPrice),
              String(p.vendorPayoutRate),
              item.inStock ? 'YES' : 'NO',
              new Date().toISOString().split('T')[0]
            ]);
          });
        });

        // Initialize all sheet headers
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: [
              {
                range: 'RateCard!A1:I',
                values: rateCardRows
              },
              {
                range: 'DishApprovals!A1:G1',
                values: [['Dish ID', 'Dish Name', 'Hindi Name', 'Portion & Rates', 'Submitted At', 'Status (PENDING/APPROVED)', 'Owner Decision Notes']]
              },
              {
                range: 'LiveOrders!A1:H1',
                values: [['Order ID', 'Source / Platform', 'Dishes & Portions', 'Total Qty', 'Total Vendor Payout (₹)', 'Status', 'Timestamp', 'Notes']]
              },
              {
                range: 'RefundsDeductions!A1:G1',
                values: [['Deduction ID', 'Order ID', 'Customer Refund Amount (₹)', 'Vendor Cut Deducted (₹)', 'Reason', 'Timestamp', 'Status']]
              },
              {
                range: 'MondayPayouts!A1:I1',
                values: [['Settlement ID', 'Week Period', 'Total Orders Payout (₹)', 'Refund Deductions (₹)', 'Reserve Retained (₹)', 'Net Payable to Vendor (₹)', 'Vendor UPI / Account', 'Status', 'UTR Number']]
              }
            ]
          })
        });

        vault.sheetConfig = {
          spreadsheetId,
          spreadsheetUrl,
          lastSynced: new Date().toISOString()
        };
        saveVendorVault(vault);
        console.log(`[Google Sheets]: Created new Master Sheet: ${spreadsheetUrl}`);
      }

      // Sync latest orders, deductions, and monday payout summary to the Google Sheet
      const ordersRows = vault.orders.slice(0, 50).map(o => [
        o.orderNumber,
        o.source.toUpperCase(),
        o.itemName,
        String(o.quantity),
        String(o.totalVendorPayout),
        o.status.toUpperCase(),
        o.createdAt,
        o.notes || ''
      ]);

      const deductionsRows = (vault.refundDeductions || []).slice(0, 30).map(d => [
        d.id,
        d.orderId,
        String(d.customerRefundAmount),
        String(d.vendorCutDeducted),
        d.reason,
        d.timestamp,
        d.status.toUpperCase()
      ]);

      // Calculate Monday Payout Snapshot
      const grossEarned = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2000;
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const mondaySummaryRow = [
        `STL-${Date.now().toString().slice(-6)}`,
        'Friday to Thursday Settlement',
        String(grossEarned),
        String((vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0)),
        String(reserve),
        String(eligiblePay),
        'UPI: 9118409672@upi / NIR8800 Bank Account',
        eligiblePay > 0 ? 'READY_FOR_MONDAY_TRANSFER' : 'BELOW_RESERVE',
        vault.transactions.find(t => t.type === 'payout_disbursed')?.utrNumber || 'PENDING_TRANSFER'
      ];

      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              range: 'LiveOrders!A2:H',
              values: ordersRows
            },
            {
              range: 'RefundsDeductions!A2:G',
              values: deductionsRows
            },
            {
              range: 'MondayPayouts!A2:I2',
              values: [mondaySummaryRow]
            }
          ]
        })
      });

      vault.sheetConfig = {
        spreadsheetId,
        spreadsheetUrl,
        lastSynced: new Date().toISOString()
      };
      saveVendorVault(vault);

      res.json({
        success: true,
        spreadsheetId,
        spreadsheetUrl,
        lastSynced: vault.sheetConfig.lastSynced,
        message: 'Google Sheet सफलतापूर्वक कनेक्ट व सिंक हो गई है!'
      });
    } catch (err: any) {
      console.error('[Google Sheets Sync Error]:', err);
      res.status(500).json({ success: false, message: 'Google Sheet सिंक करने में सर्वर समस्या।' });
    }
  });

  // 9. Kitchen Inventory & Stock
  app.get('/api/vendor/inventory', (_req, res) => {
    const vault = loadVendorVault();
    res.json({
      success: true,
      inventory: vault.inventory
    });
  });

  app.post('/api/vendor/inventory/update', (req, res) => {
    try {
      const { itemId, changeAmount, newQuantity } = req.body || {};
      const vault = loadVendorVault();
      const item = vault.inventory.find(i => i.id === itemId);
      
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

  // 10. Google Apps Script Dedicated Webhook (Zero Auth Barrier, 100% Reliable for Private Sheets)
  app.post(['/api/vendor/sheets/webhook', '/api/sync/sheet-webhook'], (req, res) => {
    try {
      const { rows, rateCard, spreadsheetId, scriptWebhookUrl, action, dishId, status } = req.body || {};
      const vault = loadVendorVault();

      if (scriptWebhookUrl) {
        if (!vault.sheetConfig) {
          vault.sheetConfig = {
            spreadsheetId: spreadsheetId || '',
            spreadsheetUrl: spreadsheetId ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}` : '',
            scriptWebhookUrl: String(scriptWebhookUrl).trim(),
            lastSynced: new Date().toISOString()
          };
        } else {
          vault.sheetConfig.scriptWebhookUrl = String(scriptWebhookUrl).trim();
        }
      }

      if (spreadsheetId) {
        if (!vault.sheetConfig) {
          vault.sheetConfig = {
            spreadsheetId: String(spreadsheetId).trim(),
            spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${String(spreadsheetId).trim()}`,
            lastSynced: new Date().toISOString()
          };
        } else {
          vault.sheetConfig.spreadsheetId = String(spreadsheetId).trim();
          vault.sheetConfig.spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${String(spreadsheetId).trim()}`;
          vault.sheetConfig.lastSynced = new Date().toISOString();
        }
      } else if (vault.sheetConfig) {
        vault.sheetConfig.lastSynced = new Date().toISOString();
      }

      // Handle dish status update from Sheet (e.g. owner marks PENDING -> APPROVED)
      if (action === 'update_dish_status' && dishId && status) {
        const dish = (vault.pendingDishes || []).find(d => d.id === dishId);
        if (dish) {
          dish.status = status.toUpperCase();
          if (dish.status === 'APPROVED') {
            dish.approvedAt = new Date().toISOString();
          }
          saveVendorVault(vault);
          console.log(`[Google Sheet Webhook]: Dish ${dishId} marked ${dish.status}`);
          return res.json({ success: true, message: `Dish ${dishId} status set to ${dish.status}` });
        }
      }

      let syncedCount = 0;

      // Handle Rate Card Sync from Sheet
      if (Array.isArray(rows) && rows.length > 0) {
        // rows is 2D array from sheet.getDataRange().getValues()
        const csvLines = rows.map((r: any[]) => {
          return r.map((c: any) => {
            const str = String(c ?? '').replace(/"/g, '""');
            return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
          }).join(',');
        });
        const csvContent = csvLines.join('\n');
        const syncedFilePath = path.join(process.cwd(), 'server_rate_card_synced.csv');
        fs.writeFileSync(syncedFilePath, csvContent, 'utf-8');
        syncedCount = Math.max(0, rows.length - 1);
        console.log(`[Google Apps Script Webhook]: Synced ${syncedCount} rate card rows to server_rate_card_synced.csv`);
      } else if (Array.isArray(rateCard) && rateCard.length > 0) {
        const headers = 'Item ID,Dish Name,Hindi Name,Category,Portion Size,Listing Price (₹),Vendor Payout Rate (₹),In Stock,Last Updated';
        const lines = [headers];
        for (const item of rateCard) {
          const portions = Array.isArray(item.portions) ? item.portions : [{ size: item.size || 'Standard', listingPrice: item.listingPrice || 99, vendorPayoutRate: item.vendorPayoutRate || 40 }];
          for (const p of portions) {
            lines.push(`${item.id || ''},${item.name || ''},${item.hindiName || ''},${item.categoryLabel || item.category || ''},${p.size || 'Standard'},${p.listingPrice || 99},${p.vendorPayoutRate || 40},${item.inStock !== false ? 'YES' : 'NO'},${new Date().toISOString().split('T')[0]}`);
          }
        }
        const syncedFilePath = path.join(process.cwd(), 'server_rate_card_synced.csv');
        fs.writeFileSync(syncedFilePath, lines.join('\n'), 'utf-8');
        syncedCount = rateCard.length;
      }

      saveVendorVault(vault);

      // Prepare Live Orders and Monday Payout Data to return to the Script
      const liveOrders = vault.orders.slice(0, 50).map(o => ([
        o.orderNumber,
        o.source.toUpperCase(),
        o.itemName,
        o.quantity,
        o.totalVendorPayout,
        o.status.toUpperCase(),
        o.createdAt,
        o.notes || ''
      ]));

      const refundsDeductions = (vault.refundDeductions || []).slice(0, 30).map(d => ([
        d.id,
        d.orderId,
        d.customerRefundAmount,
        d.vendorCutDeducted,
        d.reason,
        d.timestamp,
        d.status.toUpperCase()
      ]));

      const grossEarned = vault.wallet.currentBalance;
      const reserve = vault.wallet.minimumReserve || 2000;
      const eligiblePay = Math.max(0, grossEarned - reserve);
      const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);

      const mondayPayoutRow = [
        `STL-${Date.now().toString().slice(-6)}`,
        'Friday to Thursday Settlement',
        grossEarned,
        totalRefundDeductions,
        reserve,
        eligiblePay,
        'UPI: 9118409672@upi / NIR8800 Bank Account',
        eligiblePay > 0 ? 'READY_FOR_MONDAY_TRANSFER' : 'BELOW_RESERVE',
        vault.transactions.find(t => t.type === 'payout_disbursed')?.utrNumber || 'PENDING_TRANSFER'
      ];

      res.json({
        success: true,
        message: `रेट कार्ड सफलतापूर्वक ऐप में सिंक हो गया! (${syncedCount} डिशेज़ अपडेट)`,
        syncedCount,
        lastSynced: new Date().toISOString(),
        liveOrders,
        refundsDeductions,
        mondayPayoutRow,
        eligiblePay
      });
    } catch (err: any) {
      console.error('[Google Apps Script Webhook Error]:', err);
      res.status(500).json({ success: false, message: 'Apps Script डेटा प्रोसेस करने में सर्वर त्रुटि।' });
    }
  });

  // GET Webhook endpoint for script to pull latest app orders without pushing
  app.get(['/api/vendor/sheets/webhook', '/api/sync/sheet-webhook'], (_req, res) => {
    const vault = loadVendorVault();
    const grossEarned = vault.wallet.currentBalance;
    const reserve = vault.wallet.minimumReserve || 2000;
    const eligiblePay = Math.max(0, grossEarned - reserve);
    const totalRefundDeductions = (vault.refundDeductions || []).reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0);

    const liveOrders = vault.orders.slice(0, 50).map(o => ([
      o.orderNumber,
      o.source.toUpperCase(),
      o.itemName,
      o.quantity,
      o.totalVendorPayout,
      o.status.toUpperCase(),
      o.createdAt,
      o.notes || ''
    ]));

    const refundsDeductions = (vault.refundDeductions || []).slice(0, 30).map(d => ([
      d.id,
      d.orderId,
      d.customerRefundAmount,
      d.vendorCutDeducted,
      d.reason,
      d.timestamp,
      d.status.toUpperCase()
    ]));

    const mondayPayoutRow = [
      `STL-${Date.now().toString().slice(-6)}`,
      'Friday to Thursday Settlement',
      grossEarned,
      totalRefundDeductions,
      reserve,
      eligiblePay,
      'UPI: 9118409672@upi / NIR8800 Bank Account',
      eligiblePay > 0 ? 'READY_FOR_MONDAY_TRANSFER' : 'BELOW_RESERVE',
      vault.transactions.find(t => t.type === 'payout_disbursed')?.utrNumber || 'PENDING_TRANSFER'
    ];

    res.json({
      success: true,
      liveOrders,
      refundsDeductions,
      mondayPayoutRow,
      eligiblePay,
      grossEarned,
      lastSynced: vault.sheetConfig?.lastSynced || new Date().toISOString()
    });
  });
}
