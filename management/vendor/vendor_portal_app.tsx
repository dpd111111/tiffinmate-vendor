import React, { useState, useEffect } from 'react';
import { 
  VENDOR_MASTER_RATE_CARD, 
  VendorRateItem 
} from './vendor_rate_card_data';

export interface VendorUser {
  id: string;
  name: string;
  hindiName?: string;
  phone?: string;
  role: string;
  companyName?: string;
  contactPerson?: string;
  gstin?: string;
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export function VendorPortalApp({ activeVendorUser, onLogout, onSwitchToOwner }: { activeVendorUser?: any; onLogout?: () => void; onSwitchToOwner?: () => void }) {
  // Check if authenticated as vendor (or specifically NIR8800)
  const [vendorSession, setVendorSession] = useState<any>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const s = localStorage.getItem('tiffin_session_vendor') || sessionStorage.getItem('tiffin_session_vendor');
      if (s) {
        const u = JSON.parse(s);
        if (u && (u.id === 'NIR8800' || u.role === 'vendor' || (u.userIds && u.userIds.includes('nir8800')))) {
          return u;
        }
      }
      if (activeVendorUser && (activeVendorUser.id === 'NIR8800' || activeVendorUser.role === 'vendor') && activeVendorUser.id !== 'staff_temp_guest') {
        return activeVendorUser;
      }
    } catch {}
    return null;
  });

  // Login Gate State
  const [loginId, setLoginId] = useState('NIR8800');
  const [loginPassword, setLoginPassword] = useState('Nir12388001');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Navigation tabs: 'home' | 'orders' | 'rate_card' | 'wallet' | 'inventory' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'rate_card' | 'wallet' | 'inventory' | 'profile'>('home');
  
  // Data state
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [rateCard, setRateCard] = useState<VendorRateItem[]>(VENDOR_MASTER_RATE_CARD);
  const [rateCardSource, setRateCardSource] = useState<string>('Owner Master Catalog');
  const [wallet, setWallet] = useState<any>({
    currentBalance: 0,
    minimumReserve: 2000,
    tenDayHoldAmount: 0,
    eligibleMondayPayout: 0,
    lastSettlementDate: 'None',
    billingCycle: 'Friday to Thursday',
    payoutDay: 'Monday'
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Deductions state (managed privately by owner)
  const [refundDeductions, setRefundDeductions] = useState<any[]>([]);

  // 3P Punching Form State (with Search, Category Filter & Multi-Item Basket)
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchSource, setPunchSource] = useState<'zomato' | 'swiggy' | 'magicpin' | 'direct'>('zomato');
  const [punchOrderId, setPunchOrderId] = useState('');
  const [punchDishSearch, setPunchDishSearch] = useState('');
  const [punchDishCategory, setPunchDishCategory] = useState('all');
  const [punchItemId, setPunchItemId] = useState(VENDOR_MASTER_RATE_CARD[0]?.id || 'mon_daily_thali');
  const [punchPortionSize, setPunchPortionSize] = useState('Standard');
  const [punchQuantity, setPunchQuantity] = useState(1);
  const [punchTimeSlot, setPunchTimeSlot] = useState('Immediate (15-20 Mins)');
  const [punchNotes, setPunchNotes] = useState('');

  // Draft basket for single order ID with multiple meals
  const [draftBasket, setDraftBasket] = useState<Array<{
    itemId: string;
    itemName: string;
    hindiName: string;
    portionSize: string;
    quantity: number;
    listingPrice: number;
    vendorPayoutRate: number;
    totalPayout: number;
  }>>([]);

  // Rate card filters
  const [rateCategoryFilter, setRateCategoryFilter] = useState<string>('all');
  const [rateSearchQuery, setRateSearchQuery] = useState<string>('');

  // Payout Request Modal State
  const [showPayoutRequestModal, setShowPayoutRequestModal] = useState(false);
  const [reqPayoutAmount, setReqPayoutAmount] = useState<number>(0);
  const [reqPayoutUpi, setReqPayoutUpi] = useState('9118409672@upi');
  const [reqPayoutNotes, setReqPayoutNotes] = useState('');

  const handlePayoutRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPayoutAmount || reqPayoutAmount <= 0) {
      showToast('कृपया मान्य पेआउट राशि दर्ज करें', true);
      return;
    }
    try {
      const res = await fetch('/api/vendor/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reqPayoutAmount,
          upiId: reqPayoutUpi,
          notes: reqPayoutNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'पेआउट अनुरोध ओनर को भेज दिया गया है!');
        setShowPayoutRequestModal(false);
        setReqPayoutNotes('');
        refreshData();
      } else {
        showToast(data.message || 'पेआउट अनुरोध में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो पाया', true);
    }
  };

  // Orders filters
  const [orderSourceFilter, setOrderSourceFilter] = useState<string>('all');

  const vendorId = vendorSession?.id || activeVendorUser?.id || 'NIR8800';
  const vendorName = vendorSession?.companyName || vendorSession?.name || activeVendorUser?.companyName || activeVendorUser?.name || 'NIR Cloud Kitchen Partner';

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
      console.warn(`[VendorSafeFetch] Warning for ${url}:`, e);
    }
    return null;
  };

  // Load backend data
  const refreshData = async () => {
    try {
      setLoading(true);

      // Fetch dynamic Rate Card
      const rcd = await safeJsonFetch('/api/vendor/rate-card');
      if (rcd) {
        if (rcd.rateCard && Array.isArray(rcd.rateCard) && rcd.rateCard.length > 0) {
          setRateCard(rcd.rateCard);
        }
        if (rcd.syncedSource) {
          setRateCardSource(rcd.syncedSource);
        }
      }

      // Fetch orders
      const ordData = await safeJsonFetch('/api/vendor/orders');
      if (ordData?.orders) setOrders(ordData.orders);

      // Fetch wallet & refund deductions
      const walData = await safeJsonFetch('/api/vendor/wallet');
      if (walData) {
        if (walData.wallet) setWallet(walData.wallet);
        if (walData.transactions) setTransactions(walData.transactions);
        if (walData.refundDeductions) setRefundDeductions(walData.refundDeductions);
      }

      // Fetch inventory
      const invData = await safeJsonFetch('/api/vendor/inventory');
      if (invData?.inventory) setInventory(invData.inventory);
    } catch (err) {
      console.warn('Vendor refresh warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorSession) {
      refreshData();
      const interval = setInterval(refreshData, 20000);
      return () => clearInterval(interval);
    }
  }, [vendorSession]);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
      setErrorMsg('');
    }, 4000);
  };

  // Handle Login Submission
  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);

    try {
      const cleanUser = loginId.trim();
      const cleanPass = loginPassword.trim();

      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'vendor',
          userId: cleanUser,
          password: cleanPass
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        const userObj = {
          ...data.user,
          role: 'vendor',
          sessionToken: data.sessionToken || `vendor_tok_${Date.now()}`
        };
        try {
          localStorage.setItem('tiffin_session_vendor', JSON.stringify(userObj));
          sessionStorage.setItem('tiffin_session_vendor', JSON.stringify(userObj));
          sessionStorage.setItem('tiffin_tab_locked_role', 'vendor');
          localStorage.setItem('tiffin_app_mode', 'vendor');
          localStorage.removeItem('tiffin_logged_out_vendor');
        } catch {}

        setVendorSession(userObj);
        showToast(`स्वागत है, ${userObj.name || 'NIR वेंडर पार्टनर'}!`);
      } else {
        setLoginError(data.message || 'अमान्य वेंडर ID या पासवर्ड। कृपया पुनः प्रयास करें।');
      }
    } catch {
      setLoginError('सर्वर से संपर्क नहीं हो पाया। इंटरनेट कनेक्शन चेक करें।');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Logout
  const handleVendorLogout = () => {
    try {
      localStorage.removeItem('tiffin_session_vendor');
      sessionStorage.removeItem('tiffin_session_vendor');
      localStorage.setItem('tiffin_logged_out_vendor', 'true');
    } catch {}
    setVendorSession(null);
    if (onLogout) onLogout();
  };

  // Add item to draft basket (multi-meal support)
  const handleAddToBasket = () => {
    const item = rateCard.find(i => i.id === punchItemId);
    if (!item) return;
    const portionData = item.portions.find(p => p.size === punchPortionSize) || item.portions[0];
    const cleanQty = Math.max(1, punchQuantity);
    const rate = portionData.vendorPayoutRate;
    const total = rate * cleanQty;

    setDraftBasket(prev => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        hindiName: item.hindiName,
        portionSize: portionData.size,
        quantity: cleanQty,
        listingPrice: portionData.listingPrice,
        vendorPayoutRate: rate,
        totalPayout: total
      }
    ]);
    showToast(`${item.name} (${portionData.size}) x${cleanQty} बास्केट में जुड़ा! 🛒`);
  };

  const handleRemoveFromBasket = (index: number) => {
    setDraftBasket(prev => prev.filter((_, idx) => idx !== index));
  };


  // Submit Punched Order (Single Order ID with Single or Multiple Meals)
  const handlePunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchOrderId.trim()) {
      showToast('कृपया मान्य Zomato/Swiggy ऑर्डर ID दर्ज करें', true);
      return;
    }

    // Determine items to submit
    let itemsToSubmit = [...draftBasket];
    if (itemsToSubmit.length === 0) {
      const currentItem = rateCard.find(i => i.id === punchItemId);
      if (currentItem) {
        const portionData = currentItem.portions.find(p => p.size === punchPortionSize) || currentItem.portions[0];
        const cleanQty = Math.max(1, punchQuantity);
        itemsToSubmit.push({
          itemId: currentItem.id,
          itemName: currentItem.name,
          hindiName: currentItem.hindiName,
          portionSize: portionData.size,
          quantity: cleanQty,
          listingPrice: portionData.listingPrice,
          vendorPayoutRate: portionData.vendorPayoutRate,
          totalPayout: portionData.vendorPayoutRate * cleanQty
        });
      }
    }

    if (itemsToSubmit.length === 0) {
      showToast('कृपया कम से कम एक डिश बास्केट में जोड़ें', true);
      return;
    }

    try {
      const res = await fetch('/api/vendor/orders/punch-3p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: punchSource,
          platformOrderId: punchOrderId.trim(),
          items: itemsToSubmit,
          timeSlot: punchTimeSlot,
          notes: punchNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'ऑर्डर सफलतापूर्वक दर्ज हो गया!');
        setShowPunchModal(false);
        setPunchOrderId('');
        setPunchNotes('');
        setDraftBasket([]);
        refreshData();
      } else {
        showToast(data.message || 'ऑर्डर दर्ज करने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर कनेक्शन त्रुटि', true);
    }
  };

  // Update order status (and credit wallet if delivered)
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/vendor/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'ऑर्डर स्टेटस अपडेट हुआ');
        refreshData();
      } else {
        showToast(data.message || 'स्टेटस बदलने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो पाया', true);
    }
  };

  // Quick adjust inventory
  const handleInventoryAdjust = async (itemId: string, change: number) => {
    try {
      const res = await fetch('/api/vendor/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, changeAmount: change })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        refreshData();
      }
    } catch {
      showToast('इन्वेंटरी अपडेट विफल', true);
    }
  };
  // Selected item for 3P modal
  const selectedRateItem = rateCard.find(i => i.id === punchItemId);

  // Dishes filtered by search and category for the 3P Punch modal
  const filteredPunchDishes = rateCard.filter(item => {
    const cat = punchDishCategory;
    const matchesCat = cat === 'all' || 
      item.category === cat || 
      (cat === 'monday' && (item.category === 'monday' || item.id.startsWith('mon_') || (item.categoryLabel && item.categoryLabel.includes('सोमवार')))) ||
      (cat === 'tuesday' && (item.category === 'tuesday' || item.id.startsWith('tue_') || (item.categoryLabel && item.categoryLabel.includes('मंगलवार')))) ||
      (cat === 'wednesday' && (item.category === 'wednesday' || item.id.startsWith('wed_') || (item.categoryLabel && item.categoryLabel.includes('बुधवार')))) ||
      (cat === 'thursday' && (item.category === 'thursday' || item.id.startsWith('thu_') || (item.categoryLabel && item.categoryLabel.includes('गुरुवार')))) ||
      (cat === 'friday' && (item.category === 'friday' || item.id.startsWith('fri_') || (item.categoryLabel && item.categoryLabel.includes('शुक्रवार')))) ||
      (cat === 'saturday' && (item.category === 'saturday' || item.id.startsWith('sat_') || (item.categoryLabel && item.categoryLabel.includes('शनिवार')))) ||
      (cat === 'sunday' && (item.category === 'sunday' || item.id.startsWith('sun_') || (item.categoryLabel && item.categoryLabel.includes('रविवार')))) ||
      (cat === 'special_thali' && (item.category === 'special_thali' || item.id.includes('thali') || (item.categoryLabel && item.categoryLabel.includes('थाली')))) ||
      (cat === 'breakfast_snacks' && (item.category === 'breakfast_snacks' || item.id.includes('snack') || item.id.includes('tea') || item.id.includes('chai') || item.name.toLowerCase().includes('tea') || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('snack') || (item.categoryLabel && item.categoryLabel.includes('नाश्ता')))) ||
      (cat === 'vrat_special' && (item.category === 'vrat_special' || item.id.includes('vrat') || (item.categoryLabel && item.categoryLabel.includes('व्रत')))) ||
      (cat === 'breads_desserts' && (item.category === 'breads_desserts' || item.id.includes('roti') || item.id.includes('paratha') || item.id.includes('rice') || item.id.includes('halwa') || item.id.includes('kheer') || (item.categoryLabel && item.categoryLabel.includes('ब्रेड्स'))));

    const q = punchDishSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  // Filtered rate card
  // Filtered rate card (supports synced CSV and user added items like tea)
  const filteredRateCard = rateCard.filter(item => {
    const matchesCat = rateCategoryFilter === 'all' || 
      item.category === rateCategoryFilter || 
      (item.categoryLabel && item.categoryLabel.includes(rateCategoryFilter));
    const q = rateSearchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.hindiName && item.hindiName.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderSourceFilter === 'all') return true;
    if (orderSourceFilter === '3p') return o.source !== 'tiffin_website';
    if (orderSourceFilter === 'tiffin') return o.source === 'tiffin_website';
    return o.source === orderSourceFilter;
  });

  // =========================================================================
  // GATE: VENDOR LOGIN REQUIRED (If not logged in, show secure login form)
  // =========================================================================
  if (!vendorSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-3xl shadow-lg">
              🏪
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block">
              NOV TIFFIN • VENDOR PARTNER GATEWAY
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              वेंडर पार्टनर लॉगिन
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              क्लाउड किचन, 3P आर्डर पंचिंग व साप्ताहिक वॉलेट सेटलमेंट पोर्टल
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleVendorLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                वेंडर यूज़र ID (Vendor ID):
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="उदा. NIR8800"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                पासवर्ड (Password):
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="उदा. Nir12388001"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Quick Demo Credentials Autofill Button */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">अधिकृत वेंडर क्रेडेंशियल्स</span>
                <span className="font-mono font-black text-slate-800 text-xs">NIR8800 • Nir12388001</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginId('NIR8800');
                  setLoginPassword('Nir12388001');
                }}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black rounded-lg cursor-pointer"
              >
                ऑटो-फिल ⚡
              </button>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {loginSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>सत्यापित किया जा रहा है...</span>
                </>
              ) : (
                <span>वेंडर पोर्टल में प्रवेश करें 🚀</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              सुरक्षित SSL एन्क्रिप्शन • डेटा आंतरिक TiffinMate इंजन से सिंक
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED VENDOR PLATFORM APP VIEW
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-emerald-500 selection:text-white">
      {/* =========================================================================
          TOP VENDOR APP BAR
          ========================================================================= */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-xl shadow-md font-black">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  Vendor Partner OS
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  ID: {vendorId}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black truncate max-w-[200px] sm:max-w-md">
                {vendorName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-slate-200">Kitchen Active</span>
            </div>

            <button
              onClick={() => setShowPunchModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>+</span>
              <span className="hidden sm:inline">3P आर्डर पंच करें</span>
              <span className="sm:hidden">पंच करें</span>
            </button>

            <button
              onClick={handleVendorLogout}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer"
              title="सुरक्षित लॉगआउट"
            >
              लॉगआउट 🚪
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold text-center py-2 px-4 shadow-sm animate-fade-in flex items-center justify-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-600 text-white text-xs font-bold text-center py-2 px-4 shadow-sm animate-fade-in flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}
      </header>

      {/* =========================================================================
          MAIN CONTAINER
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* =========================================================================
            SCREEN 1: HOME NAVIGATION DASHBOARD
            ========================================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Quick Hero Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <span>✨</span>
                    <span>TiffinMate Cloud Kitchen Partner Hub</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    नमस्ते, {vendorName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    ज़ोमैटो व स्वीगी के 3rd-पार्टी ऑर्डर्स पंच करें, TiffinMate वेबसाइट के स्वचालित ऑर्डर्स देखें, और शुक्रवार-गुरुवार चक्र का वीकली सेटलमेंट ट्रैक करें।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-right">
                    <span className="text-[11px] text-slate-300 block font-medium">वर्तमान वॉलेट बैलेंस</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{(wallet.currentBalance ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-amber-300 block font-bold">
                      (₹{wallet.minimumReserve} रिज़र्व सुरक्षित)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Navigation Hub Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Tile 1: Orders */}
              <div 
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                    🍱
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700">
                    लाइव ऑर्डर्स
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    3P (ज़ोमैटो/स्वीगी) पंचिंग व स्वचालित टिफिन ऑर्डर्स।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">कुल ऑर्डर्स:</span>
                  <span className="font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {orders.length}
                  </span>
                </div>
              </div>

              {/* Tile 2: Rate Card */}
              <div 
                onClick={() => setActiveTab('rate_card')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                    📋
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-amber-700">
                    प्रोडक्ट व रेट कार्ड
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    PDF रेट कार्ड अनुसार सप्ताह का मेनू, थाली व तय दरें।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">स्वीकृत आइटम्स:</span>
                  <span className="font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {rateCard.length}
                  </span>
                </div>
              </div>

              {/* Tile 3: Wallet */}
              <div 
                onClick={() => setActiveTab('wallet')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                    💰
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700">
                    वॉलेट व बहीखाता
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    ₹2,000 रिज़र्व, 10-दिन होल्ड व सोमवार पेआउट का हिसाब।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">सोमवार देय:</span>
                  <span className="font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    ₹{(wallet.eligibleMondayPayout ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tile 4: Inventory */}
              <div 
                onClick={() => setActiveTab('inventory')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                    📦
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-700">
                    किचन इन्वेंटरी
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    5-कंपार्टमेंट मील ट्रे, सब्जी डिब्बे, कैरी बैग स्टॉक।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">स्टॉक काउंट:</span>
                  <span className="font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {inventory.length}
                  </span>
                </div>
              </div>


            </div>

            {/* Quick Live Orders Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>🔥</span>
                    <span>आज के तात्कालिक ऑर्डर्स (Live Queue)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    स्वचालित टिफिन ऑर्डर्स और आपके द्वारा पंच किए गए 3P ऑर्डर्स।
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  सभी ऑर्डर्स देखें →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <div className="text-3xl">🍽️</div>
                    <p className="text-xs font-bold text-slate-600">आज का कोई डमी या पुराना ऑर्डर नहीं है</p>
                    <p className="text-[11px] text-slate-400">जैसे ही ज़ोमैटो/स्वीगी या TiffinMate से नया ऑर्डर आएगा, वह यहाँ रियल-टाइम दिखाई देगा।</p>
                  </div>
                ) : (
                  orders.slice(0, 4).map(o => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                        o.source === 'zomato' ? 'bg-red-100 text-red-800' :
                        o.source === 'swiggy' ? 'bg-orange-100 text-orange-800' :
                        o.source === 'tiffin_website' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {o.source === 'tiffin_website' ? 'Tiffin Web' : o.source}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{o.itemName} (x{o.quantity})</h4>
                        <p className="text-[11px] text-slate-500 font-mono">#{o.orderNumber} • {o.timeSlot || 'Lunch'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 block">
                        +₹{o.totalVendorPayout}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                )))} 
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: LIVE ORDERS CONSOLE (3P + AUTO-SYNCED TIFFIN)
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🍳</span>
                  <span>लाइव किचन ऑर्डर्स व 3P डिस्पैच कंसोल</span>
                </h2>
                <p className="text-xs text-slate-500">
                  TiffinMate वेबसाइट ऑर्डर्स ऑटोमैटिक सिंक होते हैं। ज़ोमैटो/स्वीगी ऑर्डर्स 1-क्लिक में पंच करें।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPunchModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>+</span>
                  <span>नया 3P आर्डर पंच करें</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'सभी ऑर्डर्स', count: orders.length },
                { id: 'tiffin', label: '🍱 TiffinMate ऑटो-सिंक', count: orders.filter(o => o.source === 'tiffin_website').length },
                { id: '3p', label: '🛵 3P (ज़ोमैटो / स्वीगी)', count: orders.filter(o => o.source !== 'tiffin_website').length },
                { id: 'zomato', label: 'Zomato', count: orders.filter(o => o.source === 'zomato').length },
                { id: 'swiggy', label: 'Swiggy', count: orders.filter(o => o.source === 'swiggy').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setOrderSourceFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    orderSourceFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    orderSourceFilter === tab.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.length === 0 ? (
                <div className="col-span-2 bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
                  <div className="text-4xl mb-2">🍽️</div>
                  <h4 className="font-bold text-slate-700">इस फ़िल्टर में कोई ऑर्डर नहीं है</h4>
                  <p className="text-xs text-slate-400 mt-1">नया 3P ऑर्डर दर्ज करने के लिए ऊपर "+ नया 3P आर्डर पंच करें" बटन दबाएं।</p>
                </div>
              ) : (
                filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                            order.source === 'zomato' ? 'bg-red-100 text-red-800' :
                            order.source === 'swiggy' ? 'bg-orange-100 text-orange-800' :
                            order.source === 'tiffin_website' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {order.source === 'tiffin_website' ? 'TiffinMate Web (Auto-Sync)' : order.source}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            #{order.orderNumber}
                          </span>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'preparing' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status === 'preparing' ? 'किचन में तैयारी 🍳' :
                           order.status === 'ready' ? 'पैक व तैयार 🍱' :
                           order.status === 'dispatched' ? 'राइडर रवाना 🛵' :
                           'डिलीवर / वॉलेट क्रेडिटेड ✅'}
                        </span>
                      </div>

                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5 my-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            इस ऑर्डर में शामिल मील ({order.items.length} आइटम्स):
                          </span>
                          <div className="bg-slate-50 rounded-xl p-2.5 divide-y divide-slate-200/70 space-y-1 border border-slate-100">
                            {order.items.map((it: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs pt-1 first:pt-0">
                                <div>
                                  <strong className="text-slate-900">{it.itemName}</strong>
                                  <span className="text-slate-500 text-[11px] ml-1.5 font-medium">({it.portionSize})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-600">×{it.quantity}</span>
                                  <span className="font-black text-emerald-700">₹{it.totalVendorPayout}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-slate-900">{order.itemName}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            पोर्शन: <strong className="text-slate-800">{order.portionSize}</strong> • मात्रा: <strong className="text-slate-800">{order.quantity} Thali/Portion</strong>
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">वेंडर तय भुगतान दर</span>
                          <span className="font-black text-slate-800">₹{order.vendorPayoutRate} / थाली</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">कुल वेंडर शेयर (Wallet Credit)</span>
                          <span className="font-black text-emerald-600 text-sm">₹{order.totalVendorPayout}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">डिलीवरी समय / स्लॉट</span>
                          <span className="font-bold text-slate-700">{order.timeSlot || 'Lunch 12:30 PM'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">राइडर स्थिति</span>
                          <span className="font-bold text-slate-700">{order.riderName || 'Central Fleet'}</span>
                        </div>
                      </div>

                      {order.notes && (
                        <p className="text-[11px] text-slate-600 font-medium bg-amber-50/60 p-2 rounded-lg border border-amber-200/50">
                          <strong>निर्देश:</strong> {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'ready')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            पैक व तैयार मार्क करें 🍱
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                          >
                            राइडर को सौंपा (डिलीवर) 🛵
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <span>✅</span>
                            <span>वॉलेट में क्रेडिटेड</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: PRODUCTS & SETTLEMENT RATE CARD (PDF-AUTHORITATIVE)
            ========================================================================= */}
        {activeTab === 'rate_card' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs mb-2">
                    <span>📄</span>
                    <span>ऑफिशियल किचन मेनू सेटलमेंट रेट कार्ड (PDF Authoritative)</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    साप्ताहिक मेनू, थाली व वेंडर भुगतान दरें
                  </h2>
                  <p className="text-xs text-slate-500">
                    यहाँ दी गई दरें आपके और TiffinMate के बीच हुए अनुबंध अनुसार निश्चित हैं (7-12% लॉस बफर पॉलिसी)।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <span>🟢</span>
                    <span>{rateCardSource} ({rateCard.length} डिशेज़)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      refreshData();
                      showToast('रेट कार्ड सफलतापूर्वक रीफ्रेश हुआ! 🔄');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
                  >
                    <span>🔄</span>
                    <span>ताज़ा रेट लोड करें</span>
                  </button>
                  <input
                    type="text"
                    value={rateSearchQuery}
                    onChange={(e) => setRateSearchQuery(e.target.value)}
                    placeholder="डिश खोजें (उदा. tea, चाय, पनीर)..."
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Day Categories Bar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                {[
                  { id: 'all', label: 'सभी मेनू' },
                  { id: 'monday', label: 'सोमवार' },
                  { id: 'tuesday', label: 'मंगलवार' },
                  { id: 'wednesday', label: 'बुधवार' },
                  { id: 'thursday', label: 'गुरुवार' },
                  { id: 'friday', label: 'शुक्रवार' },
                  { id: 'saturday', label: 'शनिवार' },
                  { id: 'sunday', label: 'रविवार' },
                  { id: 'special_thali', label: 'विशेष थाली' },
                  { id: 'breakfast_snacks', label: 'नाश्ता व स्नैक्स' },
                  { id: 'vrat_special', label: 'व्रत स्पेशल' },
                  { id: 'breads_desserts', label: 'ब्रेड्स, चावल व मीठा' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setRateCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      rateCategoryFilter === cat.id
                        ? 'bg-amber-600 text-white shadow-xs font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate Cards Catalog */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRateCard.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          {item.categoryLabel}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">{item.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">{item.hindiName}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        उपलब्ध 🟢
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                      <div className="grid grid-cols-3 bg-slate-50 p-2 font-black text-[11px] text-slate-600">
                        <span>साइज / पोर्शन</span>
                        <span className="text-center text-slate-400 line-through">Zomato रेट</span>
                        <span className="text-right text-emerald-700">वेंडर भुगतान</span>
                      </div>
                      {item.portions.map((portion, pIdx) => (
                        <div key={pIdx} className="grid grid-cols-3 p-2 font-medium items-center">
                          <span className="font-bold text-slate-800">{portion.size}</span>
                          <span className="text-center text-slate-400 font-mono text-[11px]">₹{portion.listingPrice}</span>
                          <span className="text-right font-black text-emerald-600 text-sm font-mono">
                            ₹{portion.vendorPayoutRate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>अनुबंध दर: लॉक 🔒</span>
                    <button
                      onClick={() => {
                        setPunchItemId(item.id);
                        setShowPunchModal(true);
                      }}
                      className="text-xs font-black text-amber-600 hover:text-amber-700 cursor-pointer"
                    >
                      इस डिश का ऑर्डर पंच करें →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 4: VENDOR WALLET & FINANCIAL PASSBOOK
            ========================================================================= */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                    Vendor Passbook & Settlement Ledger
                  </span>
                  <h2 className="text-2xl font-black mt-1">वेंडर डिजिटल वॉलेट</h2>
                  <p className="text-xs text-slate-300">
                    TiffinMate अधिकृत अनुबंध: हमेशा ₹2,000+ रिज़र्व रहेगा। शुक्रवार-गुरुवार चक्र का भुगतान हर सोमवार को होगा।
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-slate-300">
                  <span>बिलिंग चक्र: </span>
                  <strong className="text-emerald-300">शुक्रवार से गुरुवार</strong>
                </div>
              </div>

              {/* 4 Financial Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-slate-300 block font-medium">कुल वॉलेट बैलेंस</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ₹{(wallet.currentBalance ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">तैयार व डिलीवर ऑर्डर्स</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-amber-300 block font-medium">अनिवार्य न्यूनतम रिज़र्व</span>
                  <span className="text-2xl font-black text-amber-300 mt-1 block">
                    ₹{(wallet.minimumReserve ?? 2000).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">हमेशा वॉलेट में सुरक्षित</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-blue-300 block font-medium">10-दिन रोलिंग होल्ड</span>
                  <span className="text-2xl font-black text-blue-300 mt-1 block">
                    ₹{(wallet.tenDayHoldAmount ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">DNS / डिस्प्यूट क्लीयरेंस पर देय</span>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-300 block font-bold">आगामी सोमवार को देय पेआउट</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      ₹{(wallet.eligibleMondayPayout ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-200 block mt-0.5">ओनर अप्रूवल हेतु देय</span>
                  </div>
                  {wallet.eligibleMondayPayout > 0 && (
                    <button
                      onClick={() => {
                        setReqPayoutAmount(wallet.eligibleMondayPayout);
                        setShowPayoutRequestModal(true);
                      }}
                      className="mt-2 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer"
                    >
                      💸 पेआउट रिक्वेस्ट भेजें (No Limit)
                    </button>
                  )}
                </div>
              </div>

              {/* Policy Explanation Box */}
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 text-xs space-y-1.5 text-slate-300">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>पेमेंट नियम व समय-सारिणी (Terms of Settlement):</span>
                </div>
                <p>1. <strong>न्यूनतम रिज़र्व:</strong> आपके वॉलेट में हमेशा ₹2,000 या उससे अधिक बैलेंस रहेगा।</p>
                <p>2. <strong>वीकली ट्रांसफर:</strong> ₹2,000 के ऊपर का बैलेंस हर हफ्ते <strong>सोमवार (Monday)</strong> को ट्रांसफर किया जाएगा।</p>
                <p>3. <strong>साप्ताहिक चक्र:</strong> यह भुगतान <strong>शुक्रवार से गुरुवार (Friday to Thursday)</strong> तक तैयार किए गए ऑर्डर्स का होता है।</p>
                <p>4. <strong>रिफंड कटौती:</strong> कस्टमर ऑर्डर कैंसल या खराब होने पर तय वेंडर का हिस्सा वॉलेट से स्वतः कटेगा।</p>
                <p>5. <strong>ओनर अप्रूवल:</strong> यह भुगतान TiffinMate मुख्य वेबसाइट के ओनर पैनल से सीधे आपके बैंक खाते / UPI में ट्रांसफर होगा।</p>
              </div>
            </div>

            {/* Customer Cancellation / Refund Deductions Card */}
            {refundDeductions && refundDeductions.length > 0 && (
              <div className="bg-red-50 p-6 rounded-3xl border border-red-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-red-900 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>कस्टमर कैंसिलेशन व रिफंड कटौती (Refund Deductions)</span>
                    </h3>
                    <p className="text-xs text-red-600">
                      जिन ऑर्डर्स का ग्राहक को रिफंड हुआ, उनका तय वेंडर शेयर वॉलेट से काटा गया।
                    </p>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-red-200 text-red-900">
                    कुल कटौती: -₹{refundDeductions.reduce((acc, r) => acc + (r.vendorCutDeducted || 0), 0)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-red-100/70 text-red-900 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">तारीख</th>
                        <th className="p-2.5">ऑर्डर सं.</th>
                        <th className="p-2.5">कस्टमर रिफंड</th>
                        <th className="p-2.5">वेंडर हिस्सा कटौती</th>
                        <th className="p-2.5 rounded-r-lg">कारण</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200/50 font-medium text-slate-800">
                      {refundDeductions.map((d, idx) => (
                        <tr key={idx} className="hover:bg-red-100/30">
                          <td className="p-2.5 text-slate-500 font-mono">
                            {d.timestamp ? new Date(d.timestamp).toLocaleDateString() : 'Today'}
                          </td>
                          <td className="p-2.5 font-bold font-mono text-slate-900">#{d.orderId}</td>
                          <td className="p-2.5 text-slate-600">₹{d.customerRefundAmount}</td>
                          <td className="p-2.5 font-black text-red-600">-₹{d.vendorCutDeducted}</td>
                          <td className="p-2.5 text-slate-700">{d.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Passbook Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>🧾</span>
                    <span>खाता-बही व लेन-देन इतिहास (Transactions Passbook)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    ऑर्डर क्रेडिट्स, वीकली पेआउट्स और यूटीआर नंबर का विस्तृत विवरण।
                  </p>
                </div>
                <button
                  onClick={() => {
                    const txt = `TiffinMate Vendor Ledger\nVendor ID: ${vendorId}\nBalance: ₹${wallet.currentBalance}\nEligible Monday Payout: ₹${wallet.eligibleMondayPayout}\nReserve: ₹${wallet.minimumReserve}`;
                    navigator.clipboard.writeText(txt);
                    showToast('लेजर समरी कॉपी हो गई! WhatsApp पर भेज सकते हैं।');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  लेजर कॉपी करें 📋
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-black">
                    <tr>
                      <th className="p-3 rounded-l-xl">तारीख</th>
                      <th className="p-3">विवरण / ऑर्डर सं.</th>
                      <th className="p-3">प्रकार</th>
                      <th className="p-3">राशि</th>
                      <th className="p-3">बैलेंस</th>
                      <th className="p-3 rounded-r-xl">स्थिति / UTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          <div className="text-2xl mb-1">🧾</div>
                          <p className="font-bold text-slate-600 text-xs">कोई डमी लेन-देन इतिहास नहीं है</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">ऑर्डर डिलीवर होने पर वेंडर वॉलेट क्रेडिट्स और साप्ताहिक सोमवार पेआउट्स यहाँ स्वतः दर्ज होंगे।</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono text-slate-500">{txn.date}</td>
                        <td className="p-3">
                          <strong className="text-slate-900 block">{txn.description}</strong>
                          {txn.referenceId && <span className="text-[10px] text-slate-400 font-mono">Ref: {txn.referenceId}</span>}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            txn.type === 'order_credit' ? 'bg-emerald-100 text-emerald-800' :
                            txn.type === 'payout_disbursed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {txn.type === 'order_credit' ? 'ऑर्डर कमाई' :
                             txn.type === 'payout_disbursed' ? 'पेआउट ट्रांसफर' : 'होल्ड'}
                          </span>
                        </td>
                        <td className="p-3 font-black font-mono">
                          <span className={txn.type === 'payout_disbursed' ? 'text-red-600' : 'text-emerald-600'}>
                            {txn.type === 'payout_disbursed' ? '-' : '+'}₹{txn.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          ₹{txn.balanceAfter?.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="text-[11px] font-mono text-slate-600 block">
                            {txn.utrNumber || 'Settled via System'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {txn.ownerApprovedBy ? `ओनर सत्यापित` : `सत्यापित ✅`}
                          </span>
                        </td>
                      </tr>
                    )))} 
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 5: KITCHEN INVENTORY & PACKAGING TRACKER
            ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📦</span>
                    <span>किचन इन्वेंटरी व पैकेजिंग स्टॉक</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    5-कंपार्टमेंट मील ट्रे, सब्जी बॉक्सेस, कैरी बैग व कच्चा माल का रीयल-टाइम बैलेंस।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast('इंडेंट रिक्वेस्ट TiffinMate सेंट्रल स्टोर को भेज दी गई है!');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    + नया सामान इंडेंट भेजें
                  </button>
                </div>
              </div>

              {/* Inventory Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {inventory.length === 0 ? (
                  <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 space-y-2">
                    <div className="text-4xl mb-2">📦</div>
                    <h4 className="font-bold text-slate-700 text-base">किचन इन्वेंटरी वर्तमान में खाली है</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      अभी कोई डमी इन्वेंटरी डेटा मौजूद नहीं है। आप ऊपर "+ नया सामान इंडेंट भेजें" बटन से अपनी वास्तविक पैकेजिंग व कच्चा माल जोड़ सकते हैं।
                    </p>
                  </div>
                ) : (
                  inventory.map(item => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/50">
                            {item.category === 'packaging' ? 'पैकेजिंग ट्रे/डिब्बा' : 'कच्चा राशन'}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">{item.name}</h4>
                          <p className="text-xs text-slate-500">{item.hindiName}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'sufficient' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'low' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">उपलब्ध स्टॉक</span>
                          <span className="text-xl font-black text-slate-900 font-mono">
                            {item.currentStock} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleInventoryAdjust(item.id, -10)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer"
                            title="10 घटाएं"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleInventoryAdjust(item.id, 10)}
                            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-sm flex items-center justify-center cursor-pointer"
                            title="10 जोड़ें"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono">
                      न्यूनतम सीमा: {item.minThreshold} {item.unit}
                    </p>
                  </div>
                )))} 
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 6: VENDOR PROFILE & BANK SETTINGS
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-black border border-emerald-300">
                  🏪
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                      Verified Kitchen Partner
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">ID: {vendorId}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">{vendorName}</h2>
                  <p className="text-xs text-slate-500">TiffinMate Cloud Kitchen Production Unit</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">वेंडर यूज़र ID</span>
                  <span className="text-sm font-black font-mono text-slate-900">NIR8800</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">रजिस्टर्ड मोबाइल नंबर</span>
                  <span className="text-sm font-black font-mono text-slate-900">+91 9118409672</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">GSTIN नंबर</span>
                  <span className="text-sm font-black font-mono text-slate-900">07AAACN8800F1ZV</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">पेआउट UPI ID</span>
                  <span className="text-sm font-black font-mono text-emerald-600">nir8800@upi</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">बैंक खाता संख्या</span>
                  <span className="text-sm font-black font-mono text-slate-900">919118409672 (PYTM0123456)</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold">ऑपरेटिंग समय</span>
                  <span className="text-xs font-bold text-slate-800">सुबह 7:00 AM से रात 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (Mobile-First 1-Tap Switching)
          ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-2 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {[
            { id: 'home', label: 'होम', icon: '🏠' },
            { id: 'orders', label: 'ऑर्डर्स', icon: '🍱', badge: orders.length },
            { id: 'rate_card', label: 'रेट कार्ड', icon: '📋' },
            { id: 'wallet', label: 'वॉलेट', icon: '💰' },
            { id: 'inventory', label: 'इन्वेंटरी', icon: '📦' }
          ].map(nav => (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id as any)}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all cursor-pointer relative ${
                activeTab === nav.id
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <span className="text-lg relative">
                {nav.icon}
                {nav.badge !== undefined && nav.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {nav.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] tracking-tight mt-0.5">{nav.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* =========================================================================
          MODAL: 3P ORDER PUNCHER (ZOMATO / SWIGGY / DIRECT)
          ========================================================================= */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🛵</span>
                  <span>3P ऑर्डर पंच करें (Zomato / Swiggy)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  ऑर्डर दर्ज करते ही किचन में सूचना जाएगी और डिलीवर होने पर तय राशि आपके वॉलेट में जुड़ेगी।
                </p>
              </div>
              <button
                onClick={() => setShowPunchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePunchSubmit} className="space-y-4 text-xs">
              {/* Platform Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">1. प्लेटफॉर्म चुनें:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'zomato', label: 'Zomato', color: 'bg-red-50 text-red-700 border-red-300' },
                    { id: 'swiggy', label: 'Swiggy', color: 'bg-orange-50 text-orange-700 border-orange-300' },
                    { id: 'magicpin', label: 'Magicpin', color: 'bg-blue-50 text-blue-700 border-blue-300' },
                    { id: 'direct', label: 'Direct', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPunchSource(p.id as any)}
                      className={`py-2 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                        punchSource === p.id
                          ? `${p.color} ring-2 ring-emerald-500`
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order ID */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. प्लेटफॉर्म ऑर्डर ID (Zomato / Swiggy Order #):
                </label>
                <input
                  type="text"
                  required
                  value={punchOrderId}
                  onChange={(e) => setPunchOrderId(e.target.value)}
                  placeholder="उदा. #ZOM-99214 या 98402"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Search & Category Filter for Dishes */}
              <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                    <span>🍲</span>
                    <span>3. डिश चुनें ({filteredPunchDishes.length} उपलब्ध):</span>
                  </label>
                  {selectedRateItem && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full truncate max-w-[200px]">
                      चयनित: {selectedRateItem.name}
                    </span>
                  )}
                </div>

                {/* Instant Search Bar */}
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    value={punchDishSearch}
                    onChange={(e) => setPunchDishSearch(e.target.value)}
                    placeholder="डिश खोजें (उदा. tea, चाय, पनीर, दाल, थाली)..."
                    className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                  {punchDishSearch && (
                    <button
                      type="button"
                      onClick={() => setPunchDishSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-0.5"
                      title="सर्च साफ़ करें"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: 'all', label: 'सभी मेनू' },
                    { id: 'breakfast_snacks', label: '☕ नाश्ता व चाय' },
                    { id: 'special_thali', label: '🍱 विशेष थाली' },
                    { id: 'monday', label: 'सोमवार' },
                    { id: 'tuesday', label: 'मंगलवार' },
                    { id: 'wednesday', label: 'बुधवार' },
                    { id: 'thursday', label: 'गुरुवार' },
                    { id: 'friday', label: 'शुक्रवार' },
                    { id: 'saturday', label: 'शनिवार' },
                    { id: 'sunday', label: 'रविवार' },
                    { id: 'vrat_special', label: 'व्रत स्पेशल' },
                    { id: 'breads_desserts', label: 'ब्रेड्स व मीठा' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPunchDishCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        punchDishCategory === cat.id
                          ? 'bg-emerald-700 text-white shadow-xs font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Visual Scrollable List of Filtered Dishes */}
                <div className="max-h-44 overflow-y-auto space-y-1 p-1 rounded-xl bg-white border border-slate-200 divide-y divide-slate-100">
                  {filteredPunchDishes.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 space-y-1">
                      <p className="font-bold text-xs text-slate-600">कोई डिश नहीं मिली</p>
                      <p className="text-[10px]">सर्च बदलें या 'सभी मेनू' पर क्लिक करें</p>
                    </div>
                  ) : (
                    filteredPunchDishes.map(item => {
                      const isSelected = item.id === punchItemId;
                      const startPayout = item.portions[0]?.vendorPayoutRate || 40;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setPunchItemId(item.id);
                            if (item.portions && item.portions[0]) {
                              setPunchPortionSize(item.portions[0].size);
                            }
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-2 border-emerald-600 shadow-xs'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-slate-900 text-xs truncate">{item.name}</span>
                              <span className="text-[10px] text-slate-500 font-medium truncate">({item.hindiName})</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-semibold">{item.categoryLabel}</span>
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                पेआउट दर: ₹{startPayout}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700">
                                चुनें
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Fallback Dropdown Select */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                    या फ़िल्टर की गई लिस्ट का ड्रॉपडाउन:
                  </label>
                  <select
                    value={punchItemId}
                    onChange={(e) => {
                      setPunchItemId(e.target.value);
                      const itm = rateCard.find(i => i.id === e.target.value);
                      if (itm && itm.portions[0]) {
                        setPunchPortionSize(itm.portions[0].size);
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {filteredPunchDishes.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.hindiName}) - {item.categoryLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Portion and Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">पोर्शन साइज:</label>
                  <select
                    value={punchPortionSize}
                    onChange={(e) => setPunchPortionSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                  >
                    {selectedRateItem?.portions.map((p, idx) => (
                      <option key={idx} value={p.size}>
                        {p.size} (भुगतान: ₹{p.vendorPayoutRate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">मात्रा (Quantity):</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPunchQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black"
                    >
                      -
                    </button>
                    <span className="font-black text-base w-8 text-center">{punchQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setPunchQuantity(q => q + 1)}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Order Basket Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToBasket}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                >
                  <span>🛒</span>
                  <span>+ इस ऑर्डर में यह डिश जोड़ें (+ Add Dish to Order)</span>
                </button>
              </div>

              {/* Order Basket List (Multiple meals in single order) */}
              {draftBasket.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <span>📦</span>
                      <span>आर्डर में शामिल डिशेज़ ({draftBasket.length}):</span>
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      कुल वेंडर पेआउट: ₹{draftBasket.reduce((acc, i) => acc + i.totalPayout, 0)}
                    </span>
                  </div>

                  <div className="divide-y divide-emerald-200/60 max-h-44 overflow-y-auto space-y-1">
                    {draftBasket.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between pt-1.5 first:pt-0 text-xs">
                        <div>
                          <strong className="text-slate-900">{item.itemName}</strong>
                          <span className="text-slate-500 text-[11px] ml-1.5 font-medium">({item.portionSize})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">×{item.quantity}</span>
                          <span className="font-black text-emerald-700">₹{item.totalPayout}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromBasket(idx)}
                            className="text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 rounded-md hover:bg-red-50 cursor-pointer"
                            title="डिश हटाएं"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Calculation Box if basket is empty */}
              {draftBasket.length === 0 && (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">तय वेंडर भुगतान दर:</span>
                    <span className="font-bold text-slate-700">
                      ₹{selectedRateItem?.portions.find(p => p.size === punchPortionSize)?.vendorPayoutRate || 80} × {punchQuantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-semibold">डिलीवरी पर वॉलेट में जुड़ेगा:</span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{(selectedRateItem?.portions.find(p => p.size === punchPortionSize)?.vendorPayoutRate || 80) * punchQuantity}
                    </span>
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">विशेष निर्देश (Optional):</label>
                <input
                  type="text"
                  value={punchNotes}
                  onChange={(e) => setPunchNotes(e.target.value)}
                  placeholder="उदा. कम तेल, एक्स्ट्रा सलाद, राइडर 10 मिनट में पहुंचेगा"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPunchModal(false);
                    setDraftBasket([]);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>ऑर्डर किचन में भेजें</span>
                  <span className="px-1.5 py-0.2 bg-emerald-700 rounded-md text-[10px]">
                    {draftBasket.length > 0 ? `${draftBasket.length} मील` : '1 मील'}
                  </span>
                  <span>🍳</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VENDOR SUBMIT PAYOUT REQUEST (NO UPPER LIMIT)
          ========================================================================= */}
      {showPayoutRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>💸</span>
                <span>पेआउट ट्रांसफर की रिक्वेस्ट भेजें</span>
              </h3>
              <button
                onClick={() => setShowPayoutRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayoutRequestSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">अनुरोधित राशि (Requested Amount ₹)</label>
                <input
                  type="number"
                  value={reqPayoutAmount}
                  onChange={(e) => setReqPayoutAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xl font-black"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  अधिकतम देय पेआउट राशि: <strong className="text-emerald-700">₹{wallet.eligibleMondayPayout}</strong> (कोई ऊपरी सीमा नहीं / No Upper Limit)
                </span>
              </div>

              <div>
                <label className="block mb-1">आपका UPI ID / बैंक खाता (Payment UPI ID)</label>
                <input
                  type="text"
                  value={reqPayoutUpi}
                  onChange={(e) => setReqPayoutUpi(e.target.value)}
                  placeholder="e.g. 9118409672@upi / Google Pay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono tracking-wider text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">अतिरिक्त विवरण / नोट्स (Optional Notes)</label>
                <input
                  type="text"
                  value={reqPayoutNotes}
                  onChange={(e) => setReqPayoutNotes(e.target.value)}
                  placeholder="e.g. साप्ताहिक पेआउट ट्रांसफर रिक्वेस्ट"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
                ⚡ <strong>नो-लिमिट नियम:</strong> ₹2,000 रिज़र्व के ऊपर का पूरा बैलेंस ट्रांसफ़र करने पर कोई सीमा नहीं है। रिक्वेस्ट सबमिट होते ही मालिक द्वारा 1-क्लिक में अप्रूव होकर आपके खाते में आ जाएगी।
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer transition-all"
                >
                  पेआउट रिक्वेस्ट सबमिट करें 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
