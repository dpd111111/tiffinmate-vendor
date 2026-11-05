import React, { useState, useEffect } from 'react';

export interface OwnerRateItem {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  categoryLabel: string;
  portions: Array<{
    size: string;
    listingPrice: number;
    vendorPayoutRate: number;
  }>;
  inStock: boolean;
}

export function OwnerVendorPanel({ onSwitchToVendor }: { onSwitchToVendor?: () => void }) {
  // Authentication state for owner
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const s = localStorage.getItem('tiffin_session_owner') || sessionStorage.getItem('tiffin_session_owner');
      if (s) {
        const u = JSON.parse(s);
        if (u && (u.isOwner || u.role === 'owner' || u.id === 'own')) return true;
      }
    } catch {}
    return false;
  });

  const [ownerPin, setOwnerPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Active sub-tab in Owner Panel
  const [activeSubTab, setActiveSubTab] = useState<'rate_card' | 'dish_approvals' | 'orders' | 'payouts' | 'refunds' | 'inventory' | 'incentives'>('rate_card');

  // Backend state
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const [rateCard, setRateCard] = useState<OwnerRateItem[]>([]);
  const [pendingDishes, setPendingDishes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({
    currentBalance: 0,
    minimumReserve: 2000,
    eligibleMondayPayout: 0,
    lastSettlementDate: 'None',
    totalLifetimeEarned: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refundDeductions, setRefundDeductions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [activePayoutRequestId, setActivePayoutRequestId] = useState<string>('');

  // Vendor Online & Cloud Profile State
  const [vendorIsOnline, setVendorIsOnline] = useState<boolean>(true);
  const [vendorKitchenPhotoUrl, setVendorKitchenPhotoUrl] = useState<string>('');
  const [vendorKitchenPhotoTimestamp, setVendorKitchenPhotoTimestamp] = useState<string>('');
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  // Incentive Management State
  const [incentiveStats, setIncentiveStats] = useState<any>({
    deliveredMealsThisCycle: 0,
    currentMilestoneTier: null,
    nextMilestoneTier: null,
    mealsNeededForNextTier: 0,
    progressPercent: 0,
    totalIncentiveEarnedThisCycle: 0,
    totalLifetimeIncentives: 0
  });
  const [incentiveConfig, setIncentiveConfig] = useState<any>({
    enabled: true,
    tiers: [],
    onTimeBonusPerMeal: 5,
    zeroComplaintWeeklyBonus: 250
  });
  const [incentiveHistory, setIncentiveHistory] = useState<any[]>([]);
  const [spotVendorId, setSpotVendorId] = useState<string>('NIR8800');
  const [spotAmount, setSpotAmount] = useState<number | ''>('');
  const [spotReason, setSpotReason] = useState<string>('');
  const [isProcessingIncentives, setIsProcessingIncentives] = useState(false);

  // Search & Filter state
  const [rateSearch, setRateSearch] = useState('');
  const [rateCategory, setRateCategory] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSourceFilter, setOrderSourceFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals state
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [importSourceTab, setImportSourceTab] = useState<'excel' | 'pdf' | 'text'>('excel');
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [isProcessingImportFile, setIsProcessingImportFile] = useState(false);
  const [parsedImportItems, setParsedImportItems] = useState<Array<{
    tempId?: string;
    name: string;
    hindiName: string;
    category: string;
    categoryLabel: string;
    portionSize: string;
    listingPrice: number;
    vendorPayoutRate: number;
  }>>([]);
  const [editingDish, setEditingDish] = useState<OwnerRateItem | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showEditIncentiveConfigModal, setShowEditIncentiveConfigModal] = useState(false);
  const [editableIncentiveConfig, setEditableIncentiveConfig] = useState<any>({
    enabled: true,
    tiers: [],
    onTimeBonusPerMeal: 5,
    zeroComplaintWeeklyBonus: 250
  });

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('');
  const [newDishHindiName, setNewDishHindiName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState('breakfast_snacks');
  const [newDishCategoryLabel, setNewDishCategoryLabel] = useState('नाश्ता व स्नैक्स');
  const [newDishPortions, setNewDishPortions] = useState<Array<{ size: string; listingPrice: number; vendorPayoutRate: number }>>([
    { size: 'Standard', listingPrice: 99, vendorPayoutRate: 40 }
  ]);

  // Monday Payout Disbursement Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutUtr, setPayoutUtr] = useState('');
  const [payoutMode, setPayoutMode] = useState('UPI');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Refund Deduction Form State
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundCustomerAmount, setRefundCustomerAmount] = useState<number>(0);
  const [refundVendorCut, setRefundVendorCut] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('कस्टमर कैंसलेशन व रिफंड');

  // Add Inventory Form State
  const [invName, setInvName] = useState('');
  const [invHindiName, setInvHindiName] = useState('');
  const [invCategory, setInvCategory] = useState<'raw_materials' | 'dairy' | 'packaging' | 'spices_oils'>('raw_materials');
  const [invStock, setInvStock] = useState<number>(10);
  const [invUnit, setInvUnit] = useState('KG');
  const [invMinThreshold, setInvMinThreshold] = useState<number>(5);

  // Daily Menu Schedule Management State
  const [dailyMenuConfig, setDailyMenuConfig] = useState<any>(null);
  const [selectedManageDay, setSelectedManageDay] = useState<string>('monday');
  const [addDishTarget, setAddDishTarget] = useState<'day_schedule' | 'regular_fixed'>('day_schedule');
  const [addDishSlot, setAddDishSlot] = useState<'lunch' | 'dinner'>('lunch');
  const [selectedDishToSchedule, setSelectedDishToSchedule] = useState<string>('');

  // Monthly Calendar & Bulk Update State
  const [dailyMenuViewMode, setDailyMenuViewMode] = useState<'monthly' | 'weekly'>('monthly');
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(11); // 1-indexed, default Nov 2026
  const [monthlyCalendarDays, setMonthlyCalendarDays] = useState<any[]>([]);
  const [selectedCalDates, setSelectedCalDates] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkAction, setBulkAction] = useState<'apply_template' | 'custom_dishes' | 'clear_override'>('apply_template');
  const [bulkTemplateDayId, setBulkTemplateDayId] = useState<string>('monday');
  const [bulkSpecialCurry, setBulkSpecialCurry] = useState<string>('');
  const [bulkSpecialRice, setBulkSpecialRice] = useState<string>('');
  const [bulkSpecialBread, setBulkSpecialBread] = useState<string>('');
  const [bulkLunchDishIds, setBulkLunchDishIds] = useState<string[]>([]);
  const [bulkDinnerDishIds, setBulkDinnerDishIds] = useState<string[]>([]);

  // Safety Lock Mechanism State (Accidental Deletion Safeguard)
  const [unlockedItemIds, setUnlockedItemIds] = useState<Record<string, boolean>>({});
  const [unlockingTarget, setUnlockingTarget] = useState<{ id: string; name: string; type: string } | null>(null);

  const isItemUnlocked = (id: string): boolean => {
    return Boolean(unlockedItemIds[id]);
  };

  const handleToggleLockItem = (id: string, name: string, type: string) => {
    if (unlockedItemIds[id]) {
      setUnlockedItemIds(prev => ({ ...prev, [id]: false }));
      showToast(`🔒 "${name}" के लिए सुरक्षा लॉक वापस सक्रिय कर दिया गया है।`);
    } else {
      setUnlockingTarget({ id, name, type });
    }
  };

  const handleConfirmUnlock = () => {
    if (unlockingTarget) {
      setUnlockedItemIds(prev => ({ ...prev, [unlockingTarget.id]: true }));
      showToast(`🔓 "${unlockingTarget.name}" सफलतापूर्वक अनलॉक हो गया। अब आप इसे डिलीट कर सकते हैं।`);
      setUnlockingTarget(null);
    }
  };

  const fetchMonthlyCalendar = async (year: number, month: number) => {
    try {
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const data = await safeJsonFetch(`/api/owner/daily-menu/monthly-calendar?year=${year}&month=${monthStr}`);
      if (data && data.success) {
        setMonthlyCalendarDays(data.days || []);
      }
    } catch (err) {
      console.warn('Error fetching monthly calendar:', err);
    }
  };

  const handleSelectAllMondays = () => {
    const mondays = monthlyCalendarDays.filter(d => d.isCurrentMonth && d.dayOfWeek === 'monday').map(d => d.dateStr);
    setSelectedCalDates(mondays);
  };

  const handleSelectAllSundays = () => {
    const sundays = monthlyCalendarDays.filter(d => d.isCurrentMonth && d.dayOfWeek === 'sunday').map(d => d.dateStr);
    setSelectedCalDates(sundays);
  };

  const handleSelectAllWeekends = () => {
    const weekends = monthlyCalendarDays.filter(d => d.isCurrentMonth && (d.dayOfWeek === 'saturday' || d.dayOfWeek === 'sunday')).map(d => d.dateStr);
    setSelectedCalDates(weekends);
  };

  const handleSelectAllMonth = () => {
    const allMonth = monthlyCalendarDays.filter(d => d.isCurrentMonth).map(d => d.dateStr);
    setSelectedCalDates(allMonth);
  };

  const handleClearCalSelection = () => {
    setSelectedCalDates([]);
  };

  const toggleCalDateSelection = (dateStr: string) => {
    setSelectedCalDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleBulkUpdateCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCalDates.length === 0) {
      showToast('कृपया कम से कम एक तारीख चुनें', true);
      return;
    }

    try {
      setLoading(true);
      let lunchDishesPayload: any[] = [];
      let dinnerDishesPayload: any[] = [];

      if (bulkAction === 'custom_dishes') {
        lunchDishesPayload = bulkLunchDishIds.map(id => {
          const r = rateCard.find(item => item.id === id);
          if (!r) return null;
          const p = r.portions[0] || { listingPrice: 99, vendorPayoutRate: 40 };
          return {
            dishId: r.id,
            name: r.name,
            hindiName: r.hindiName || r.name,
            listingPrice: p.listingPrice,
            vendorPayoutRate: p.vendorPayoutRate
          };
        }).filter(Boolean);

        dinnerDishesPayload = bulkDinnerDishIds.map(id => {
          const r = rateCard.find(item => item.id === id);
          if (!r) return null;
          const p = r.portions[0] || { listingPrice: 99, vendorPayoutRate: 40 };
          return {
            dishId: r.id,
            name: r.name,
            hindiName: r.hindiName || r.name,
            listingPrice: p.listingPrice,
            vendorPayoutRate: p.vendorPayoutRate
          };
        }).filter(Boolean);
      }

      const res = await fetch('/api/owner/daily-menu/bulk-update-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: selectedCalDates,
          action: bulkAction,
          templateDayId: bulkTemplateDayId,
          specialCurry: bulkSpecialCurry,
          specialRice: bulkSpecialRice,
          specialBread: bulkSpecialBread,
          lunchDishes: lunchDishesPayload,
          dinnerDishes: dinnerDishesPayload
        })
      });

      const data = await res.json();
      if (data && data.success) {
        showToast(data.message || 'कैलेंडर बल्क अपडेट सफल!');
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
        setShowBulkModal(false);
        setSelectedCalDates([]);
        fetchMonthlyCalendar(calYear, calMonth);
      } else {
        showToast(data?.message || 'बल्क अपडेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Safe JSON Fetch helper
  const safeJsonFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('json')) {
        return await res.json();
      }
      const text = await res.text();
      if (text && (text.startsWith('{') || text.startsWith('['))) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn(`[OwnerSafeFetch] Warning for ${url}:`, e);
    }
    return null;
  };

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const data = await safeJsonFetch('/api/owner/vendor/overview');
      if (data && data.success) {
        if (data.isOnline !== undefined) setVendorIsOnline(Boolean(data.isOnline));
        if (data.kitchenPhotoUrl !== undefined) setVendorKitchenPhotoUrl(data.kitchenPhotoUrl || '');
        if (data.kitchenPhotoTimestamp !== undefined) setVendorKitchenPhotoTimestamp(data.kitchenPhotoTimestamp || '');
        if (data.profile) setVendorProfile(data.profile);
        setRateCard(data.rateCard || []);
        setPendingDishes(data.pendingDishes || []);
        setOrders(data.orders || []);
        setWallet(data.wallet || {});
        setTransactions(data.transactions || []);
        setRefundDeductions(data.refundDeductions || []);
        setInventory(data.inventory || []);
        setPayoutRequests(data.payoutRequests || []);
        if (data.incentiveStats) setIncentiveStats(data.incentiveStats);
        if (data.incentiveConfig) setIncentiveConfig(data.incentiveConfig);
        if (data.incentiveHistory) setIncentiveHistory(data.incentiveHistory);
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
        if (data.wallet?.eligibleMondayPayout > 0) {
          setPayoutAmount(data.wallet.eligibleMondayPayout);
        }
      }
    } catch (err) {
      console.warn('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKitchenPhoto = async () => {
    if (!confirm('क्या आप सचमुच वेंडर की किचन फोटो डिलीट करना चाहते हैं?')) return;
    try {
      const res = await fetch('/api/owner/vendor/kitchen-photo/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(data.message || 'मालिक द्वारा रसोई फोटो डिलीट कर दी गई!');
        setVendorKitchenPhotoUrl('');
        setVendorKitchenPhotoTimestamp('');
      } else {
        showToast(data?.message || 'फोटो हटाने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  const handleUpdateDayHighlights = async (dayId: string, specialCurry: string, specialRice: string, specialBread: string) => {
    try {
      const res = await fetch('/api/owner/daily-menu/update-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, specialCurry, specialRice, specialBread })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'दिन की विशेष हाइलाइट्स सहेजी गईं!');
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
      } else {
        showToast(data.message || 'अपडेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर त्रुटि', true);
    }
  };

  const handleAddDishToSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDishToSchedule) {
      showToast('कृपया मास्टर रेट कार्ड से डिश चुनें', true);
      return;
    }
    const rateItem = rateCard.find(r => r.id === selectedDishToSchedule);
    if (!rateItem) return;

    const portion = rateItem.portions[0] || { listingPrice: 99, vendorPayoutRate: 40 };

    try {
      const res = await fetch('/api/owner/daily-menu/add-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: addDishTarget,
          dayId: selectedManageDay,
          mealSlot: addDishSlot,
          dishId: rateItem.id,
          name: rateItem.name,
          hindiName: rateItem.hindiName || rateItem.name,
          listingPrice: portion.listingPrice,
          vendorPayoutRate: portion.vendorPayoutRate
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'डिश मेनू शेड्यूल में जुड़ गई!');
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
        setSelectedDishToSchedule('');
      } else {
        showToast(data.message || 'डिश जोड़ने में समस्या', true);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    }
  };

  const handleRemoveDishFromSchedule = async (target: string, dayId: string, mealSlot: string, dishId: string) => {
    const lockKey = `${target}_${dayId}_${mealSlot}_${dishId}`;
    if (!isItemUnlocked(lockKey)) {
      setUnlockingTarget({ id: lockKey, name: 'दैनिक मेनू डिश', type: 'डेली फिक्स मेनू' });
      showToast('🔒 यह मेनू एंट्री सुरक्षा लॉक से सुरक्षित है! हटाने के लिए पहले 🔓 अनलॉक करें।', true);
      return;
    }
    try {
      const res = await fetch('/api/owner/daily-menu/remove-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, dayId, mealSlot, dishId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'डिश शेड्यूल से हटा दी गई!');
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
      } else {
        showToast(data.message || 'हटाने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    }
  };

  const handleResetDailyMenu = async () => {
    if (!confirm('क्या आप सचमुच दैनिक मेनू शेड्यूल को डिफ़ॉल्ट अधिकृत लिस्ट पर रीसेट करना चाहते हैं?')) return;
    try {
      const res = await fetch('/api/owner/daily-menu/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'शेड्यूल रीसेट हो गया!');
        if (data.dailyMenuConfig) setDailyMenuConfig(data.dailyMenuConfig);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    }
  };

  const handleGrantSpotIncentive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotAmount || spotAmount <= 0) {
      showToast('कृपया मान्य इंसेंटिव राशि दर्ज करें', true);
      return;
    }
    try {
      setIsProcessingIncentives(true);
      const res = await fetch('/api/owner/incentives/grant-spot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: spotVendorId,
          amount: spotAmount,
          reason: spotReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'इंसेंटिव बोनस वेंडर वॉलेट में क्रेडिट हो गया!');
        setSpotAmount('');
        setSpotReason('');
        loadOwnerData();
      } else {
        showToast(data.message || 'इंसेंटिव क्रेडिट करने में समस्या', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो सका', true);
    } finally {
      setIsProcessingIncentives(false);
    }
  };

  const handleProcessWeeklyMilestones = async () => {
    try {
      setIsProcessingIncentives(true);
      const res = await fetch('/api/owner/incentives/process-milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadOwnerData();
      } else {
        showToast(data.message || 'त्रुटि हुई', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो सका', true);
    } finally {
      setIsProcessingIncentives(false);
    }
  };

  const openEditIncentiveConfigModal = () => {
    setEditableIncentiveConfig(JSON.parse(JSON.stringify(incentiveConfig)));
    setShowEditIncentiveConfigModal(true);
  };

  const handleSaveIncentiveConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProcessingIncentives(true);
      const res = await fetch('/api/owner/incentives/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableIncentiveConfig)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'इंसेंटिव रूल्स अपडेट हो गए!');
        setShowEditIncentiveConfigModal(false);
        loadOwnerData();
      } else {
        showToast(data.message || 'अपडेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो सका', true);
    } finally {
      setIsProcessingIncentives(false);
    }
  };

  const handleDeleteGrantedIncentive = async (recordId: string) => {
    if (!isItemUnlocked(recordId)) {
      setUnlockingTarget({ id: recordId, name: `इंसेंटिव रिकॉर्ड #${recordId}`, type: 'इंसेंटिव रिकॉर्ड' });
      showToast(`🔒 इंसेंटिव #${recordId} सुरक्षा लॉक द्वारा सुरक्षित है! पहले 🔓 अनलॉक करें।`, true);
      return;
    }
    if (!confirm(`क्या आप सचमुच इंसेंटिव #${recordId} को हटाकर वॉलेट राशि रिवर्स करना चाहते हैं?`)) return;
    try {
      setIsProcessingIncentives(true);
      const res = await fetch('/api/owner/incentives/delete-granted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'इंसेंटिव रिकॉर्ड हटा दिया गया!');
        loadOwnerData();
      } else {
        showToast(data.message || 'हटाने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो सका', true);
    } finally {
      setIsProcessingIncentives(false);
    }
  };

  const handleClearIncentiveHistory = async () => {
    if (!confirm('क्या आप संपूर्ण इंसेंटिव हिस्ट्री रिसेट करना चाहते हैं?')) return;
    try {
      setIsProcessingIncentives(true);
      const res = await fetch('/api/owner/incentives/clear-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'इंसेंटिव हिस्ट्री रिसेट हो गई!');
        loadOwnerData();
      } else {
        showToast(data.message || 'रिसेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो सका', true);
    } finally {
      setIsProcessingIncentives(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOwnerData();
      fetchMonthlyCalendar(calYear, calMonth);
    }
  }, [isAuthenticated, calYear, calMonth]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const p = ownerPin.trim();
    if (p === '1234' || p === 'Navovia@2026' || p === '123456' || p.toLowerCase() === 'own') {
      const session = { id: 'own', role: 'owner', name: 'Master Owner', isOwner: true };
      localStorage.setItem('tiffin_session_owner', JSON.stringify(session));
      setIsAuthenticated(true);
    } else {
      setAuthError('अमान्य पासवर्ड या पिन। कृपया सही क्रेडेंशियल दर्ज करें।');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tiffin_session_owner');
    setIsAuthenticated(false);
  };

  // 1. Toggle stock status
  const handleToggleStock = async (itemId: string, currentStock: boolean) => {
    try {
      const res = await fetch('/api/owner/vendor/rate-card/toggle-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, inStock: !currentStock })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'स्टॉक स्थिति अपडेट हुई');
        loadOwnerData();
      } else {
        showToast(data.message || 'स्टॉक बदलने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो पाया', true);
    }
  };

  // 2. Add New Dish
  const handleAddDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) {
      showToast('डिश का नाम अनिवार्य है', true);
      return;
    }
    try {
      const res = await fetch('/api/owner/vendor/rate-card/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDishName.trim(),
          hindiName: newDishHindiName.trim() || newDishName.trim(),
          category: newDishCategory,
          categoryLabel: newDishCategoryLabel,
          portions: newDishPortions,
          inStock: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'नई डिश मास्टर रेट कार्ड में जुड़ गई!');
        setShowAddDishModal(false);
        setNewDishName('');
        setNewDishHindiName('');
        setNewDishPortions([{ size: 'Standard', listingPrice: 99, vendorPayoutRate: 40 }]);
        loadOwnerData();
      } else {
        showToast(data.message || 'डिश जोड़ने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन विफल', true);
    }
  };

  // 3. Update Existing Dish
  const handleUpdateDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    try {
      const res = await fetch('/api/owner/vendor/rate-card/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDish)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'रेट कार्ड अपडेट हो गया!');
        setEditingDish(null);
        loadOwnerData();
      } else {
        showToast(data.message || 'अपडेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन विफल', true);
    }
  };

  // 4. Delete Dish
  const handleDeleteDish = async (itemId: string, name: string) => {
    if (!isItemUnlocked(itemId)) {
      setUnlockingTarget({ id: itemId, name, type: 'मास्टर रेट कार्ड डिश' });
      showToast(`🔒 "${name}" के लिए सुरक्षा लॉक सक्रिय है! हटाने से पहले 🔓 अनलॉक बटन पर क्लिक करें।`, true);
      return;
    }
    if (!confirm(`क्या आप सचमुच "${name}" को मास्टर रेट कार्ड से हटाना चाहते हैं?`)) return;
    try {
      const res = await fetch('/api/owner/vendor/rate-card/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'डिश हटा दी गई');
        loadOwnerData();
      } else {
        showToast(data.message || 'त्रुटि', true);
      }
    } catch {
      showToast('सर्वर समस्या', true);
    }
  };

  // 4b. Reset Rate Card to Authoritative Master PDF & Combos
  const handleResetToMasterRateCard = async () => {
    if (!confirm('क्या आप अधिकृत 3-पेज किचन मेनू और सभी पराठा व नाश्ता चाय कॉम्बो को सिंक/रीसेट करना चाहते हैं?')) return;
    try {
      const res = await fetch('/api/owner/vendor/rate-card/reset-to-master', {
        method: 'POST'
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(data.message || 'मास्टर रेट कार्ड सफलतापूर्वक रीसेट हो गया!');
        loadOwnerData();
      } else {
        showToast(data?.message || 'रीसेट विफल', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // 4c. Bulk Import Handlers (Excel / PDF / Copy-Paste Text)
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImportFile(true);
    try {
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const categoryLabels: Record<string, string> = {
        breakfast_snacks: 'नाश्ता व स्नैक्स',
        monday: 'सोमवार का मेनू',
        tuesday: 'मंगलवार का मेनू',
        wednesday: 'बुधवार का मेनू',
        thursday: 'गुरुवार का मेनू',
        friday: 'शुक्रवार का मेनू',
        saturday: 'शनिवार का मेनू',
        sunday: 'रविवार का मेनू',
        special_thali: 'विशेष थाली',
        vrat_special: 'व्रत स्पेशल',
        breads_desserts: 'ब्रेड्स व मीठा'
      };

      const extracted: Array<{
        tempId: string;
        name: string;
        hindiName: string;
        category: string;
        categoryLabel: string;
        portionSize: string;
        listingPrice: number;
        vendorPayoutRate: number;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !Array.isArray(row) || row.length === 0) continue;
        const col0 = String(row[0] || '').trim();
        if (!col0 || col0.toLowerCase().includes('dish') || col0.toLowerCase().includes('name') || col0.includes('डिश')) continue;

        const name = col0;
        const hindiName = String(row[1] || name).trim();
        let category = String(row[2] || 'breakfast_snacks').trim().toLowerCase();
        if (!categoryLabels[category]) {
          category = 'breakfast_snacks';
        }
        const listingPrice = Math.max(1, Number(row[3]) || 120);
        const vendorPayoutRate = Math.max(1, Number(row[4]) || Math.round(listingPrice * 0.4));

        extracted.push({
          tempId: `excel_${Date.now()}_${i}`,
          name,
          hindiName,
          category,
          categoryLabel: categoryLabels[category] || 'नाश्ता व स्नैक्स',
          portionSize: 'Standard',
          listingPrice,
          vendorPayoutRate
        });
      }

      if (extracted.length > 0) {
        setParsedImportItems(prev => [...prev, ...extracted]);
        showToast(`📊 Excel से ${extracted.length} डिशेज़ पढ़ी गईं!`);
      } else {
        showToast('फ़ाइल में कोई मान्य डिश डेटा नहीं मिला।', true);
      }
    } catch (err) {
      console.error('Excel file parse error:', err);
      showToast('Excel फ़ाइल पढ़ने में त्रुटि।', true);
    } finally {
      setIsProcessingImportFile(false);
      e.target.value = '';
    }
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImportFile(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const extracted: Array<{
        tempId: string;
        name: string;
        hindiName: string;
        category: string;
        categoryLabel: string;
        portionSize: string;
        listingPrice: number;
        vendorPayoutRate: number;
      }> = [];

      lines.forEach((line, idx) => {
        const clean = line.trim();
        if (!clean || clean.length < 3) return;
        const priceMatch = clean.match(/(\d{2,4})\s*$/);
        if (priceMatch) {
          const listingPrice = Number(priceMatch[1]);
          const namePart = clean.replace(/(\d{2,4})\s*$/, '').trim().replace(/[-|,:]+$/, '').trim();
          if (namePart.length >= 2) {
            extracted.push({
              tempId: `pdf_${Date.now()}_${idx}`,
              name: namePart,
              hindiName: namePart,
              category: 'breakfast_snacks',
              categoryLabel: 'नाश्ता व स्नैक्स',
              portionSize: 'Standard',
              listingPrice,
              vendorPayoutRate: Math.round(listingPrice * 0.4)
            });
          }
        }
      });

      if (extracted.length > 0) {
        setParsedImportItems(prev => [...prev, ...extracted]);
        showToast(`📄 PDF से ${extracted.length} डिशेज़ एक्सट्रैक्ट की गईं!`);
      } else {
        showToast('PDF फ़ाइल से डिश डेटा स्वतः एक्सट्रैक्ट नहीं हो सका। टेक्स्ट पेस्ट का प्रयोग करें।', true);
      }
    } catch (err) {
      console.error('PDF file parse error:', err);
      showToast('PDF फ़ाइल पढ़ने में समस्या।', true);
    } finally {
      setIsProcessingImportFile(false);
      e.target.value = '';
    }
  };

  const handleParseRawText = () => {
    if (!rawTextPaste.trim()) {
      showToast('कृपया पहले टेक्स्ट पेस्ट करें', true);
      return;
    }
    const lines = rawTextPaste.split(/\r?\n/);
    const categoryLabels: Record<string, string> = {
      breakfast_snacks: 'नाश्ता व स्नैक्स',
      monday: 'सोमवार का मेनू',
      tuesday: 'मंगलवार का मेनू',
      wednesday: 'बुधवार का मेनू',
      thursday: 'गुरुवार का मेनू',
      friday: 'शुक्रवार का मेनू',
      saturday: 'शनिवार का मेनू',
      sunday: 'रविवार का मेनू',
      special_thali: 'विशेष थाली',
      vrat_special: 'व्रत स्पेशल',
      breads_desserts: 'ब्रेड्स व मीठा'
    };

    const extracted: Array<{
      tempId: string;
      name: string;
      hindiName: string;
      category: string;
      categoryLabel: string;
      portionSize: string;
      listingPrice: number;
      vendorPayoutRate: number;
    }> = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split(/[,|\t]+/).map(p => p.trim()).filter(Boolean);
      let name = '';
      let hindiName = '';
      let listingPrice = 120;
      let vendorPayoutRate = 45;

      if (parts.length >= 4) {
        name = parts[0];
        hindiName = parts[1];
        listingPrice = Number(parts[2]) || 120;
        vendorPayoutRate = Number(parts[3]) || Math.round(listingPrice * 0.4);
      } else if (parts.length === 3) {
        name = parts[0];
        hindiName = parts[1];
        listingPrice = Number(parts[2]) || 120;
        vendorPayoutRate = Math.round(listingPrice * 0.4);
      } else if (parts.length === 2) {
        name = parts[0];
        hindiName = parts[0];
        listingPrice = Number(parts[1]) || 120;
        vendorPayoutRate = Math.round(listingPrice * 0.4);
      } else {
        const priceMatch = trimmed.match(/(\d{2,4})\s*$/);
        if (priceMatch) {
          listingPrice = Number(priceMatch[1]);
          name = trimmed.replace(/(\d{2,4})\s*$/, '').trim();
          hindiName = name;
          vendorPayoutRate = Math.round(listingPrice * 0.4);
        } else {
          name = trimmed;
          hindiName = trimmed;
        }
      }

      if (name) {
        extracted.push({
          tempId: `txt_${Date.now()}_${idx}`,
          name,
          hindiName,
          category: 'breakfast_snacks',
          categoryLabel: categoryLabels['breakfast_snacks'],
          portionSize: 'Standard',
          listingPrice,
          vendorPayoutRate
        });
      }
    });

    if (extracted.length > 0) {
      setParsedImportItems(prev => [...prev, ...extracted]);
      showToast(`📋 ${extracted.length} डिशेज़ एक्सट्रैक्ट की गईं!`);
      setRawTextPaste('');
    } else {
      showToast('टेक्स्ट से कोई डिश डेटा नहीं बन सका', true);
    }
  };

  const handleSaveBulkImportSubmit = async () => {
    if (parsedImportItems.length === 0) {
      showToast('इम्पोर्ट करने के लिए कोई डिश सूची नहीं है', true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/owner/vendor/rate-card/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedImportItems })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `🎉 ${data.count || parsedImportItems.length} डिशेज़ मास्टर रेट कार्ड में सुरक्षित जुड़ गईं!`);
        setShowBulkImportModal(false);
        setParsedImportItems([]);
        loadOwnerData();
      } else {
        showToast(data.message || 'बल्क इम्पोर्ट करने में त्रुटि हुई', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन में समस्या', true);
    } finally {
      setLoading(false);
    }
  };

  const [customDishPortions, setCustomDishPortions] = useState<Record<string, Array<{ size: string; listingPrice: number; vendorPayoutRate: number }>>>({});

  const getDishPortions = (dish: any) => {
    if (customDishPortions[dish.id]) return customDishPortions[dish.id];
    return dish.portions || [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 60 }];
  };

  const handleUpdateCustomDishPortion = (dishId: string, portionIdx: number, field: 'listingPrice' | 'vendorPayoutRate', val: number) => {
    setCustomDishPortions(prev => {
      const existingDish = pendingDishes.find(d => d.id === dishId);
      const currentPortions = prev[dishId] 
        ? [...prev[dishId]] 
        : (existingDish?.portions ? existingDish.portions.map((p: any) => ({ ...p })) : [{ size: 'Standard', listingPrice: 149, vendorPayoutRate: 60 }]);
      
      if (currentPortions[portionIdx]) {
        currentPortions[portionIdx] = {
          ...currentPortions[portionIdx],
          [field]: Math.max(0, val)
        };
      }
      return { ...prev, [dishId]: currentPortions };
    });
  };

  // 5. Review Custom Dish (Approve / Reject)
  const handleReviewDish = async (dishId: string, action: 'APPROVE' | 'REJECT', customPortions?: any[]) => {
    const notes = action === 'APPROVE' 
      ? 'देवी (मालिक) द्वारा अनुमोदित व दर संशोधित (Approved by Owner)' 
      : (prompt('डिश अस्वीकृत करने का कारण दर्ज करें:') || 'मानदंडों के अनुरूप नहीं');

    try {
      const res = await fetch('/api/owner/vendor/dishes/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId, action, notes, customPortions })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadOwnerData();
      } else {
        showToast(data?.message || 'समीक्षा विफल', true);
      }
    } catch {
      showToast('सर्वर समस्या', true);
    }
  };

  // 5b. Verify Vendor Order & Credit Wallet
  const handleVerifyOrder = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    const notes = action === 'REJECT' ? (prompt('आर्डर अस्वीकृत करने का कारण दर्ज करें:') || 'अमान्य आर्डर') : 'देवी द्वारा सत्यापित व अनुमोदित';
    try {
      const res = await fetch('/api/owner/vendor/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action, notes })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(data.message);
        loadOwnerData();
      } else {
        showToast(data?.message || 'सत्यापन विफल', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // 6. Update Live Order Status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/owner/vendor/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'ऑर्डर स्टेटस अपडेट हुआ');
        loadOwnerData();
      } else {
        showToast(data.message || 'त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // 7. Disburse Monday Payout
  const handleDisbursePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount || payoutAmount <= 0) {
      showToast('मान्य पेआउट राशि दर्ज करें', true);
      return;
    }
    if (!payoutUtr.trim()) {
      showToast('बैंक/UPI UTR रेफरेंस नंबर अनिवार्य है', true);
      return;
    }

    try {
      const res = await fetch('/api/owner/vendor/payout/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(payoutAmount),
          utrNumber: payoutUtr.trim(),
          paymentMode: payoutMode,
          notes: payoutNotes.trim(),
          requestId: activePayoutRequestId
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'पेआउट ट्रांसफर सफलतापूर्वक दर्ज हुआ!');
        setShowPayoutModal(false);
        setPayoutUtr('');
        setPayoutNotes('');
        setActivePayoutRequestId('');
        loadOwnerData();
      } else {
        showToast(data.message || 'पेआउट दर्ज करने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // 8. Add Refund Deduction
  const handleRefundDeductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundVendorCut || refundVendorCut <= 0) {
      showToast('मान्य वेंडर कटौती राशि दर्ज करें', true);
      return;
    }
    try {
      const res = await fetch('/api/owner/vendor/refunds/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: refundOrderId.trim() || 'GEN-DEDUCTION',
          customerRefundAmount: Number(refundCustomerAmount || refundVendorCut),
          vendorCutDeducted: Number(refundVendorCut),
          reason: refundReason.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'कटौती दर्ज की गई');
        setShowRefundModal(false);
        setRefundOrderId('');
        setRefundCustomerAmount(0);
        setRefundVendorCut(0);
        loadOwnerData();
      } else {
        showToast(data.message || 'कटौती दर्ज करने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // 9. Add Inventory Item
  const handleAddInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) {
      showToast('आइटम का नाम अनिवार्य है', true);
      return;
    }
    try {
      const res = await fetch('/api/owner/vendor/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: invName.trim(),
          hindiName: invHindiName.trim() || invName.trim(),
          category: invCategory,
          currentStock: Number(invStock),
          unit: invUnit,
          minThreshold: Number(invMinThreshold)
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'इन्वेंटरी आइटम जोड़ा गया');
        setShowAddInventoryModal(false);
        setInvName('');
        setInvHindiName('');
        loadOwnerData();
      } else {
        showToast(data.message || 'त्रुटि', true);
      }
    } catch {
      showToast('सर्वर त्रुटि', true);
    }
  };

  // Quick inventory stock adjust
  const handleQuickStockAdjust = async (itemId: string, change: number) => {
    try {
      const res = await fetch('/api/vendor/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, changeAmount: change })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        loadOwnerData();
      }
    } catch {}
  };

  // Filter Rate Card
  const filteredRateCard = rateCard.filter(item => {
    const q = rateSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) || 
      (item.hindiName && item.hindiName.toLowerCase().includes(q)) || 
      item.id.toLowerCase().includes(q);
    const matchesCat = rateCategory === 'all' || 
      item.category === rateCategory || 
      (item.categoryLabel && item.categoryLabel.includes(rateCategory));
    return matchesSearch && matchesCat;
  });

  // Filter Orders
  const filteredOrders = orders.filter(o => {
    const q = orderSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      o.orderNumber.toLowerCase().includes(q) || 
      (o.itemName && o.itemName.toLowerCase().includes(q));
    const matchesSource = orderSourceFilter === 'all' || o.source === orderSourceFilter;
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  // =========================================================================
  // VIEW: OWNER LOGIN SCREEN
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              👑
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 inline-block">
              NOV TIFFIN • OWNER MASTER CONSOLE
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              मालिक कंट्रोल डेस्क
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              मास्टर रेट कार्ड, डिश अप्रूवल, लाइव ऑर्डर्स व सोमवार पेआउट कंट्रोल
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मालिक मास्टर पासवर्ड / पिन (Owner PIN)
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder="मालिक पासवर्ड दर्ज करें"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-mono tracking-wider text-center text-lg font-bold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-indigo-700 hover:from-amber-700 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔒 मालिक कंसोल में प्रवेश करें</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: AUTHENTICATED OWNER CONTROL DASHBOARD
  // =========================================================================
  const grossBalance = wallet.currentBalance || 0;
  const reserveAmt = wallet.minimumReserve || 2000;
  const eligibleMondayPayout = Math.max(0, grossBalance - reserveAmt);
  
  const pendingOrdersToVerify = orders.filter(o => !o.payoutCreditedToWallet && o.verificationStatus !== 'REJECTED');
  const pendingDishesToApprove = pendingDishes.filter(d => d.status === 'PENDING');
  const pendingCount = pendingOrdersToVerify.length + pendingDishesToApprove.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border animate-bounce ${
          toastMsg.isError ? 'bg-red-600 text-white border-red-700' : 'bg-emerald-700 text-white border-emerald-800'
        }`}>
          <span>{toastMsg.isError ? '❌' : '✅'}</span>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Owner Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 border border-amber-400/30 flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-500/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black tracking-tight text-white">
                  NOV TIFFIN
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                  मालिक कंट्रोल हब (Owner Panel)
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  100% आंतरिक (No Google Sheet)
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                मास्टर रेट कार्ड, डिश अप्रूवल, लाइव ऑर्डर्स व सोमवार पेआउट कंट्रोल डेस्क • वेंडर: NIR8800
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onSwitchToVendor && (
              <button
                onClick={onSwitchToVendor}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer border border-emerald-500/40"
                title="वेंडर पोर्टल पर स्विच करें"
              >
                <span>🏪</span>
                <span className="hidden sm:inline">वेंडर पोर्टल</span>
              </button>
            )}
            <button
              onClick={loadOwnerData}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
              title="डेटा रीफ्रेश करें"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">रीफ्रेश</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl text-xs font-black transition border border-red-800/80 cursor-pointer shadow-sm"
            >
              लॉगआउट
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Widescreen Laptop Optimized */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        
        {/* Vendor Live Online Status & Kitchen Inspection Card */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ${
              vendorIsOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-2 ring-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {vendorIsOnline ? '🟢' : '🔴'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-white">
                  वेंडर रसोई स्टेटस: {vendorIsOnline ? 'ऑनलाइन (लाइव) 🟢' : 'ऑफ़लाइन (बंद) 🔴'}
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  vendorIsOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {vendorIsOnline ? 'ऑर्डर स्वीकार्य' : 'ऑर्डर बंद'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                रसोई का नाम: <strong className="text-slate-200">{vendorProfile?.vendorName || 'निरंकारी टिफिन सेंटर'}</strong> • मालिक: <strong className="text-slate-200">{vendorProfile?.ownerName || 'NIR8800'}</strong> • फोन: <strong className="text-slate-200">{vendorProfile?.phone || '8800880088'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {vendorKitchenPhotoUrl ? (
              <div className="flex items-center gap-3 bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                <img
                  src={vendorKitchenPhotoUrl}
                  alt="Kitchen Photo"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-700 shadow-md"
                />
                <div className="text-left space-y-1">
                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    📸 लाइव रसोई फोटो
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {vendorKitchenPhotoTimestamp ? new Date(vendorKitchenPhotoTimestamp).toLocaleString('hi-IN') : 'हाल ही में अपलोड'}
                  </div>
                  <button
                    onClick={handleDeleteKitchenPhoto}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer border border-red-500 shadow-sm"
                    title="मालिक (देवी) द्वारा रसोई फोटो डिलीट करें"
                  >
                    <span>🗑️</span>
                    <span>फोटो डिलीट करें</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-3 py-2 rounded-xl inline-block">
                  📷 कोई लाइव रसोई फोटो अपलोड नहीं है
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Financial & Operational Metric Highlights (5 Columns on Laptop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4">
          <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1">
              वेंडर कुल कमाई (Gross)
            </span>
            <div className="text-2xl lg:text-3xl font-black text-slate-900">
              ₹{grossBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              वेंडर ID: NIR8800
            </span>
          </div>

          <div className="bg-white p-4 lg:p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md transition">
            <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block mb-1">
              सुरक्षा रिज़र्व (Reserve)
            </span>
            <div className="text-2xl lg:text-3xl font-black text-amber-800">
              ₹{reserveAmt.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-600 font-medium mt-1 block">
              नियमतः हमेशा सुरक्षित
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-teal-100/60 p-4 lg:p-5 rounded-2xl border border-emerald-300 shadow-sm hover:shadow-md transition relative overflow-hidden">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider block mb-1">
              मंगलवार देय पेआउट
            </span>
            <div className="text-2xl lg:text-3xl font-black text-emerald-950">
              ₹{eligibleMondayPayout.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <span className="text-[10px] text-emerald-800 font-bold">
                {eligibleMondayPayout > 0 ? 'ट्रांसफर हेतु तैयार' : 'रिज़र्व से कम'}
              </span>
              <button
                onClick={() => {
                  setPayoutAmount(eligibleMondayPayout);
                  setShowPayoutModal(true);
                }}
                className="text-[10px] font-black bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg transition shadow-sm cursor-pointer"
              >
                पेआउट करें
              </button>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-5 rounded-2xl border border-indigo-200 shadow-sm hover:shadow-md transition">
            <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wider block mb-1">
              पेंडिंग अप्रूवल (Approvals)
            </span>
            <div className="text-2xl lg:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                  निर्णय आधारित
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              नई डिश व अमान्य आर्डर्स
            </span>
          </div>

          <div className="bg-white p-4 lg:p-5 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition col-span-2 md:col-span-1">
            <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider block mb-1">
              साप्ताहिक इंसेंटिव (Incentive)
            </span>
            <div className="text-2xl lg:text-3xl font-black text-purple-950">
              ₹{(incentiveStats.totalIncentiveEarnedThisCycle || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-700 font-medium mt-1 block">
              {incentiveStats.deliveredMealsThisCycle || 0} टिफिन डिलीवर इस हफ़्ते
            </span>
          </div>
        </div>

        {/* Laptop Segmented Sub-Tabs Bar */}
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-md flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('daily_menu')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'daily_menu'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>📅</span>
            <span>दैनिक व फिक्स मेनू मैनेजर</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rate_card')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'rate_card'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>📋</span>
            <span>मास्टर रेट कार्ड ({rateCard.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dish_approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
              activeSubTab === 'dish_approvals'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>⏳</span>
            <span>डिश व आर्डर अप्रूवल</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>📦</span>
            <span>लाइव ऑर्डर्स ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'payouts'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>💰</span>
            <span>मंगलवार पेआउट व लेजर</span>
          </button>

          <button
            onClick={() => setActiveSubTab('refunds')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'refunds'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>⚠️</span>
            <span>कटौती व पेनल्टी ({refundDeductions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>🥫</span>
            <span>किचन इन्वेंट्री ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('incentives')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
              activeSubTab === 'incentives'
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <span>🎯</span>
            <span>इंसेंटिव व बोनस</span>
            {incentiveStats.totalIncentiveEarnedThisCycle > 0 && (
              <span className="px-2 py-0.5 bg-emerald-400 text-slate-950 rounded-full text-[10px] font-black">
                ₹{incentiveStats.totalIncentiveEarnedThisCycle}
              </span>
            )}
          </button>
        </div>

        {/* =========================================================================
            TAB 0: DAILY MENU & REGULAR FIX SCHEDULE MANAGER (OWNER)
            ========================================================================= */}
        {activeSubTab === 'daily_menu' && (
          <div className="space-y-6">
            {/* Header & Mode Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Devi Operations Control Desk
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  दैनिक विशेष व ऑल-डे फिक्स मेनू मैनेजमेंट
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl">
                  यहाँ से आप पूरे महीने की तारीखों के अनुसार डेली फिक्स मेनू सेट व बल्क अपडेट कर सकती हैं। तारीख स्तर का बदला हुआ मेनू सीधे वेंडर पोर्टल पर लाइव दिखेगा।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDailyMenuViewMode('monthly')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      dailyMenuViewMode === 'monthly'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📆 30-दिवसीय मंथली कैलेंडर
                  </button>
                  <button
                    type="button"
                    onClick={() => setDailyMenuViewMode('weekly')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      dailyMenuViewMode === 'weekly'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📅 7-दिवसीय डिफ़ॉल्ट वीकली
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetDailyMenu}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold border border-slate-300 shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>शेड्यूल रीसेट</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                VIEW 1: MONTHLY CALENDAR GRID & BULK UPDATE SYSTEM
                ========================================================================= */}
            {dailyMenuViewMode === 'monthly' && (
              <div className="space-y-6">
                {/* Month & Navigation Toolbar */}
                <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (calMonth === 1) {
                            setCalMonth(12);
                            setCalYear(calYear - 1);
                          } else {
                            setCalMonth(calMonth - 1);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
                      >
                        ← पिछला महीना
                      </button>

                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                        <select
                          value={calMonth}
                          onChange={(e) => setCalMonth(Number(e.target.value))}
                          className="bg-transparent text-amber-400 font-black text-sm focus:outline-none cursor-pointer"
                        >
                          {[
                            'जनवरी (Jan)', 'फरवरी (Feb)', 'मार्च (Mar)', 'अप्रैल (Apr)',
                            'मई (May)', 'जून (Jun)', 'जुलाई (Jul)', 'अगस्त (Aug)',
                            'सितंबर (Sep)', 'अक्टूबर (Oct)', 'नवंबर (Nov)', 'दिसंबर (Dec)'
                          ].map((mName, idx) => (
                            <option key={idx + 1} value={idx + 1} className="bg-slate-900 text-white">
                              {mName}
                            </option>
                          ))}
                        </select>
                        <select
                          value={calYear}
                          onChange={(e) => setCalYear(Number(e.target.value))}
                          className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                        >
                          <option value={2025} className="bg-slate-900 text-white">2025</option>
                          <option value={2026} className="bg-slate-900 text-white">2026</option>
                          <option value={2027} className="bg-slate-900 text-white">2027</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          if (calMonth === 12) {
                            setCalMonth(1);
                            setCalYear(calYear + 1);
                          } else {
                            setCalMonth(calMonth + 1);
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
                      >
                        अगला महीना →
                      </button>
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold mr-1">त्वरित चयन:</span>
                      <button
                        onClick={handleSelectAllMondays}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold cursor-pointer"
                      >
                        सभी सोमवार
                      </button>
                      <button
                        onClick={handleSelectAllSundays}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold cursor-pointer"
                      >
                        सभी रविवार
                      </button>
                      <button
                        onClick={handleSelectAllWeekends}
                        className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg font-bold cursor-pointer"
                      >
                        सभी वीकेंड्स
                      </button>
                      <button
                        onClick={handleSelectAllMonth}
                        className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg font-bold cursor-pointer"
                      >
                        पूरा महीना
                      </button>
                      {selectedCalDates.length > 0 && (
                        <button
                          onClick={handleClearCalSelection}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg font-bold cursor-pointer"
                        >
                          साफ़ करें
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sticky Selection Bar */}
                  {selectedCalDates.length > 0 && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-800 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <div>
                          <strong className="text-sm font-black text-white block">
                            {selectedCalDates.length} तारीखें चुनी गईं
                          </strong>
                          <span className="text-[10px] text-amber-100 block">
                            इन चुनी हुई तारीखों पर 1-क्लिक में मेनू या टेंप्लेट लागू करें
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setBulkAction('apply_template');
                            setShowBulkModal(true);
                          }}
                          className="px-4 py-2 bg-slate-950 hover:bg-black text-amber-400 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer border border-amber-400/40"
                        >
                          ⚡ बल्क मेनू लागू करें
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7-Column Calendar Grid */}
                <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3">
                    <div className="text-red-600">रविवार (Sun)</div>
                    <div>सोमवार (Mon)</div>
                    <div>मंगलवार (Tue)</div>
                    <div>बुधवार (Wed)</div>
                    <div>गुरुवार (Thu)</div>
                    <div>शुक्रवार (Fri)</div>
                    <div className="text-indigo-600">शनिवार (Sat)</div>
                  </div>

                  {/* Date Grid Cards */}
                  <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {monthlyCalendarDays.map((day, idx) => {
                      const isSelected = selectedCalDates.includes(day.dateStr);
                      const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                      return (
                        <div
                          key={idx}
                          onClick={() => day.isCurrentMonth && toggleCalDateSelection(day.dateStr)}
                          className={`min-h-[120px] p-2.5 rounded-2xl border transition flex flex-col justify-between cursor-pointer select-none relative ${
                            !day.isCurrentMonth
                              ? 'bg-slate-50 opacity-40 border-slate-100 pointer-events-none'
                              : isSelected
                              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-md'
                              : isToday
                              ? 'bg-indigo-50/60 border-indigo-400 ring-1 ring-indigo-300'
                              : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            {/* Card Top Row */}
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {day.isCurrentMonth && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                                  />
                                )}
                                <span className={`text-xs font-black ${
                                  isToday ? 'text-indigo-700 font-extrabold underline' : 'text-slate-800'
                                }`}>
                                  {day.dayNumber}
                                </span>
                              </div>

                              {day.isCurrentMonth && (
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                                  day.hasOverride
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {day.hasOverride ? '✨ ओवरराइड' : '🔄 डिफ़ॉल्ट'}
                                </span>
                              )}
                            </div>

                            {/* Schedule Highlights */}
                            {day.isCurrentMonth && day.activeSchedule && (
                              <div className="space-y-1 text-[10px]">
                                {day.activeSchedule.specialCurry && (
                                  <div className="font-bold text-slate-800 truncate" title={day.activeSchedule.specialCurry}>
                                    🥘 {day.activeSchedule.specialCurry}
                                  </div>
                                )}
                                <div className="text-[9px] text-slate-500 font-medium">
                                  ☀️ {day.activeSchedule.lunchDishes?.length || 0} लंच • 🌙 {day.activeSchedule.dinnerDishes?.length || 0} डिनर
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Button on Card */}
                          {day.isCurrentMonth && (
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px]">
                              <span className="text-slate-400 font-bold">{day.dayNameHindi}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCalDates([day.dateStr]);
                                  setBulkAction('apply_template');
                                  setShowBulkModal(true);
                                }}
                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded font-black transition cursor-pointer"
                              >
                                ✏️ एडिट
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                VIEW 2: WEEKLY DEFAULT TEMPLATES & REGULAR FIX MENU
                ========================================================================= */}
            {dailyMenuViewMode === 'weekly' && (
              <div className="space-y-6">
                {/* Target Selectors & Form Card */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">दिन का डिफ़ॉल्ट चुनें:</span>
                      {[
                        { id: 'monday', label: 'सोमवार' },
                        { id: 'tuesday', label: 'मंगलवार' },
                        { id: 'wednesday', label: 'बुधवार' },
                        { id: 'thursday', label: 'गुरुवार' },
                        { id: 'friday', label: 'शुक्रवार' },
                        { id: 'saturday', label: 'शनिवार' },
                        { id: 'sunday', label: 'रविवार' },
                        { id: 'regular_fixed', label: '📌 ऑल-डे फिक्स मेनू (Regular Fix)' }
                      ].map(d => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedManageDay(d.id);
                            if (d.id === 'regular_fixed') {
                              setAddDishTarget('regular_fixed');
                            } else {
                              setAddDishTarget('day_schedule');
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                            selectedManageDay === d.id
                              ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Dish Form */}
                  <form onSubmit={handleAddDishToSchedule} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-black text-amber-400">
                      <span>➕ इस डिफ़ॉल्ट शेड्यूल में नई डिश जोड़ें ({selectedManageDay === 'regular_fixed' ? '📌 ऑल-डे फिक्स मेनू' : `📆 ${selectedManageDay.toUpperCase()}`})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block mb-1 font-bold text-slate-300">मास्टर रेट कार्ड से डिश चुनें:</label>
                        <select
                          value={selectedDishToSchedule}
                          onChange={(e) => setSelectedDishToSchedule(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          required
                        >
                          <option value="">-- डिश चुनें --</option>
                          {rateCard.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.hindiName || item.name} ({item.name}) - Payout: ₹{item.portions[0]?.vendorPayoutRate}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedManageDay !== 'regular_fixed' && (
                        <div>
                          <label className="block mb-1 font-bold text-slate-300">मील स्लॉट (Meal Slot):</label>
                          <select
                            value={addDishSlot}
                            onChange={(e: any) => setAddDishSlot(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="lunch">☀️ लंच मेनू (Lunch Slot)</option>
                            <option value="dinner">🌙 डिनर मेनू (Dinner Slot)</option>
                          </select>
                        </div>
                      )}

                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                        >
                          + डिफ़ॉल्ट मेनू में जोड़ें 🚀
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Displaying Current Items for Selected Day / Regular Fix */}
                {selectedManageDay === 'regular_fixed' ? (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <span>📌</span>
                        <span>ऑल-डे नियमित फिक्स मेनू आइटम्स ({dailyMenuConfig?.regularFixedDishes?.length || 0})</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dailyMenuConfig?.regularFixedDishes?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <strong className="text-sm font-black text-slate-900 block">{item.hindiName || item.name}</strong>
                            <span className="text-xs text-slate-500 font-mono block">{item.name}</span>
                            <span className="text-xs font-extrabold text-emerald-700 mt-1 block">
                              वेंडर पेआउट: ₹{item.vendorPayoutRate} (MRP: ₹{item.listingPrice})
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveDishFromSchedule('regular_fixed', '', '', item.dishId)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold cursor-pointer transition"
                            title="फिक्स मेनू से हटाएं"
                          >
                            🗑️ हटाएं
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (() => {
                  const dayData = dailyMenuConfig?.dayWiseSchedules?.[selectedManageDay];

                  return (
                    <div className="space-y-6">
                      {/* Highlights Form */}
                      <div className="bg-amber-50 p-5 rounded-3xl border border-amber-300 space-y-3">
                        <div className="text-xs font-black text-amber-950 flex items-center justify-between">
                          <span>✨ {dayData?.dayNameHindi || selectedManageDay.toUpperCase()} की विशेष हाइलाइट्स (Special Highlights)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block mb-1 font-bold text-slate-700">खास सब्जी (Special Curry):</label>
                            <input
                              type="text"
                              defaultValue={dayData?.specialCurry || ''}
                              onBlur={(e) => handleUpdateDayHighlights(selectedManageDay, e.target.value, dayData?.specialRice || '', dayData?.specialBread || '')}
                              placeholder="e.g. आलू मटर व कड़ाई पनीर"
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-bold text-slate-700">खास चावल (Special Rice):</label>
                            <input
                              type="text"
                              defaultValue={dayData?.specialRice || ''}
                              onBlur={(e) => handleUpdateDayHighlights(selectedManageDay, dayData?.specialCurry || '', e.target.value, dayData?.specialBread || '')}
                              placeholder="e.g. जीरा राइस"
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 font-bold text-slate-700">विशेष ब्रेड (Special Bread):</label>
                            <input
                              type="text"
                              defaultValue={dayData?.specialBread || ''}
                              onBlur={(e) => handleUpdateDayHighlights(selectedManageDay, dayData?.specialCurry || '', dayData?.specialRice || '', e.target.value)}
                              placeholder="e.g. तवा रोटी"
                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Lunch & Dinner Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Lunch Box */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                              <span>☀️ लंच विशेष डिशेज़</span>
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                              {dayData?.lunchDishes?.length || 0} डिशेज़
                            </span>
                          </div>

                          <div className="space-y-2">
                            {dayData?.lunchDishes?.map((dish: any, idx: number) => {
                              const itemKey = `day_schedule_${selectedManageDay}_lunch_${dish.dishId}`;
                              return (
                                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                  <div>
                                    <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                    <span className="text-[10px] text-slate-400 font-mono">{dish.name} • ₹{dish.vendorPayoutRate} पेआउट</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleLockItem(itemKey, dish.hindiName || dish.name, 'Daily Menu Schedule Slot')}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        isItemUnlocked(itemKey)
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-slate-100 text-slate-600 border-slate-300'
                                      }`}
                                      title={isItemUnlocked(itemKey) ? 'अनलॉक है (सुरक्षा लॉक लगाने के लिए क्लिक करें)' : 'सुरक्षित (लॉक है - हटाने से पहले अनलॉक करें)'}
                                    >
                                      {isItemUnlocked(itemKey) ? '🔓 अनलॉक' : '🔒 लॉक'}
                                    </button>
                                    <button
                                      onClick={() => handleRemoveDishFromSchedule('day_schedule', selectedManageDay, 'lunch', dish.dishId)}
                                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold rounded-lg cursor-pointer"
                                    >
                                      🗑️ हटाएं
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Dinner Box */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                              <span>🌙 डिनर विशेष डिशेज़</span>
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                              {dayData?.dinnerDishes?.length || 0} डिशेज़
                            </span>
                          </div>

                          <div className="space-y-2">
                            {dayData?.dinnerDishes?.map((dish: any, idx: number) => {
                              const itemKey = `day_schedule_${selectedManageDay}_dinner_${dish.dishId}`;
                              return (
                                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                                  <div>
                                    <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                    <span className="text-[10px] text-slate-400 font-mono">{dish.name} • ₹{dish.vendorPayoutRate} पेआउट</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleLockItem(itemKey, dish.hindiName || dish.name, 'Daily Menu Schedule Slot')}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        isItemUnlocked(itemKey)
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-slate-100 text-slate-600 border-slate-300'
                                      }`}
                                      title={isItemUnlocked(itemKey) ? 'अनलॉक है (सुरक्षा लॉक लगाने के लिए क्लिक करें)' : 'सुरक्षित (लॉक है - हटाने से पहले अनलॉक करें)'}
                                    >
                                      {isItemUnlocked(itemKey) ? '🔓 अनलॉक' : '🔒 लॉक'}
                                    </button>
                                    <button
                                      onClick={() => handleRemoveDishFromSchedule('day_schedule', selectedManageDay, 'dinner', dish.dishId)}
                                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-bold rounded-lg cursor-pointer"
                                    >
                                      🗑️ हटाएं
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 1: MASTER RATE CARD (Full Control)
            ========================================================================= */}
        {activeSubTab === 'rate_card' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={rateSearch}
                    onChange={(e) => setRateSearch(e.target.value)}
                    placeholder="डिश का नाम या ID खोजें (जैसे: चाय, दाल, पनीर, aloo)..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>

                <select
                  value={rateCategory}
                  onChange={(e) => setRateCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">सभी श्रेणियां (All Categories)</option>
                  <option value="monday">सोमवार का मेनू</option>
                  <option value="tuesday">मंगलवार का मेनू</option>
                  <option value="wednesday">बुधवार का मेनू</option>
                  <option value="thursday">गुरुवार का मेनू</option>
                  <option value="friday">शुक्रवार का मेनू</option>
                  <option value="saturday">शनिवार का मेनू</option>
                  <option value="sunday">रविवार का मेनू</option>
                  <option value="special_thali">विशेष थाली</option>
                  <option value="breakfast_snacks">नाश्ता व स्नैक्स (चाय/समोसा आदि)</option>
                  <option value="vrat_special">व्रत स्पेशल</option>
                  <option value="breads_desserts">ब्रेड्स, चावल व मीठा</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToMasterRateCard}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="3-पेज अधिकृत मेनू और सभी पराठा/नाश्ता चाय कॉम्बो को सिंक करें"
                >
                  <span>🔄</span>
                  <span>अधिकृत मेनू व कॉम्बो सिंक करें</span>
                </button>
                <button
                  onClick={() => setShowAddDishModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>➕ नई डिश जोड़ें</span>
                </button>
                <button
                  onClick={() => setShowBulkImportModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📁 बल्क फ़ाइल व डेटा अपलोड (Excel/PDF)</span>
                </button>
              </div>
            </div>

            {/* Rate Card Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">डिश का नाम</th>
                      <th className="py-3 px-3">श्रेणी (Category)</th>
                      <th className="py-3 px-3">पोर्शन व रेट्स (Listing vs Vendor Payout)</th>
                      <th className="py-3 px-3 text-center">स्टॉक स्टेटस</th>
                      <th className="py-3 px-4 text-right">कार्रवाई (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRateCard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          कोई डिश नहीं मिली। आप ऊपर दिए बटन से नई डिश जोड़ सकते हैं।
                        </td>
                      </tr>
                    ) : (
                      filteredRateCard.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900 text-sm">
                              {item.hindiName || item.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.name} • <span className="text-slate-400">ID: {item.id}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {item.categoryLabel || item.category}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {item.portions.map((p, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center gap-1.5"
                                >
                                  <span className="font-bold text-slate-700">{p.size}:</span>
                                  <span className="text-slate-400 line-through text-[10px]">₹{p.listingPrice}</span>
                                  <span className="font-extrabold text-emerald-700">₹{p.vendorPayoutRate}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleStock(item.id, item.inStock)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                item.inStock
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                              }`}
                            >
                              {item.inStock ? '🟢 उपलब्ध (In Stock)' : '🔴 समाप्त (Out)'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleLockItem(item.id, item.hindiName || item.name, 'Master Rate Card Entry')}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                  isItemUnlocked(item.id)
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-300'
                                }`}
                                title={isItemUnlocked(item.id) ? 'अनलॉक है (सुरक्षा लॉक लगाने के लिए क्लिक करें)' : 'सुरक्षित (लॉक है - हटाने से पहले अनलॉक करें)'}
                              >
                                {isItemUnlocked(item.id) ? '🔓 अनलॉक' : '🔒 लॉक'}
                              </button>
                              <button
                                onClick={() => setEditingDish(item)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-300 cursor-pointer"
                                title="रेट और नाम एडिट करें"
                              >
                                ✏️ एडिट
                              </button>
                              <button
                                onClick={() => handleDeleteDish(item.id, item.hindiName || item.name)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-bold border border-red-200 cursor-pointer"
                                title="रेट कार्ड से हटाएं"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ORDER & DISH APPROVALS QUEUE
            ========================================================================= */}
        {activeSubTab === 'dish_approvals' && (
          <div className="space-y-6">
            
            {/* 1. ORDER APPROVALS & WALLET CREDIT SECTION */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📦</span>
                    <span>वेंडर आर्डर अप्रूवल व वॉलेट क्रेडिट (Pending Order Verifications)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    जब वेंडर 3P आर्डर (Zomato/Swiggy) पंच करता है, आपके द्वारा यहाँ 1-क्लिक सत्यापन/अप्रूवल के बाद ही पेआउट राशि वेंडर के वॉलेट में क्रेडिट होगी।
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  लंबित आर्डर्स: {pendingOrdersToVerify.length}
                </span>
              </div>

              {pendingOrdersToVerify.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                  <span className="text-2xl block mb-1">✅</span>
                  <p className="text-xs font-bold text-slate-600">सभी वेंडर आर्डर्स सत्यापित हैं</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">नया ऑर्डर पंच होने पर वह यहाँ सत्यापन और वॉलेट क्रेडिट हेतु प्रदर्शित होगा।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrdersToVerify.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border bg-white border-amber-300 ring-1 ring-amber-200 shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 text-white">
                                {ord.source}
                              </span>
                              <span className="font-extrabold text-slate-900 text-sm">
                                #{ord.orderNumber}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                              {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">वेंडर पेआउट</span>
                            <span className="text-lg font-black text-emerald-800">
                              ₹{ord.totalVendorPayout}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-700 block mb-1">डिशेज़ व मात्रा:</span>
                          <p className="font-semibold text-slate-900">{ord.itemName}</p>
                          {ord.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-1">नोट्स: {ord.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyOrder(ord.id, 'APPROVE')}
                          className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>✅ सत्यापित करें व ₹{ord.totalVendorPayout} क्रेडिट करें</span>
                        </button>
                        <button
                          onClick={() => handleVerifyOrder(ord.id, 'REJECT')}
                          className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          अस्वीकृत
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. CUSTOM DISH APPROVALS SECTION */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>वेंडर द्वारा प्रस्तुत नई डिश आवेदन (Custom Dishes Waiting Approval)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    वेंडर पोर्टल से सबमिट की गई नई डिशेस को 1-क्लिक में अप्रूव करें ताकि वे तुरंत मास्टर रेट कार्ड में शामिल हो जाएं।
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  कुल आवेदन: {pendingDishesToApprove.length}
                </span>
              </div>

              {pendingDishesToApprove.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                  <span className="text-2xl block mb-1">🎉</span>
                  <p className="text-xs font-bold text-slate-600">कोई लंबित डिश आवेदन नहीं है</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">जब वेंडर नई डिश सबमिट करेगा, वह तुरंत यहाँ समीक्षा हेतु प्रदर्शित होगी।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingDishesToApprove.map((dish) => (
                    <div
                      key={dish.id}
                      className={`p-5 rounded-2xl border bg-white shadow-sm space-y-3 flex flex-col justify-between ${
                        dish.status === 'PENDING'
                          ? 'border-amber-300 ring-1 ring-amber-200'
                          : dish.status === 'APPROVED'
                          ? 'border-emerald-200'
                          : 'border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {dish.categoryLabel || dish.category}
                            </span>
                            <h4 className="text-base font-black text-slate-900 mt-1">
                              {dish.hindiName} ({dish.name})
                            </h4>
                            <span className="text-[11px] text-slate-400 block font-mono">ID: {dish.id}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            dish.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : dish.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {dish.status === 'PENDING' ? '⏳ पेंडिंग' : dish.status === 'APPROVED' ? '✅ स्वीकृत' : '❌ अस्वीकृत'}
                          </span>
                        </div>

                        <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90 space-y-2 text-xs">
                          <div className="flex items-center justify-between font-extrabold text-amber-950 text-[11px] uppercase">
                            <span>ओनर रेट संशोधन (घटाएं / बढ़ाएं):</span>
                            <span className="text-[10px] text-amber-800 font-bold">✏️ देवी द्वारा संपादन</span>
                          </div>
                          <div className="space-y-1.5">
                            {getDishPortions(dish).map((p: any, idx: number) => (
                              <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 items-center text-[11px]">
                                <div>
                                  <span className="font-extrabold text-slate-800 block truncate">{p.size}</span>
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-400 block font-bold">लिस्टिंग मूल्य (₹)</label>
                                  <input
                                    type="number"
                                    value={p.listingPrice}
                                    onChange={(e) => handleUpdateCustomDishPortion(dish.id, idx, 'listingPrice', Number(e.target.value))}
                                    className="w-full px-2 py-1 border border-slate-300 rounded font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-400 block font-bold">वेंडर पेआउट (₹)</label>
                                  <input
                                    type="number"
                                    value={p.vendorPayoutRate}
                                    onChange={(e) => handleUpdateCustomDishPortion(dish.id, idx, 'vendorPayoutRate', Number(e.target.value))}
                                    className="w-full px-2 py-1 border border-emerald-300 rounded font-black text-emerald-700 focus:ring-1 focus:ring-emerald-500 text-xs"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {dish.notes && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                            नोट्स: {dish.notes}
                          </p>
                        )}
                      </div>

                      {dish.status === 'PENDING' && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleReviewDish(dish.id, 'APPROVE', getDishPortions(dish))}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>✅ संशोधित रेट से स्वीकृत करें (Approve)</span>
                          </button>
                          <button
                            onClick={() => handleReviewDish(dish.id, 'REJECT')}
                            className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            अस्वीकृत
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LIVE VENDOR ORDERS MONITOR
            ========================================================================= */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="ऑर्डर # या डिश खोजें..."
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none flex-1"
                />

                <select
                  value={orderSourceFilter}
                  onChange={(e) => setOrderSourceFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="all">सभी प्लेटफॉर्म (All Sources)</option>
                  <option value="zomato">Zomato</option>
                  <option value="swiggy">Swiggy</option>
                  <option value="magicpin">Magicpin</option>
                  <option value="direct">Direct</option>
                  <option value="tiffin_website">Tiffin Website</option>
                </select>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="all">सभी स्थितियां (All Statuses)</option>
                  <option value="received">प्राप्त (Received)</option>
                  <option value="preparing">तैयार हो रहा (Preparing)</option>
                  <option value="ready">तैयार (Ready)</option>
                  <option value="dispatched">डिस्पैच (Dispatched)</option>
                  <option value="delivered">डिलीवर (Delivered)</option>
                  <option value="cancelled">रद्द (Cancelled)</option>
                </select>
              </div>

              <span className="text-xs font-bold text-slate-600 text-right">
                कुल प्रदर्शित ऑर्डर्स: {filteredOrders.length}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                      <th className="py-3.5 px-4">ऑर्डर विवरण</th>
                      <th className="py-3.5 px-3">प्लेटफॉर्म</th>
                      <th className="py-3.5 px-3">डिश व मात्रा</th>
                      <th className="py-3.5 px-3 text-right">वेंडर पेआउट</th>
                      <th className="py-3.5 px-3 text-center">मालिक सत्यापन (Verification)</th>
                      <th className="py-3.5 px-3 text-center">ऑर्डर स्थिति</th>
                      <th className="py-3.5 px-4 text-right">स्थिति बदलें</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          कोई ऑर्डर नहीं मिला।
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 text-xs">
                              #{ord.orderNumber}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-slate-900 text-white">
                              {ord.source}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-800 text-xs">{ord.itemName}</div>
                            {ord.notes && <div className="text-[10px] text-slate-400 italic">नोट्स: {ord.notes}</div>}
                          </td>

                          <td className="py-3.5 px-3 text-right font-black text-emerald-800 text-sm">
                            ₹{ord.totalVendorPayout}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {ord.payoutCreditedToWallet || ord.verificationStatus === 'APPROVED' ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-black text-[10px] rounded-full border border-emerald-300">
                                ✓ क्रेडिटेड & सत्यापित
                              </span>
                            ) : ord.verificationStatus === 'REJECTED' ? (
                              <span className="px-2.5 py-1 bg-red-100 text-red-900 font-black text-[10px] rounded-full border border-red-300">
                                ✕ अस्वीकृत
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyOrder(ord.id, 'APPROVE')}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg shadow-sm transition cursor-pointer"
                              >
                                ⚡ सत्यापित करें
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              ord.status === 'dispatched' ? 'bg-indigo-100 text-indigo-800' :
                              ord.status === 'ready' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-bold bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="received">Received</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: MONDAY PAYOUTS & WALLET LEDGER
            ========================================================================= */}
        {activeSubTab === 'payouts' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-700 tracking-wider">
                  साप्ताहिक शुक्रवार-गुरुवार चक्र (1 हफ्ते का रोलिंग लैग)
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  मंगलवार पेआउट सेटलमेंट डेस्क (Tuesday Payout Disbursal)
                </h3>
                <p className="text-xs text-slate-500 max-w-xl">
                  वेंडर के खाते में शुद्ध देय राशि ट्रांसफर करें और बैंक / UPI UTR दर्ज करें। यह राशि सीधे वेंडर वॉलेट से डेबिट हो जाएगी।
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-bold">मंगलवार देय राशि</span>
                  <span className="text-3xl font-black text-emerald-800">
                    ₹{eligibleMondayPayout.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setPayoutAmount(eligibleMondayPayout);
                    setShowPayoutModal(true);
                  }}
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black shadow-lg transition cursor-pointer"
                >
                  💸 पेआउट ट्रांसफर दर्ज करें
                </button>
              </div>
            </div>

            {/* 🛡️ SECURITY RESERVE SYSTEM STATUS BREAKDOWN CARD (3 BOXES + PROGRESS BAR FOR OWNER) */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-amber-500/50 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h3 className="text-sm font-black text-amber-400">सुरक्षा रिज़र्व बैलेंस ओवरव्यू (मालिक दृश्य - Devi Control Desk)</h3>
                    <p className="text-[11px] text-slate-300">
                      वेंडर का कुल वॉलेट बैलेंस ₹{(wallet.currentBalance ?? 0).toLocaleString('en-IN')} है। ₹2,000 रिज़र्व लक्ष्य पूरा होने पर ही अतिरिक्त पेआउट देय बनता है।
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center border ${
                  Math.min(wallet.currentBalance ?? 0, 2000) >= 2000 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                }`}>
                  {Math.min(wallet.currentBalance ?? 0, 2000) >= 2000 ? '✅ रिज़र्व 100% पूर्ण' : '⏳ रिज़र्व जमा प्रगति पर'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>वेंडर रिज़र्व जमा प्रगति:</span>
                  <span className="text-amber-400 font-mono">
                    ₹{Math.min(wallet.currentBalance ?? 0, 2000).toLocaleString('en-IN')} / ₹2,000 ({Math.round((Math.min(wallet.currentBalance ?? 0, 2000) / 2000) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, Math.round((Math.min(wallet.currentBalance ?? 0, 2000) / 2000) * 100))}%` }}
                  ></div>
                </div>
              </div>

              {/* 3 Box Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-800/90 p-4 rounded-xl border border-amber-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-amber-300 block tracking-wider">🔒 वर्तमान जमा रिज़र्व</span>
                  <span className="text-2xl font-black text-amber-400 block font-mono">
                    ₹{Math.min(wallet.currentBalance ?? 0, 2000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">सुरक्षित रिज़र्व डिपॉजिट</span>
                </div>

                <div className="bg-slate-800/90 p-4 rounded-xl border border-rose-500/30 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-rose-300 block tracking-wider">⏳ रिज़र्व पूरा होने हेतु शेष</span>
                  <span className="text-2xl font-black text-rose-400 block font-mono">
                    ₹{Math.max(0, 2000 - (wallet.currentBalance ?? 0)).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {Math.max(0, 2000 - (wallet.currentBalance ?? 0)) > 0 ? 'पेआउट के लिए जमा शेष राशि' : 'कोई शेष नहीं (रिज़र्व 100% पूरा)'}
                  </span>
                </div>

                <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-300 block tracking-wider">💰 मंगलवार पेआउट देय राशि</span>
                  <span className="text-2xl font-black text-emerald-400 block font-mono">
                    ₹{Math.max(0, (wallet.currentBalance ?? 0) - 2000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-200 block">
                    {Math.max(0, (wallet.currentBalance ?? 0) - 2000) > 0 ? 'मंगलवार को हस्तांतरणीय राशि' : 'रिज़र्व पूरा होने पर अनलॉक होगी'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Vendor Payout Requests Section */}
            {payoutRequests && payoutRequests.filter((r: any) => r.status === 'PENDING').length > 0 && (
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                    <span>💸</span>
                    <span>लंबित वेंडर पेआउट रिक्वेस्ट्स (Pending Payout Requests - No Limit)</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-400">
                    {payoutRequests.filter((r: any) => r.status === 'PENDING').length} रिक्वेस्ट पेंडिंग
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {payoutRequests.filter((r: any) => r.status === 'PENDING').map((req: any) => (
                    <div key={req.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-800 text-base">₹{req.amount}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(req.requestedAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="text-slate-700">
                        <strong>UPI:</strong> <span className="font-mono text-slate-900">{req.upiId}</span>
                      </div>
                      {req.notes && <div className="text-slate-500 italic">नोट: {req.notes}</div>}
                      <button
                        onClick={() => {
                          setPayoutAmount(req.amount);
                          setActivePayoutRequestId(req.id);
                          setShowPayoutModal(true);
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-sm cursor-pointer"
                      >
                        ⚡ ₹{req.amount} का पेआउट रिलीज करें व UTR भरें
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet Transactions Ledger Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900">
                  वॉलेट खाता बही (Authoritative Ledger History)
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  कुल प्रविष्टियां: {transactions.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4">तारीख</th>
                      <th className="py-3 px-3">प्रकार (Type)</th>
                      <th className="py-3 px-4">विवरण व रेफरेंस (UTR / Order)</th>
                      <th className="py-3 px-3 text-right">राशि (Amount)</th>
                      <th className="py-3 px-4 text-right">बैलेंस (Balance After)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          अभी तक कोई ट्रांजैक्शन दर्ज नहीं हुआ है। जब ऑर्डर डिलीवर होगा या पेआउट भेजा जाएगा, यहाँ स्वतः जुड़ जाएगा।
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {txn.date}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              txn.type === 'payout_disbursed'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : txn.type === 'order_credit'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-bold">{txn.description}</div>
                            {txn.utrNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                UTR: {txn.utrNumber}
                              </div>
                            )}
                          </td>
                          <td className={`py-3 px-3 text-right font-black ${
                            txn.type === 'payout_disbursed' || txn.type === 'refund_deduction'
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }`}>
                            {txn.type === 'payout_disbursed' || txn.type === 'refund_deduction' ? '-' : '+'}₹{txn.amount}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            ₹{txn.balanceAfter}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CUSTOMER REFUND & PENALTY DEDUCTIONS
            ========================================================================= */}
        {activeSubTab === 'refunds' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  कस्टमर रिफंड, कैंसलेशन व पेनल्टी कटौती प्रबंधन
                </h3>
                <p className="text-xs text-slate-500">
                  यदि कस्टमर की शिकायत पर रिफंड दिया गया है या गुणवत्ता में कमी आई है, तो वेंडर के हिस्से की कटौती यहाँ दर्ज करें।
                </p>
              </div>
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>➕ नई कटौती दर्ज करें</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4">कटौती ID / तारीख</th>
                      <th className="py-3 px-3">ऑर्डर संदर्भ #</th>
                      <th className="py-3 px-4">कारण (Reason)</th>
                      <th className="py-3 px-3 text-right">कस्टमर रिफंड</th>
                      <th className="py-3 px-4 text-right">वेंडर से काटी गई राशि</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {refundDeductions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          कोई कटौती नहीं की गई है।
                        </td>
                      </tr>
                    ) : (
                      refundDeductions.map((ded) => (
                        <tr key={ded.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            <div>{ded.id}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(ded.timestamp).toLocaleDateString('en-IN')}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {ded.orderId}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {ded.reason}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-500">
                            ₹{ded.customerRefundAmount}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-red-700 text-sm">
                            -₹{ded.vendorCutDeducted}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: KITCHEN INVENTORY & PACKAGING
            ========================================================================= */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  किचन कच्चा माल व पैकेजिंग इन्वेंट्री ट्रैकर
                </h3>
                <p className="text-xs text-slate-500">
                  आटा, चावल, देसी घी, मसाले व 3-कंपार्टमेंट मील बॉक्सेस का रीयल-टाइम स्टॉक।
                </p>
              </div>
              <button
                onClick={() => setShowAddInventoryModal(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>➕ नया आइटम जोड़ें</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {inventory.map((inv) => (
                <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {inv.hindiName || inv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-mono">{inv.name}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      inv.status === 'sufficient' ? 'bg-emerald-100 text-emerald-800' :
                      inv.status === 'low' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-3xl font-black text-slate-900">
                      {inv.currentStock}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{inv.unit}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleQuickStockAdjust(inv.id, -1)}
                      className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(inv.id, +5)}
                      className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickStockAdjust(inv.id, +25)}
                      className="flex-1 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      +25
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: VENDOR INCENTIVE & PERFORMANCE BONUS MANAGEMENT (OWNER CONTROL)
            ========================================================================= */}
        {activeSubTab === 'incentives' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-[11px] font-bold text-amber-800 uppercase block mb-1">
                  इस हफ़्ते डिलीवर कुल मील
                </span>
                <div className="text-3xl font-black text-amber-900 flex items-baseline gap-1">
                  <span>{incentiveStats.deliveredMealsThisCycle || 0}</span>
                  <span className="text-xs font-semibold text-amber-700">टिफिन</span>
                </div>
                <span className="text-[10px] text-amber-700 mt-1 block">
                  चक्र: {incentiveStats.cycleStart || 'शुक्रवार'} से {incentiveStats.cycleEnd || 'गुरुवार'}
                </span>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                  वर्तमान माइलस्टोन स्तर
                </span>
                <div className="text-xl font-black text-emerald-900 flex items-center gap-1.5 mt-1">
                  <span>{incentiveStats.currentMilestoneTier?.badge || '🌱'}</span>
                  <span>{incentiveStats.currentMilestoneTier?.title || 'शुरुआती स्तर (In Progress)'}</span>
                </div>
                <span className="text-[10px] text-emerald-700 mt-1 block">
                  {incentiveStats.currentMilestoneTier 
                    ? `बोनस राशि: ₹${incentiveStats.currentMilestoneTier.bonusAmount}` 
                    : 'पहला लक्ष्य: 25 टिफिन (₹150 बोनस)'}
                </span>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-200 shadow-sm">
                <span className="text-[11px] font-bold text-indigo-800 uppercase block mb-1">
                  अगला अनलॉक लक्ष्य
                </span>
                <div className="text-2xl font-black text-indigo-900 flex items-baseline gap-1">
                  <span>{incentiveStats.mealsNeededForNextTier || 0}</span>
                  <span className="text-xs font-semibold text-indigo-700">टिफिन शेष</span>
                </div>
                <span className="text-[10px] text-indigo-600 mt-1 block">
                  {incentiveStats.nextMilestoneTier 
                    ? `अगला: ${incentiveStats.nextMilestoneTier.title} (₹${incentiveStats.nextMilestoneTier.bonusAmount} बोनस)`
                    : 'सभी उच्च स्तर प्राप्त! 🌟'}
                </span>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-5 rounded-2xl border border-purple-200 shadow-sm">
                <span className="text-[11px] font-bold text-purple-800 uppercase block mb-1">
                  इस हफ़्ते कुल वितरित इंसेंटिव
                </span>
                <div className="text-3xl font-black text-purple-900">
                  ₹{(incentiveStats.totalIncentiveEarnedThisCycle || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-purple-700 mt-1 block">
                  लाइफटाइम बोनस: ₹{(incentiveStats.totalLifetimeIncentives || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Two-Column Operation Hub: Spot Bonus + Milestone Trigger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box 1: 1-Click Spot Incentive Grant */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        1-क्लिक स्पॉट इंसेंटिव / त्वरित बोनस
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        वेंडर के उत्कृष्ट कार्य पर तुरंत वॉलेट में अतिरिक्त इंसेंटिव क्रेडिट करें
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-black text-[10px] rounded-full uppercase tracking-wider">
                    Instant Credit
                  </span>
                </div>

                <form onSubmit={handleGrantSpotIncentive} className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">वेंडर चुनें (Vendor ID):</label>
                    <select
                      value={spotVendorId}
                      onChange={(e) => setSpotVendorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900"
                    >
                      <option value="NIR8800">NIR8800 - NIR Cloud Kitchen Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">त्वरित राशि चुनें (Quick Presets):</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[150, 350, 500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSpotAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            spotAmount === amt
                              ? 'bg-amber-600 text-white shadow-md scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">इंसेंटिव राशि दर्ज करें (₹ Amount):</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={spotAmount}
                      onChange={(e) => setSpotAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="राशि दर्ज करें (उदा: 250)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-amber-950 text-lg font-black"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">बोनस का कारण / टैग (Quick Reason Tags):</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        '🌟 उत्कृष्ट भोजन व समय पर डिस्पैच',
                        '🚀 वीकेंड रश डिलीवरी रिवॉर्ड',
                        '🪔 फेस्टिवल / स्पेशल ओनर बोनस',
                        '💯 100% ऑन-टाइम व ज़ीरो शिकायत अवॉर्ड'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSpotReason(tag)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                            spotReason === tag
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      required
                      value={spotReason}
                      onChange={(e) => setSpotReason(e.target.value)}
                      placeholder="उदा. समय पर डिलीवरी व स्वाद की प्रशंसा"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                    />
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-medium flex items-center gap-2">
                    <span>💡</span>
                    <span>यह राशि वेंडर के वॉलेट बैलेंस में तुरंत जुड़ेगी और सोमवार पेआउट में स्वतः शामिल होगी।</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingIncentives}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>🎯</span>
                    <span>{isProcessingIncentives ? 'क्रेडिट हो रहा है...' : `₹${spotAmount} इंसेंटिव वॉलेट में क्रेडिट करें`}</span>
                  </button>
                </form>
              </div>

              {/* Box 2: Automated Weekly Milestone Rules & Engine */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          साप्ताहिक माइलस्टोन रूल्स इंजन
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          टिफिन डिलीवरी वॉल्यूम के आधार पर तय स्वचालित इंसेंटिव स्लैब्स
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={openEditIncentiveConfigModal}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>⚙️ रूल्स एडिट करें</span>
                      </button>
                      <span className={`px-2.5 py-1 font-black text-[10px] rounded-full uppercase tracking-wider ${
                        incentiveConfig.enabled !== false ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                      }`}>
                        {incentiveConfig.enabled !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {(incentiveConfig.tiers || [
                      { id: 'tier_bronze', milestoneMeals: 25, bonusAmount: 150, title: 'ब्राउन स्टार बोनस', badge: '🥉', description: '25 टिफिन डिलीवरी पर ₹150 बोनस' },
                      { id: 'tier_silver', milestoneMeals: 50, bonusAmount: 350, title: 'सिल्वर स्टार बोनस', badge: '🥈', description: '50 टिफिन डिलीवरी पर ₹350 बोनस' },
                      { id: 'tier_gold', milestoneMeals: 100, bonusAmount: 800, title: 'गोल्ड स्टार बोनस', badge: '🥇', description: '100 टिफिन डिलीवरी पर ₹800 बोनस' },
                      { id: 'tier_platinum', milestoneMeals: 200, bonusAmount: 1800, title: 'प्लैटिनम स्टार बोनस', badge: '💎', description: '200+ टिफिन डिलीवरी पर ₹1800 बोनस' }
                    ]).map((tier: any) => {
                      const isUnlocked = (incentiveStats.deliveredMealsThisCycle || 0) >= tier.milestoneMeals;
                      return (
                        <div
                          key={tier.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            isUnlocked
                              ? 'bg-emerald-50/80 border-emerald-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{tier.badge}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-xs">{tier.title}</h4>
                                {isUnlocked && (
                                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[9px] font-black rounded-md">
                                    अनलॉक ✓
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium block">
                                {tier.description}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-700 block">
                              +₹{tier.bonusAmount}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {tier.milestoneMeals} टिफिन लक्ष्य
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* On-Time and Zero Complaint Bonus Info */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-700 block uppercase">समय पर तैयारी बोनस</span>
                      <span className="text-base font-black text-indigo-950">+₹{incentiveConfig.onTimeBonusPerMeal || 5} / मील</span>
                      <span className="text-[10px] text-indigo-600 block">100% ऑन-टाइम डिस्पैच पर</span>
                    </div>
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                      <span className="text-[10px] font-bold text-teal-700 block uppercase">ज़ीरो कंप्लेंट अवॉर्ड</span>
                      <span className="text-base font-black text-teal-950">+₹{incentiveConfig.zeroComplaintWeeklyBonus || 250} / सप्ताह</span>
                      <span className="text-[10px] text-teal-600 block">शून्य ग्राहक शिकायत रहने पर</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleProcessWeeklyMilestones}
                    disabled={isProcessingIncentives}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>🚀</span>
                    <span>
                      {isProcessingIncentives 
                        ? 'माइलस्टोन प्रोसेस हो रहे हैं...' 
                        : 'हफ़्ते के माइलस्टोन चेक करें व योग्य बोनस वॉलेट में भेजें'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Distributed Incentive Ledger History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📜</span>
                  <h3 className="text-base font-black text-slate-900">
                    इंसेंटिव व बोनस वितरण लेजर ({incentiveHistory.length})
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  {incentiveHistory.length > 0 && (
                    <button
                      onClick={handleClearIncentiveHistory}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg border border-red-200 transition cursor-pointer"
                    >
                      🗑️ हिस्ट्री रिसेट करें
                    </button>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    पारदर्शी ऑडिट रिकॉर्ड
                  </span>
                </div>
              </div>

              {incentiveHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  <span>🎯 अभी तक कोई इंसेंटिव दर्ज नहीं हुआ है। ऊपर दिए गए फॉर्म से 1-क्लिक स्पॉट बोनस भेजें।</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black">
                      <tr>
                        <th className="px-4 py-3">तारीख व समय</th>
                        <th className="px-4 py-3">वेंडर ID</th>
                        <th className="px-4 py-3">इंसेंटिव प्रकार</th>
                        <th className="px-4 py-3">विवरण / कारण</th>
                        <th className="px-4 py-3">स्वीकृतकर्ता</th>
                        <th className="px-4 py-3 text-right">क्रेडिट राशि</th>
                        <th className="px-4 py-3 text-center">कार्रवाई</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {incentiveHistory.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {inc.grantedAt ? new Date(inc.grantedAt).toLocaleString('hi-IN') : 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-700">
                            {inc.vendorId || 'NIR8800'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              inc.type === 'spot_bonus'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {inc.type === 'spot_bonus' ? '⚡ 1-क्लिक स्पॉट बोनस' : '🏆 माइलस्टोन रिवॉर्ड'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-bold">
                            {inc.reason}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {inc.grantedBy || 'Owner Operations Desk'}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                            +₹{inc.amount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleToggleLockItem(inc.id, `इंसेंटिव ₹${inc.amount} (${inc.reason})`, 'Granted Spot Incentive Record')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                  isItemUnlocked(inc.id)
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-300'
                                }`}
                                title={isItemUnlocked(inc.id) ? 'अनलॉक है (सुरक्षा लॉक लगाने के लिए क्लिक करें)' : 'सुरक्षित (लॉक है - हटाने से पहले अनलॉक करें)'}
                              >
                                {isItemUnlocked(inc.id) ? '🔓 अनलॉक' : '🔒 लॉक'}
                              </button>
                              <button
                                onClick={() => handleDeleteGrantedIncentive(inc.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 font-bold text-[10px] transition cursor-pointer"
                                title="इंसेंटिव रिकॉर्ड हटाएं और वॉलेट राशि रिवर्स करें"
                              >
                                🗑️ हटाएं
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL 1: ADD NEW DISH DIRECTLY TO MASTER RATE CARD
          ========================================================================= */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>➕</span>
                <span>मास्टर रेट कार्ड में नई डिश जोड़ें</span>
              </h3>
              <button
                onClick={() => setShowAddDishModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">डिश का नाम (English Name)</label>
                  <input
                    type="text"
                    value={newDishName}
                    onChange={(e) => setNewDishName(e.target.value)}
                    placeholder="e.g. Masala Chai / Special Tea"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">हिंदी नाम (Hindi Name)</label>
                  <input
                    type="text"
                    value={newDishHindiName}
                    onChange={(e) => setNewDishHindiName(e.target.value)}
                    placeholder="e.g. मसाला चाय"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">श्रेणी (Category)</label>
                <select
                  value={newDishCategory}
                  onChange={(e) => {
                    setNewDishCategory(e.target.value);
                    const map: Record<string, string> = {
                      breakfast_snacks: 'नाश्ता व स्नैक्स',
                      special_thali: 'विशेष थाली',
                      monday: 'सोमवार का मेनू',
                      tuesday: 'मंगलवार का मेनू',
                      wednesday: 'बुधवार का मेनू',
                      thursday: 'गुरुवार का मेनू',
                      friday: 'शुक्रवार का मेनू',
                      saturday: 'शनिवार का मेनू',
                      sunday: 'रविवार का मेनू',
                      vrat_special: 'व्रत स्पेशल',
                      breads_desserts: 'ब्रेड्स, चावल व मीठा'
                    };
                    setNewDishCategoryLabel(map[e.target.value] || 'विविध');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="breakfast_snacks">नाश्ता व स्नैक्स (चाय, नाश्ता आदि)</option>
                  <option value="special_thali">विशेष थाली (Deluxe / Executive)</option>
                  <option value="monday">सोमवार का मेनू</option>
                  <option value="tuesday">मंगलवार का मेनू</option>
                  <option value="wednesday">बुधवार का मेनू</option>
                  <option value="thursday">गुरुवार का मेनू</option>
                  <option value="friday">शुक्रवार का मेनू</option>
                  <option value="saturday">शनिवार का मेनू</option>
                  <option value="sunday">रविवार का मेनू</option>
                  <option value="vrat_special">व्रत स्पेशल</option>
                  <option value="breads_desserts">ब्रेड्स, चावल व मीठा</option>
                </select>
              </div>

              {/* Portions & Rates */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800">
                    पोर्शन साइज, ग्राहक मूल्य व वेंडर पेआउट दरें:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDishPortions([
                        ...newDishPortions,
                        { size: 'Half', listingPrice: 149, vendorPayoutRate: 60 }
                      ]);
                    }}
                    className="text-[11px] text-amber-700 hover:underline cursor-pointer"
                  >
                    + अतिरिक्त साइज जोड़ें
                  </button>
                </div>

                {newDishPortions.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="block text-[10px] text-slate-500 mb-0.5">साइज</span>
                      <input
                        type="text"
                        value={p.size}
                        onChange={(e) => {
                          const updated = [...newDishPortions];
                          updated[idx].size = e.target.value;
                          setNewDishPortions(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 mb-0.5">लिस्टिंग रेट (₹)</span>
                      <input
                        type="number"
                        value={p.listingPrice}
                        onChange={(e) => {
                          const updated = [...newDishPortions];
                          updated[idx].listingPrice = Number(e.target.value);
                          setNewDishPortions(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-700 mb-0.5 font-bold">वेंडर पेआउट (₹)</span>
                      <input
                        type="number"
                        value={p.vendorPayoutRate}
                        onChange={(e) => {
                          const updated = [...newDishPortions];
                          updated[idx].vendorPayoutRate = Number(e.target.value);
                          setNewDishPortions(updated);
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-emerald-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-extrabold shadow-md cursor-pointer"
                >
                  डिश सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT EXISTING DISH
          ========================================================================= */}
      {editingDish && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>✏️</span>
                <span>डिश रेट व विवरण एडिट करें</span>
              </h3>
              <button
                onClick={() => setEditingDish(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDishSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">डिश का नाम (English)</label>
                  <input
                    type="text"
                    value={editingDish.name}
                    onChange={(e) => setEditingDish({ ...editingDish, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">हिंदी नाम</label>
                  <input
                    type="text"
                    value={editingDish.hindiName}
                    onChange={(e) => setEditingDish({ ...editingDish, hindiName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">श्रेणी का नाम (Category Label)</label>
                <input
                  type="text"
                  value={editingDish.categoryLabel}
                  onChange={(e) => setEditingDish({ ...editingDish, categoryLabel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              {/* Portions */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <label className="font-extrabold text-slate-800 block">पोर्शन दरें (Portions & Rates):</label>
                {editingDish.portions.map((p, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="block text-[10px] text-slate-500 mb-0.5">साइज</span>
                      <input
                        type="text"
                        value={p.size}
                        onChange={(e) => {
                          const updated = [...editingDish.portions];
                          updated[idx].size = e.target.value;
                          setEditingDish({ ...editingDish, portions: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 mb-0.5">लिस्टिंग रेट (₹)</span>
                      <input
                        type="number"
                        value={p.listingPrice}
                        onChange={(e) => {
                          const updated = [...editingDish.portions];
                          updated[idx].listingPrice = Number(e.target.value);
                          setEditingDish({ ...editingDish, portions: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-emerald-700 mb-0.5 font-bold">वेंडर पेआउट (₹)</span>
                      <input
                        type="number"
                        value={p.vendorPayoutRate}
                        onChange={(e) => {
                          const updated = [...editingDish.portions];
                          updated[idx].vendorPayoutRate = Number(e.target.value);
                          setEditingDish({ ...editingDish, portions: updated });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-xs font-bold text-emerald-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold shadow-md cursor-pointer"
                >
                  अपडेट सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DISBURSE MONDAY PAYOUT
          ========================================================================= */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>💸</span>
                <span>सोमवार पेआउट ट्रांसफर दर्ज करें</span>
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisbursePayoutSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">पेआउट राशि (Payout Amount ₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-extrabold text-lg text-emerald-800"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  उपलब्ध कुल बैलेंस: ₹{grossBalance} • ₹2,000 रिज़र्व के बाद देय: ₹{eligibleMondayPayout}
                </span>
              </div>

              <div>
                <label className="block mb-1">पेमेंट मोड (Payment Mode)</label>
                <select
                  value={payoutMode}
                  onChange={(e) => setPayoutMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="UPI">UPI (9118409672@upi / Google Pay)</option>
                  <option value="NEFT">NEFT / Bank Transfer</option>
                  <option value="IMPS">IMPS Instant Transfer</option>
                  <option value="CASH">कैश (Handover)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">बैंक / UPI रेफरेंस नंबर (UTR Number)</label>
                <input
                  type="text"
                  value={payoutUtr}
                  onChange={(e) => setPayoutUtr(e.target.value)}
                  placeholder="e.g. 529182910291 या UPI/6291829"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono tracking-wider"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">अतिरिक्त नोट्स (Optional Notes)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Friday to Thursday Settlement Cleared"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-extrabold shadow-md cursor-pointer"
                >
                  ट्रांसफर कन्फर्म करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD REFUND DEDUCTION
          ========================================================================= */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>⚠️</span>
                <span>वेंडर पर पेनल्टी / रिफंड कटौती लगाएं</span>
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefundDeductionSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">ऑर्डर नंबर (Order #)</label>
                <input
                  type="text"
                  value={refundOrderId}
                  onChange={(e) => setRefundOrderId(e.target.value)}
                  placeholder="e.g. #ZOM-4921 या GEN-DEDUCT"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">कस्टमर रिफंड राशि (₹)</label>
                  <input
                    type="number"
                    value={refundCustomerAmount}
                    onChange={(e) => setRefundCustomerAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-red-700">वेंडर से कटौती (₹)</label>
                  <input
                    type="number"
                    value={refundVendorCut}
                    onChange={(e) => setRefundVendorCut(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-red-300 font-bold text-red-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">कटौती का कारण (Reason)</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. भोजन खराब पैकिंग / स्पिलेज या देरी"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-extrabold shadow-md cursor-pointer"
                >
                  कटौती लागू करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: ADD INVENTORY ITEM
          ========================================================================= */}
      {showAddInventoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🥫</span>
                <span>नया इन्वेंट्री आइटम जोड़ें</span>
              </h3>
              <button
                onClick={() => setShowAddInventoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInventorySubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">आइटम का नाम (English)</label>
                <input
                  type="text"
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="e.g. Basmati Rice"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">हिंदी नाम (Hindi Name)</label>
                <input
                  type="text"
                  value={invHindiName}
                  onChange={(e) => setInvHindiName(e.target.value)}
                  placeholder="e.g. बासमती चावल"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">श्रेणी (Category)</label>
                  <select
                    value={invCategory}
                    onChange={(e: any) => setInvCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="raw_materials">कच्चा माल (Grain/Atta)</option>
                    <option value="dairy">डेयरी / घी (Dairy)</option>
                    <option value="packaging">पैकेजिंग बॉक्स (Packaging)</option>
                    <option value="spices_oils">मसाले व तेल (Spices/Oil)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">इकाई (Unit)</label>
                  <input
                    type="text"
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="KG / Ltr / Pcs"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">वर्तमान स्टॉक (Stock)</label>
                  <input
                    type="number"
                    value={invStock}
                    onChange={(e) => setInvStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">न्यूनतम थ्रेशोल्ड (Min Alert)</label>
                  <input
                    type="number"
                    value={invMinThreshold}
                    onChange={(e) => setInvMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInventoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold shadow-md cursor-pointer"
                >
                  आइटम जोड़ें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT INCENTIVE SYSTEM RULES & MILESTONE TIERS (DEVI CUSTOMIZATION)
          ========================================================================= */}
      {showEditIncentiveConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-black shrink-0">
                  ⚙️
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    इंसेंटिव सिस्टम रूल्स व स्लैब्स (देवी पैनल कस्टमाइज़ेशन)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    माइलस्टोन लक्ष्य, बोनस राशि, समय पर डिलीवरी बोनस व सिस्टम स्टेटस बदलें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditIncentiveConfigModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIncentiveConfigSubmit} className="space-y-6 text-xs font-bold text-slate-700">
              
              {/* System Enabled Toggle */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-sm font-black text-slate-900 block">
                    इंसेंटिव सिस्टम स्थिति (System Status)
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    चालू (Enabled) रखने पर वेंडर पोर्टल में लाइव माइलस्टोन व इंसेंटिव प्रोग्रेस दिखेगी।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditableIncentiveConfig({
                    ...editableIncentiveConfig,
                    enabled: !editableIncentiveConfig.enabled
                  })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    editableIncentiveConfig.enabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
                  }`}
                >
                  {editableIncentiveConfig.enabled ? '✓ सिस्टम एक्टिव (Enabled)' : '✕ बंद (Disabled)'}
                </button>
              </div>

              {/* Performance Bonus Rules Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-1.5">
                  <label className="block text-indigo-950 font-extrabold text-xs">
                    ⏱️ ऑन-टाइम डिलीवरी बोनस (₹ प्रति मील):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editableIncentiveConfig.onTimeBonusPerMeal ?? 5}
                    onChange={(e) => setEditableIncentiveConfig({
                      ...editableIncentiveConfig,
                      onTimeBonusPerMeal: Number(e.target.value)
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 bg-white text-base font-black text-indigo-950 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-indigo-700 font-medium block">
                    100% समय पर डिलीवरी होने पर वेंडर को अतिरिक्त प्रोत्साहन।
                  </span>
                </div>

                <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1.5">
                  <label className="block text-teal-950 font-extrabold text-xs">
                    ⭐ ज़ीरो कंप्लेंट साप्ताहिक बोनस (₹):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editableIncentiveConfig.zeroComplaintWeeklyBonus ?? 250}
                    onChange={(e) => setEditableIncentiveConfig({
                      ...editableIncentiveConfig,
                      zeroComplaintWeeklyBonus: Number(e.target.value)
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 bg-white text-base font-black text-teal-950 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-teal-700 font-medium block">
                    पूरे सप्ताह में बिना किसी शिकायत या रिफंड के सेवा देने पर।
                  </span>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5">
                  <label className="block text-amber-950 font-extrabold text-xs">
                    🚫 डेली 0 कैंसिलेशन बोनस (₹ प्रति दिन):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editableIncentiveConfig.dailyZeroCancellationBonus ?? 50}
                    onChange={(e) => setEditableIncentiveConfig({
                      ...editableIncentiveConfig,
                      dailyZeroCancellationBonus: Number(e.target.value)
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-base font-black text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-amber-700 font-medium block">
                    दिन में एक भी ऑर्डर रिजेक्ट या कैंसिल न करने पर।
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                  <label className="block text-emerald-950 font-extrabold text-xs">
                    🌐 साप्ताहिक 100% ऑनलाइन बोनस (₹ प्रति सप्ताह):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editableIncentiveConfig.weeklyHundredPercentOnlineBonus ?? 300}
                    onChange={(e) => setEditableIncentiveConfig({
                      ...editableIncentiveConfig,
                      weeklyHundredPercentOnlineBonus: Number(e.target.value)
                    })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-white text-base font-black text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    सप्ताह भर 100% समय किचन ऑनलाइन व उपलब्ध रखने पर।
                  </span>
                </div>
              </div>

              {/* Tiers List Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>🏆</span>
                      <span>साप्ताहिक माइलस्टोन स्लैब्स (Milestone Tiers)</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      वेंडर द्वारा निश्चित टिफिन मील टारगेट पूरा करने पर ऑटो-बोनस
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentTiers = editableIncentiveConfig.tiers || [];
                      const newTier = {
                        id: `tier_custom_${Date.now()}`,
                        milestoneMeals: 150,
                        bonusAmount: 1200,
                        title: 'सुपर स्टार बोनस',
                        badge: '⭐',
                        description: '150 टिफिन डिलीवरी पर ₹1200 बोनस'
                      };
                      setEditableIncentiveConfig({
                        ...editableIncentiveConfig,
                        tiers: [...currentTiers, newTier]
                      });
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>➕ नया स्लैब जोड़ें</span>
                  </button>
                </div>

                {/* Scrollable list of Tiers */}
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {(editableIncentiveConfig.tiers || []).map((tier: any, idx: number) => (
                    <div key={tier.id || idx} className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 shadow-2xs hover:border-amber-300 transition-all">
                      
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[11px]">
                            स्लैब #{idx + 1}
                          </span>
                          <span>{tier.title || 'माइलस्टोन स्लैब'}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...(editableIncentiveConfig.tiers || [])];
                            updated.splice(idx, 1);
                            setEditableIncentiveConfig({
                              ...editableIncentiveConfig,
                              tiers: updated
                            });
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 cursor-pointer transition-colors"
                        >
                          🗑️ यह स्लैब हटाएं
                        </button>
                      </div>

                      {/* Responsive Grid for Tier Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] text-slate-600 mb-1 font-bold">टाइटल (Title)</label>
                          <input
                            type="text"
                            value={tier.title || ''}
                            onChange={(e) => {
                              const updated = [...editableIncentiveConfig.tiers];
                              updated[idx].title = e.target.value;
                              setEditableIncentiveConfig({ ...editableIncentiveConfig, tiers: updated });
                            }}
                            placeholder="उदा. गोल्ड स्टार बोनस"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-600 mb-1 font-bold">इमोजी बैज</label>
                          <input
                            type="text"
                            value={tier.badge || '🥇'}
                            onChange={(e) => {
                              const updated = [...editableIncentiveConfig.tiers];
                              updated[idx].badge = e.target.value;
                              setEditableIncentiveConfig({ ...editableIncentiveConfig, tiers: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black text-center text-slate-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] text-slate-600 mb-1 font-bold">टारगेट टिफिन (Meals)</label>
                          <input
                            type="number"
                            min={1}
                            value={tier.milestoneMeals || 25}
                            onChange={(e) => {
                              const updated = [...editableIncentiveConfig.tiers];
                              updated[idx].milestoneMeals = Number(e.target.value);
                              setEditableIncentiveConfig({ ...editableIncentiveConfig, tiers: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[11px] text-emerald-800 font-extrabold mb-1">बोनस राशि (₹)</label>
                          <input
                            type="number"
                            min={0}
                            value={tier.bonusAmount || 150}
                            onChange={(e) => {
                              const updated = [...editableIncentiveConfig.tiers];
                              updated[idx].bonusAmount = Number(e.target.value);
                              setEditableIncentiveConfig({ ...editableIncentiveConfig, tiers: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-xs font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="sm:col-span-12">
                          <label className="block text-[11px] text-slate-600 mb-1 font-bold">विवरण (Description)</label>
                          <input
                            type="text"
                            value={tier.description || ''}
                            onChange={(e) => {
                              const updated = [...editableIncentiveConfig.tiers];
                              updated[idx].description = e.target.value;
                              setEditableIncentiveConfig({ ...editableIncentiveConfig, tiers: updated });
                            }}
                            placeholder="उदा. 25 टिफिन डिलीवरी पर ₹150 बोनस"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditIncentiveConfigModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
                >
                  रद्द करें
                </button>

                <button
                  type="submit"
                  disabled={isProcessingIncentives}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50 text-xs transition-all active:scale-95"
                >
                  {isProcessingIncentives ? 'सुरक्षित हो रहा है...' : '✓ रूल्स सुरक्षित करें'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: BULK UPDATE CALENDAR OVERRIDE MODAL
          ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl font-black shrink-0">
                  ⚡
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    बल्क डेली फिक्स मेनू अपडेट ({selectedCalDates.length} तारीखें चुनी गईं)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    चुनी हुई तारीखों पर 1-क्लिक टेंप्लेट लागू करें, कस्टम स्पेशल मेनू सेट करें, या ओवरराइड हटाएं
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Selected Dates Summary Badges */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-black text-slate-600 block uppercase">चुनी हुई तारीखें ({selectedCalDates.length}):</span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {selectedCalDates.map((dStr, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-md text-[10px] font-bold font-mono">
                    {dStr}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleBulkUpdateCalendarSubmit} className="space-y-5 text-xs font-bold text-slate-700">
              
              {/* Action Type Tabs */}
              <div className="space-y-2">
                <label className="block text-slate-800 font-black">बल्क एक्शन का प्रकार चुनें:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkAction('apply_template')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      bulkAction === 'apply_template'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm">📋 टेंप्लेट लागू करें</span>
                    <span className="text-[10px] opacity-80 block font-normal">किसी दिन का फ़िक्स पैटर्न लागू करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAction('custom_dishes')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      bulkAction === 'custom_dishes'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm">✨ कस्टम विशेष मेनू</span>
                    <span className="text-[10px] opacity-80 block font-normal">खास सब्जी व चुनिंदा डिशेज़</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAction('clear_override')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      bulkAction === 'clear_override'
                        ? 'bg-red-600 text-white border-red-700 font-black shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-sm">🔄 ओवरराइड हटाएं</span>
                    <span className="text-[10px] opacity-80 block font-normal">साप्ताहिक डिफ़ॉल्ट पर रीसेट करें</span>
                  </button>
                </div>
              </div>

              {/* ACTION 1: APPLY TEMPLATE */}
              {bulkAction === 'apply_template' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                  <label className="block text-amber-950 font-black">किस दिन का डिफ़ॉल्ट शेड्यूल लागू करना चाहती हैं?</label>
                  <select
                    value={bulkTemplateDayId}
                    onChange={(e) => setBulkTemplateDayId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="monday">सोमवार का डिफ़ॉल्ट शेड्यूल (Monday Pattern)</option>
                    <option value="tuesday">मंगलवार का डिफ़ॉल्ट शेड्यूल (Tuesday Pattern)</option>
                    <option value="wednesday">बुधवार का डिफ़ॉल्ट शेड्यूल (Wednesday Pattern)</option>
                    <option value="thursday">गुरुवार का डिफ़ॉल्ट शेड्यूल (Thursday Pattern)</option>
                    <option value="friday">शुक्रवार का डिफ़ॉल्ट शेड्यूल (Friday Pattern)</option>
                    <option value="saturday">शनिवार का डिफ़ॉल्ट शेड्यूल (Saturday Pattern)</option>
                    <option value="sunday">रविवार का डिफ़ॉल्ट शेड्यूल (Sunday Pattern)</option>
                  </select>
                  <p className="text-[11px] text-amber-900 font-medium">
                    💡 चुनी हुई सभी {selectedCalDates.length} तारीखों पर चयनित दिन की स्पेशल सब्जी, चावल, रोटी व लंच/डिनर डिशेज़ की पूरी लिस्ट सेट हो जाएगी।
                  </p>
                </div>
              )}

              {/* ACTION 2: CUSTOM DISHES & HIGHLIGHTS */}
              {bulkAction === 'custom_dishes' && (
                <div className="space-y-4">
                  {/* Special Highlights Inputs */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-3">
                    <span className="text-xs font-black text-amber-950 block uppercase">1. विशेष हाइलाइट्स (Special Highlights):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">खास सब्जी (Special Curry)</label>
                        <input
                          type="text"
                          value={bulkSpecialCurry}
                          onChange={(e) => setBulkSpecialCurry(e.target.value)}
                          placeholder="e.g. शाही पनीर व दाल मखनी"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">खास चावल (Special Rice)</label>
                        <input
                          type="text"
                          value={bulkSpecialRice}
                          onChange={(e) => setBulkSpecialRice(e.target.value)}
                          placeholder="e.g. वेज पुलाव"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">विशेष ब्रेड (Special Bread)</label>
                        <input
                          type="text"
                          value={bulkSpecialBread}
                          onChange={(e) => setBulkSpecialBread(e.target.value)}
                          placeholder="e.g. बटर तवा रोटी"
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lunch Dishes Selection */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-slate-900 block uppercase">2. ☀️ लंच डिशेज़ चुनें ({bulkLunchDishIds.length} चयनित):</span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl bg-white p-2">
                      {rateCard.map((item) => {
                        const isChecked = bulkLunchDishIds.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setBulkLunchDishIds(prev => 
                                  isChecked ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                );
                              }}
                              className="w-3.5 h-3.5 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                            />
                            <span className="text-xs font-bold text-slate-800">{item.hindiName || item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.categoryLabel})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dinner Dishes Selection */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs font-black text-slate-900 block uppercase">3. 🌙 डिनर डिशेज़ चुनें ({bulkDinnerDishIds.length} चयनित):</span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-xl bg-white p-2">
                      {rateCard.map((item) => {
                        const isChecked = bulkDinnerDishIds.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setBulkDinnerDishIds(prev => 
                                  isChecked ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                );
                              }}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-slate-800">{item.hindiName || item.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.categoryLabel})</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION 3: CLEAR OVERRIDE */}
              {bulkAction === 'clear_override' && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2 text-red-950">
                  <span className="text-xs font-black block">⚠️ क्या आप कस्टम ओवरराइड हटाना चाहती हैं?</span>
                  <p className="text-[11px] font-medium leading-relaxed">
                    चुनी हुई सभी {selectedCalDates.length} तारीखों से कस्टम ओवरराइड पूरी तरह हट जाएगा। ये तारीखें फिर से सामान्य डिफ़ॉल्ट साप्ताहिक शेड्यूल (Day-Wise Schedule) के अनुसार स्वतः चलेंगी।
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-indigo-700 hover:from-amber-700 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-md cursor-pointer text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'लागू हो रहा है...' : '🚀 बल्क में लागू करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 8: UNLOCK CONFIRMATION SAFETY MODAL
          ========================================================================= */}
      {unlockingTarget !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl shrink-0">
                🔒
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  सुरक्षा लॉक (Safety Lock Warning)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  गलती से डिलीट होने से बचाने के लिए सुरक्षा पुष्टिकरण
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <span>⚠️</span>
                <span>समीक्षा करें:</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                "{unlockingTarget.name}"
              </p>
              <p className="text-[11px] text-amber-900 font-medium">
                प्रकार: <strong className="text-amber-950">{unlockingTarget.type}</strong>
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                क्या आप वाकई इस संवेदनशील रिकॉर्ड से सुरक्षा लॉक हटाना चाहती हैं? अनलॉक करने के बाद ही डिलीट बटन काम करेगा।
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnlockingTarget(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द करें (लॉक रखें)
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-md text-xs cursor-pointer transition-all active:scale-95"
              >
                🔓 अनलॉक की पुष्टि करें
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          MODAL 9: MASTER RATE CARD BULK FILE & DATA IMPORT HUB (Excel / PDF / Text)
          ========================================================================= */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-2xl text-emerald-800">
                  📁
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    बल्क डेटा व फ़ाइल अपलोड हब (Bulk Import Engine)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Google Excel (.xlsx, .csv), PDF या डायरेक्ट कॉपी-पेस्ट से एक साथ दर्जनों डिशेज़ मास्टर रेट कार्ड में जोड़ें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkImportModal(false)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full font-bold flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Source Tab Selector */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImportSourceTab('excel')}
                className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  importSourceTab === 'excel'
                    ? 'bg-emerald-700 text-white shadow-md font-black'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📊</span>
                <span>Google Excel / CSV फ़ाइल</span>
              </button>

              <button
                type="button"
                onClick={() => setImportSourceTab('pdf')}
                className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  importSourceTab === 'pdf'
                    ? 'bg-emerald-700 text-white shadow-md font-black'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📄</span>
                <span>PDF मेनू डाक्यूमेंट</span>
              </button>

              <button
                type="button"
                onClick={() => setImportSourceTab('text')}
                className={`py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  importSourceTab === 'text'
                    ? 'bg-emerald-700 text-white shadow-md font-black'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>📋</span>
                <span>डेटा पेस्ट (Copy-Paste)</span>
              </button>
            </div>

            {/* TAB 1: EXCEL / CSV UPLOAD */}
            {importSourceTab === 'excel' && (
              <div className="p-6 bg-emerald-50/60 rounded-2xl border-2 border-dashed border-emerald-300 space-y-4 text-center">
                <div className="text-4xl">📊</div>
                <div>
                  <h4 className="text-base font-black text-emerald-950">Excel / Sheet फ़ाइल चुनें (.xlsx, .xls, .csv)</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    फॉर्मेट: Column 1 = Dish Name, Column 2 = Hindi Name, Column 3 = Category, Column 4 = Price, Column 5 = Vendor Payout Rate
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md transition">
                  <span>📥 Google Excel / CSV फ़ाइल ब्राउज़ करें</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileUpload}
                    className="hidden"
                  />
                </label>

                {isProcessingImportFile && (
                  <p className="text-xs font-extrabold text-emerald-800 animate-pulse">
                    ⏳ फ़ाइल पढ़ी जा रही है और डिशेज़ एक्सट्रैक्ट हो रही हैं...
                  </p>
                )}
              </div>
            )}

            {/* TAB 2: PDF UPLOAD */}
            {importSourceTab === 'pdf' && (
              <div className="p-6 bg-indigo-50/60 rounded-2xl border-2 border-dashed border-indigo-300 space-y-4 text-center">
                <div className="text-4xl">📄</div>
                <div>
                  <h4 className="text-base font-black text-indigo-950">PDF मेनू फ़ाइल चुनें (.pdf)</h4>
                  <p className="text-xs text-indigo-700 mt-1">
                    यह स्मार्ट पार्सर PDF से डिश के नाम, हिंदी नाम व लिस्टिंग कीमतों को स्वतः पहचान कर तालिका बनाएगा।
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-md transition">
                  <span>📥 PDF मेनू कार्ड अपलोड करें</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfFileUpload}
                    className="hidden"
                  />
                </label>

                {isProcessingImportFile && (
                  <p className="text-xs font-extrabold text-indigo-800 animate-pulse">
                    ⏳ PDF टेक्स्ट एक्सट्रैक्ट किया जा रहा है...
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: DIRECT TEXT COPY-PASTE */}
            {importSourceTab === 'text' && (
              <div className="space-y-3">
                <label className="block text-slate-800 font-extrabold text-xs">
                  📋 यहाँ WhatsApp / Excel / Note से डेटा कॉपी करके पेस्ट करें (1 पंक्ति = 1 डिश):
                </label>
                <textarea
                  rows={5}
                  value={rawTextPaste}
                  onChange={(e) => setRawTextPaste(e.target.value)}
                  placeholder={`उदाहरण 1: Paneer Tikka, पनीर टिक्का, 180, 70\nउदाहरण 2: Aloo Paratha | आलू पराठा | 99 | 40\nउदाहरण 3: Special Veg Thali 240`}
                  className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    कोमा (,), पाइप (|) या स्पेस द्वारा नाम व रेट अलग किए जा सकते हैं।
                  </span>
                  <button
                    type="button"
                    onClick={handleParseRawText}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm cursor-pointer transition"
                  >
                    🔍 टेक्स्ट पार्स करें व लिस्ट में जोड़ें
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW & EDIT TABLE OF PARSED ITEMS */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">
                    इम्पोर्ट हेतु तैयार डिशेज़ (Parsed Items Preview)
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300">
                    {parsedImportItems.length} डिशेज़
                  </span>
                </div>

                {parsedImportItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setParsedImportItems([])}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    🧹 पूर्वावलोकन साफ़ करें (Clear List)
                  </button>
                )}
              </div>

              {parsedImportItems.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  <span className="text-2xl block mb-1">💡</span>
                  ऊपर दिए विकल्पों में से Excel/PDF फ़ाइल अपलोड करें या टेक्स्ट पेस्ट करके एक्सट्रैक्ट करें।
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">डिश का नाम (English / Hindi)</th>
                        <th className="py-2.5 px-3">श्रेणी (Category)</th>
                        <th className="py-2.5 px-3 text-right">कस्टमर रेट (₹)</th>
                        <th className="py-2.5 px-3 text-right">वेंडर पेआउट (₹)</th>
                        <th className="py-2.5 px-3 text-center">हटाएं</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {parsedImportItems.map((item, idx) => (
                        <tr key={item.tempId || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setParsedImportItems(prev => prev.map((it, i) => i === idx ? { ...it, name: val, hindiName: val } : it));
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 font-bold text-xs"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={item.category}
                              onChange={(e) => {
                                const val = e.target.value;
                                const labels: Record<string, string> = {
                                  breakfast_snacks: 'नाश्ता व स्नैक्स',
                                  monday: 'सोमवार का मेनू',
                                  tuesday: 'मंगलवार का मेनू',
                                  wednesday: 'बुधवार का मेनू',
                                  thursday: 'गुरुवार का मेनू',
                                  friday: 'शुक्रवार का मेनू',
                                  saturday: 'शनिवार का मेनू',
                                  sunday: 'रविवार का मेनू',
                                  special_thali: 'विशेष थाली',
                                  vrat_special: 'व्रत स्पेशल',
                                  breads_desserts: 'ब्रेड्स व मीठा'
                                };
                                setParsedImportItems(prev => prev.map((it, i) => i === idx ? { ...it, category: val, categoryLabel: labels[val] || val } : it));
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white"
                            >
                              <option value="breakfast_snacks">नाश्ता व स्नैक्स</option>
                              <option value="monday">सोमवार मेनू</option>
                              <option value="tuesday">मंगलवार मेनू</option>
                              <option value="wednesday">बुधवार मेनू</option>
                              <option value="thursday">गुरुवार मेनू</option>
                              <option value="friday">शुक्रवार मेनू</option>
                              <option value="saturday">शनिवार मेनू</option>
                              <option value="sunday">रविवार मेनू</option>
                              <option value="special_thali">विशेष थाली</option>
                              <option value="vrat_special">व्रत स्पेशल</option>
                              <option value="breads_desserts">ब्रेड्स व मीठा</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.listingPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setParsedImportItems(prev => prev.map((it, i) => i === idx ? { ...it, listingPrice: val, vendorPayoutRate: Math.round(val * 0.4) } : it));
                              }}
                              className="w-20 px-2 py-1 rounded border border-slate-300 text-right font-bold text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.vendorPayoutRate}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setParsedImportItems(prev => prev.map((it, i) => i === idx ? { ...it, vendorPayoutRate: val } : it));
                              }}
                              className="w-20 px-2 py-1 rounded border border-slate-300 text-right font-bold text-xs text-emerald-700 bg-emerald-50/50"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setParsedImportItems(prev => prev.filter((_, i) => i !== idx))}
                              className="text-rose-600 hover:text-rose-800 font-bold text-sm cursor-pointer"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setParsedImportItems(prev => [
                    ...prev,
                    {
                      tempId: `manual_${Date.now()}`,
                      name: 'नई कस्टम डिश',
                      hindiName: 'नई कस्टम डिश',
                      category: 'breakfast_snacks',
                      categoryLabel: 'नाश्ता व स्नैक्स',
                      portionSize: 'Standard',
                      listingPrice: 120,
                      vendorPayoutRate: 45
                    }
                  ]);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>➕ एक और पंक्ति जोड़ें</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={parsedImportItems.length === 0 || loading}
                  onClick={handleSaveBulkImportSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer disabled:opacity-50 transition"
                >
                  {loading ? '⏳ सेव हो रहा है...' : `🚀 मास्टर रेट कार्ड में सभी ${parsedImportItems.length} डिशेज़ सुरक्षित सेव करें`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
