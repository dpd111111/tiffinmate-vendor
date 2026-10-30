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

  const [ownerPin, setOwnerPin] = useState('1234');
  const [authError, setAuthError] = useState('');

  // Active sub-tab in Owner Panel
  const [activeSubTab, setActiveSubTab] = useState<'rate_card' | 'dish_approvals' | 'orders' | 'payouts' | 'refunds' | 'inventory'>('rate_card');

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

  // Search & Filter state
  const [rateSearch, setRateSearch] = useState('');
  const [rateCategory, setRateCategory] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSourceFilter, setOrderSourceFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals state
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [editingDish, setEditingDish] = useState<OwnerRateItem | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);

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
        setRateCard(data.rateCard || []);
        setPendingDishes(data.pendingDishes || []);
        setOrders(data.orders || []);
        setWallet(data.wallet || {});
        setTransactions(data.transactions || []);
        setRefundDeductions(data.refundDeductions || []);
        setInventory(data.inventory || []);
        setPayoutRequests(data.payoutRequests || []);
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

  useEffect(() => {
    if (isAuthenticated) {
      loadOwnerData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const p = ownerPin.trim();
    if (p === '1234' || p === 'Navovia@2026' || p === '123456' || p.toLowerCase() === 'own') {
      const session = { id: 'own', role: 'owner', name: 'Master Owner', isOwner: true };
      localStorage.setItem('tiffin_session_owner', JSON.stringify(session));
      setIsAuthenticated(true);
    } else {
      setAuthError('अमान्य पासवर्ड या पिन। मालिक पिन 1234 या Navovia@2026 का उपयोग करें।');
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

  // 5. Review Custom Dish (Approve / Reject)
  const handleReviewDish = async (dishId: string, action: 'APPROVE' | 'REJECT') => {
    const notes = action === 'APPROVE' 
      ? 'मालिक द्वारा अनुमोदित (Approved into Master Rate Card)' 
      : (prompt('डिश अस्वीकृत करने का कारण दर्ज करें:') || 'मानदंडों के अनुरूप नहीं');

    try {
      const res = await fetch('/api/owner/vendor/dishes/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId, action, notes })
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
    const notes = action === 'REJECT' ? (prompt('आर्डर अस्वीकृत करने का कारण दर्ज करें:') || 'अमान्य आर्डर') : 'मालिक द्वारा सत्यापित व अनुमोदित';
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मालिक मास्टर पासवर्ड / पिन (Owner PIN)
              </label>
              <input
                type="password"
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder="1234 या Navovia@2026"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 font-mono tracking-wider text-center text-lg font-bold"
                required
              />
              <span className="block text-[11px] text-slate-400 mt-1 text-center">
                डिफ़ॉल्ट परीक्षण पिन: <strong className="text-amber-700 font-mono">1234</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-indigo-700 hover:from-amber-700 hover:to-indigo-800 text-white font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔒 मालिक कंसोल में प्रवेश करें</span>
            </button>
          </form>

          {onSwitchToVendor && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onSwitchToVendor}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>🏪 वेंडर पार्टनर पोर्टल पर जाएं</span>
              </button>
            </div>
          )}
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
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">
                  NOV TIFFIN
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  मालिक कंट्रोल हब (Owner Panel)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% आंतरिक (No Google Sheet)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                मास्टर रेट कार्ड, डिश अप्रूवल, ऑर्डर्स व सोमवार पेआउट कंट्रोल डेस्क
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onSwitchToVendor && (
              <button
                onClick={onSwitchToVendor}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="वेंडर पोर्टल पर स्विच करें"
              >
                <span>🏪</span>
                <span className="hidden sm:inline">वेंडर पोर्टल</span>
              </button>
            )}
            <button
              onClick={loadOwnerData}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
              title="डेटा रीफ्रेश करें"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">रीफ्रेश</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 rounded-lg text-xs font-bold transition border border-red-900/60 cursor-pointer"
            >
              लॉगआउट
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        
        {/* Real-Time Financial & Operational Metric Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              वेंडर कुल कमाई (Gross Balance)
            </span>
            <div className="text-2xl font-black text-slate-900">
              ₹{grossBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              वेंडर ID: NIR8800
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold text-amber-700 uppercase block mb-1">
              सुरक्षा रिज़र्व (Reserve Hold)
            </span>
            <div className="text-2xl font-black text-amber-800">
              ₹{reserveAmt.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-amber-600 mt-0.5 block">
              नियमतः हमेशा सुरक्षित
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
              सोमवार देय पेआउट (Eligible Payout)
            </span>
            <div className="text-2xl font-black text-emerald-900">
              ₹{eligibleMondayPayout.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 font-semibold">
                {eligibleMondayPayout > 0 ? 'ट्रांसफर के लिए तैयार' : 'रिज़र्व से कम'}
              </span>
              <button
                onClick={() => {
                  setPayoutAmount(eligibleMondayPayout);
                  setShowPayoutModal(true);
                }}
                className="text-[10px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-md hover:bg-emerald-800 cursor-pointer"
              >
                पेआउट करें
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold text-indigo-700 uppercase block mb-1">
              पेंडिंग डिश आवेदन (Pending Approvals)
            </span>
            <div className="text-2xl font-black text-indigo-900 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                  निर्णय लंबित
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              वेंडर द्वारा नई जोड़ी गई डिश
            </span>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('rate_card')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'rate_card'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📋</span>
            <span>मास्टर रेट कार्ड ({rateCard.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('dish_approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer relative ${
              activeSubTab === 'dish_approvals'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>⏳</span>
            <span>डिश व आर्डर अप्रूवल</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📦</span>
            <span>लाइव वेंडर ऑर्डर्स ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'payouts'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💰</span>
            <span>सोमवार पेआउट व लेजर</span>
          </button>

          <button
            onClick={() => setActiveSubTab('refunds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'refunds'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>⚠️</span>
            <span>कटौती व पेनल्टी ({refundDeductions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🥫</span>
            <span>किचन इन्वेंट्री ({inventory.length})</span>
          </button>
        </div>

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

              <button
                onClick={() => setShowAddDishModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>➕ नई डिश जोड़ें (Add Dish)</span>
              </button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrdersToVerify.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border bg-white border-amber-300 ring-1 ring-amber-200 shadow-sm space-y-3"
                    >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingDishesToApprove.map((dish) => (
                    <div
                      key={dish.id}
                      className={`p-5 rounded-2xl border bg-white shadow-sm space-y-3 ${
                        dish.status === 'PENDING'
                          ? 'border-amber-300 ring-1 ring-amber-200'
                          : dish.status === 'APPROVED'
                          ? 'border-emerald-200'
                          : 'border-slate-200 opacity-75'
                      }`}
                    >
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

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-700 text-[11px] uppercase">प्रस्तावित पोर्शन व दरें:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {dish.portions?.map((p: any, idx: number) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                              <div className="font-bold text-slate-800">{p.size}</div>
                              <div className="flex justify-between text-slate-500 text-[10px]">
                                <span>लिस्टिंग: ₹{p.listingPrice}</span>
                                <span className="font-extrabold text-emerald-700">वेंडर: ₹{p.vendorPayoutRate}</span>
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

                      {dish.status === 'PENDING' && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleReviewDish(dish.id, 'APPROVE')}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <span>✅ 1-क्लिक स्वीकृत करें (Approve)</span>
                          </button>
                          <button
                            onClick={() => handleReviewDish(dish.id, 'REJECT')}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-bold transition cursor-pointer"
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
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none flex-1"
                />

                <select
                  value={orderSourceFilter}
                  onChange={(e) => setOrderSourceFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
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
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
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
                      <th className="py-3 px-4">ऑर्डर विवरण</th>
                      <th className="py-3 px-3">प्लेटफॉर्म</th>
                      <th className="py-3 px-3">डिश व मात्रा</th>
                      <th className="py-3 px-3 text-right">वेंडर पेआउट</th>
                      <th className="py-3 px-3 text-center">मालिक सत्यापन (Verification)</th>
                      <th className="py-3 px-3 text-center">ऑर्डर स्थिति</th>
                      <th className="py-3 px-4 text-right">स्थिति बदलें</th>
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
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900">{ord.orderNumber}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-800 border">
                              {ord.source}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{ord.itemName}</div>
                            {ord.items && ord.items.length > 1 && (
                              <div className="text-[10px] text-slate-500">
                                {ord.items.length} विभिन्न डिशेज़
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-black text-emerald-700 text-sm">
                            ₹{ord.totalVendorPayout}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {ord.payoutCreditedToWallet ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                                ✅ सत्यापित & क्रेडिटेड
                              </span>
                            ) : ord.verificationStatus === 'REJECTED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
                                ❌ अस्वीकृत
                              </span>
                            ) : (
                              <button
                                onClick={() => handleVerifyOrder(ord.id, 'APPROVE')}
                                className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                ⚡ सत्यापित करें (Approve)
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              ord.status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                              ord.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                              ord.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] font-bold bg-white text-slate-700 cursor-pointer"
                            >
                              <option value="received">Received</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="dispatched">Dispatched</option>
                              <option value="delivered">Delivered (Credit Wallet)</option>
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
                  साप्ताहिक शुक्रवार-गुरुवार चक्र (Friday to Thursday Billing Cycle)
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  सोमवार पेआउट सेटलमेंट डेस्क (Monday Payout Disbursal)
                </h3>
                <p className="text-xs text-slate-500 max-w-xl">
                  वेंडर के खाते में शुद्ध देय राशि ट्रांसफर करें और बैंक / UPI UTR दर्ज करें। यह राशि सीधे वेंडर वॉलेट से डेबिट हो जाएगी।
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-bold">सोमवार देय राशि</span>
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
    </div>
  );
}
