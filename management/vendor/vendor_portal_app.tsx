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

  // Login Gate State (Clean blank inputs, zero prefilled data)
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Password change state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Navigation tabs: 'home' | 'orders' | 'rate_card' | 'wallet' | 'inventory' | 'profile' | 'incentives'
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'rate_card' | 'wallet' | 'inventory' | 'profile' | 'incentives'>('home');
  
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

  // Incentive Tracker State
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

  // Online Status & Kitchen Photo State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [kitchenPhotoUrl, setKitchenPhotoUrl] = useState<string>('');
  const [kitchenPhotoTimestamp, setKitchenPhotoTimestamp] = useState<string>('');
  const [showKitchenPhotoModal, setShowKitchenPhotoModal] = useState<boolean>(false);
  const [tempKitchenPhoto, setTempKitchenPhoto] = useState<string>('');
  const [uploadingKitchenPhoto, setUploadingKitchenPhoto] = useState<boolean>(false);

  // Cloud Profile State
  const [vendorProfile, setVendorProfile] = useState<any>({
    vendorName: 'निरंकारी टिफिन सेंटर & रसोई',
    ownerName: 'NIR8800 वेंडर पार्टनर',
    phone: '8800880088',
    address: 'सेक्टर 62, नोएडा, उत्तर प्रदेश',
    upiId: '9118409672@upi',
    profilePictureUrl: ''
  });
  const [profVendorName, setProfVendorName] = useState<string>('निरंकारी टिफिन सेंटर & रसोई');
  const [profOwnerName, setProfOwnerName] = useState<string>('NIR8800 वेंडर पार्टनर');
  const [profPhone, setProfPhone] = useState<string>('8800880088');
  const [profAddress, setProfAddress] = useState<string>('सेक्टर 62, नोएडा, उत्तर प्रदेश');
  const [profUpi, setProfUpi] = useState<string>('9118409672@upi');
  const [profPicUrl, setProfPicUrl] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Image Conversion Helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('फोटो का आकार 5MB से कम होना चाहिए', true);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        callback(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleOnlineClick = async () => {
    const currentHour = new Date().getHours();
    if (!isOnline) {
      // Trying to go ONLINE - check time constraint
      if (currentHour < 12) {
        showToast('रात 12:00 बजे से दोपहर 12:00 बजे (Noon) तक ऑनलाइन जाना वर्जित है। कृपया दोपहर 12:00 बजे के बाद अपनी रसोई लाइव करें।', true);
        return;
      }
      // Require Kitchen Photo Modal
      setTempKitchenPhoto(kitchenPhotoUrl || '');
      setShowKitchenPhotoModal(true);
    } else {
      // Going OFFLINE
      try {
        const res = await fetch('/api/vendor/toggle-online', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goOnline: false })
        });
        const data = await res.json();
        if (data.success) {
          setIsOnline(false);
          showToast(data.message || 'रसोई ऑफ़लाइन हो गई है। 🔴');
        } else {
          showToast(data.message || 'स्टेटस बदलने में समस्या', true);
        }
      } catch {
        showToast('सर्वर कनेक्शन त्रुटि', true);
      }
    }
  };

  const handleKitchenPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempKitchenPhoto) {
      showToast('कृपया पहले रसोई की स्वच्छ लाइव फोटो चुनें / अपलोड करें', true);
      return;
    }

    try {
      setUploadingKitchenPhoto(true);
      const res = await fetch('/api/vendor/toggle-online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goOnline: true,
          kitchenPhotoUrl: tempKitchenPhoto
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(true);
        setKitchenPhotoUrl(data.kitchenPhotoUrl || tempKitchenPhoto);
        setKitchenPhotoTimestamp(data.kitchenPhotoTimestamp || new Date().toISOString());
        setShowKitchenPhotoModal(false);
        showToast(data.message || 'रसोई सफलतापूर्वक ऑनलाइन हो गई है! 🟢');
      } else {
        showToast(data.message || 'ऑनलाइन जाने में असमर्थ', true);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    } finally {
      setUploadingKitchenPhoto(false);
    }
  };

  const handleProfileSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await fetch('/api/vendor/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: profVendorName,
          ownerName: profOwnerName,
          phone: profPhone,
          address: profAddress,
          upiId: profUpi,
          profilePictureUrl: profPicUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setVendorProfile(data.profile);
        showToast(data.message || 'प्रोफ़ाइल क्लाउड पर सहेजी गई!');
      } else {
        showToast(data.message || 'प्रोफ़ाइल अपडेट में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क विफल', true);
    } finally {
      setSavingProfile(false);
    }
  };

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

      // Fetch online status & cloud profile
      const statusData = await safeJsonFetch('/api/vendor/status');
      if (statusData) {
        setIsOnline(Boolean(statusData.isOnline));
        if (statusData.kitchenPhotoUrl) setKitchenPhotoUrl(statusData.kitchenPhotoUrl);
        if (statusData.kitchenPhotoTimestamp) setKitchenPhotoTimestamp(statusData.kitchenPhotoTimestamp);
        if (statusData.profile) {
          setVendorProfile(statusData.profile);
          setProfVendorName(statusData.profile.vendorName || '');
          setProfOwnerName(statusData.profile.ownerName || '');
          setProfPhone(statusData.profile.phone || '');
          setProfAddress(statusData.profile.address || '');
          setProfUpi(statusData.profile.upiId || '');
          setProfPicUrl(statusData.profile.profilePictureUrl || '');
        }
      }

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

      // Fetch wallet & refund deductions & incentives
      const walData = await safeJsonFetch('/api/vendor/wallet');
      if (walData) {
        if (walData.wallet) setWallet(walData.wallet);
        if (walData.transactions) setTransactions(walData.transactions);
        if (walData.refundDeductions) setRefundDeductions(walData.refundDeductions);
        if (walData.incentiveStats) setIncentiveStats(walData.incentiveStats);
        if (walData.incentiveConfig) setIncentiveConfig(walData.incentiveConfig);
        if (walData.incentiveHistory) setIncentiveHistory(walData.incentiveHistory);
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

  // Handle Vendor Password Setup / Change
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 4) {
      showToast('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए', true);
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते', true);
      return;
    }

    try {
      setPasswordChangeLoading(true);
      const res = await fetch('/api/vendor/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendorSession?.id || 'NIR8800',
          currentPassword: currPassword,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (data && data.success) {
        showToast(data.message || 'पासवर्ड सफलतापूर्वक बदल दिया गया!');
        setShowPasswordChangeModal(false);
        setCurrPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data?.message || 'पासवर्ड बदलने में त्रुटि', true);
      }
    } catch {
      showToast('सर्वर से संपर्क नहीं हो पाया', true);
    } finally {
      setPasswordChangeLoading(false);
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

  // Active vs Rejected orders separation
  const activeOrders = orders.filter(o => o.verificationStatus !== 'REJECTED' && o.status !== 'cancelled');
  const rejectedOrders = orders.filter(o => o.verificationStatus === 'REJECTED' || o.status === 'cancelled');

  // Filtered active orders
  const filteredOrders = activeOrders.filter(o => {
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

          <form onSubmit={handleVendorLogin} autoComplete="off" className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                वेंडर यूज़र ID (Vendor ID):
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="वेंडर ID दर्ज करें"
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
                autoComplete="new-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="पासवर्ड दर्ज करें"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
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

            {/* Always Live Status Indicator */}
            <div
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-2"
              title="रसोई हमेशा लाइव व सक्रिय है"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>🟢 ऑनलाइन (Live)</span>
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

      {/* Top Segmented Sub-Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto scrollbar-none sticky top-[57px] z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          {[
            { id: 'home', label: '🏠 होम डैशबोर्ड' },
            { id: 'orders', label: `🍱 लाइव ऑर्डर्स (${activeOrders.length})` },

            { id: 'rate_card', label: `📋 मास्टर रेट कार्ड (${rateCard.length})` },
            { id: 'wallet', label: '💰 वॉलेट व लेजर' },
            { id: 'inventory', label: `📦 इन्वेंटरी (${inventory.length})` },
            { id: 'incentives', label: '🎯 इंसेंटिव बोनस' },
            { id: 'profile', label: '👤 वेंडर प्रोफ़ाइल (Cloud)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

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

            {/* =========================================================================
                WEEKLY INCENTIVE & TARGET TRACKER (LIVE MOTIVATION CARD)
                ========================================================================= */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
                      🎯
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 border border-white/30">
                          साप्ताहिक इंसेंटिव प्रोग्रेस (Weekly Target)
                        </span>
                        {incentiveStats.currentMilestoneTier && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200 border border-emerald-400/30">
                            {incentiveStats.currentMilestoneTier.badge} {incentiveStats.currentMilestoneTier.title}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                        {incentiveStats.deliveredMealsThisCycle || 0} टिफिन डिलीवर पूरे हुए
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="bg-slate-950/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                      <span className="text-[10px] text-white/80 block font-semibold">इस हफ़्ते बोनस अर्जित:</span>
                      <span className="text-xl font-black text-amber-200">
                        ₹{(incentiveStats.totalIncentiveEarnedThisCycle || 0).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('incentives')}
                      className="px-3.5 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-xs shadow-md transition cursor-pointer whitespace-nowrap"
                    >
                      सभी रूल्स देखें →
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Next Target Prompt */}
                <div className="bg-slate-950/20 backdrop-blur-xs p-4 rounded-2xl border border-white/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>
                      {incentiveStats.nextMilestoneTier ? (
                        <span>
                          अगला रिवॉर्ड: <strong className="underline text-amber-200">{incentiveStats.nextMilestoneTier.title} (+₹{incentiveStats.nextMilestoneTier.bonusAmount} बोनस)</strong>
                        </span>
                      ) : (
                        <span>🌟 बधाई! आपने सभी उच्चतम इंसेंटिव लक्ष्य प्राप्त कर लिए हैं!</span>
                      )}
                    </span>
                    <span className="font-mono text-amber-100">
                      {incentiveStats.nextMilestoneTier 
                        ? `${incentiveStats.deliveredMealsThisCycle} / ${incentiveStats.nextMilestoneTier.milestoneMeals} मील`
                        : `${incentiveStats.deliveredMealsThisCycle} मील`}
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/25">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.max(5, incentiveStats.progressPercent || 0)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/90">
                    <span>
                      {incentiveStats.mealsNeededForNextTier > 0 ? (
                        <span>
                          🚀 <strong className="text-white font-black underline">सिर्फ {incentiveStats.mealsNeededForNextTier} टिफिन और</strong> बनाने पर अतिरिक्त <strong>₹{incentiveStats.nextMilestoneTier?.bonusAmount}</strong> वॉलेट में जुड़ेंगे!
                        </span>
                      ) : (
                        <span>🎉 इस हफ़्ते का इंसेंटिव मंगलवार पेआउट में स्वतः क्रेडिट होगा।</span>
                      )}
                    </span>
                    <span className="text-[10px] text-white/70">
                      शुक्रवार से गुरुवार का चक्र (1 हफ़्ते रोलिंग लैग)
                    </span>
                  </div>
                </div>

                {/* Milestone Chips Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {(incentiveConfig.tiers || [
                    { id: 'tier_bronze', milestoneMeals: 25, bonusAmount: 150, title: '25 मील' },
                    { id: 'tier_silver', milestoneMeals: 50, bonusAmount: 350, title: '50 मील' },
                    { id: 'tier_gold', milestoneMeals: 100, bonusAmount: 800, title: '100 मील' },
                    { id: 'tier_platinum', milestoneMeals: 200, bonusAmount: 1800, title: '200 मील' }
                  ]).map((t: any) => {
                    const isDone = (incentiveStats.deliveredMealsThisCycle || 0) >= t.milestoneMeals;
                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isDone 
                            ? 'bg-emerald-950/60 border-emerald-400 text-white' 
                            : 'bg-white/10 border-white/20 text-white/80'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                          <span>{t.milestoneMeals} टिफिन</span>
                          {isDone && <span className="text-emerald-300 font-black">✓</span>}
                        </div>
                        <div className="text-xs font-black text-amber-200 mt-0.5">
                          +₹{t.bonusAmount} बोनस
                        </div>
                      </div>
                    );
                  })}
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
                    ₹2,000 रिज़र्व व मंगलवार पेआउट का हिसाब (1 हफ़्ते लैग)।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">मंगलवार देय:</span>
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

              {/* Tile 5: Incentives */}
              <div 
                onClick={() => setActiveTab('incentives')}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform mb-3">
                    🎯
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-orange-700">
                    इंसेंटिव व बोनस
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    साप्ताहिक वॉल्यूम बोनस, ऑन-टाइम डिलीवरी व रेटिंग रिवॉर्ड।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">अर्जित बोनस:</span>
                  <span className="font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    ₹{(incentiveStats.totalIncentiveEarnedThisCycle || 0).toLocaleString()}
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
                {activeOrders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <div className="text-3xl">🍽️</div>
                    <p className="text-xs font-bold text-slate-600">आज का कोई डमी या पुराना ऑर्डर नहीं है</p>
                    <p className="text-[11px] text-slate-400">जैसे ही ज़ोमैटो/स्वीगी या TiffinMate से नया ऑर्डर आएगा, वह यहाँ रियल-टाइम दिखाई देगा।</p>
                  </div>
                ) : (
                  activeOrders.slice(0, 4).map(o => (
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
            {/* VENDOR NOTIFICATION PANEL: REJECTED ORDERS & OWNER MESSAGES */}
            {rejectedOrders.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-red-950 font-black text-xs">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-8 h-8 rounded-xl bg-red-200 text-red-900 flex items-center justify-center text-base">🔔</span>
                    <span>सूचनाएं: ओनर (देवी) द्वारा अस्वीकृत आर्डर्स ({rejectedOrders.length})</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-200 text-red-900 font-extrabold text-[10px] uppercase tracking-wider">
                    0 पेआउट क्रेडिट
                  </span>
                </div>

                <div className="divide-y divide-red-200/80 bg-white/80 rounded-2xl p-3 border border-red-200 space-y-2">
                  {rejectedOrders.map(ro => (
                    <div key={ro.id} className="pt-2.5 first:pt-0 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase">
                            #{ro.orderNumber || ro.platformOrderId}
                          </span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[10px] font-bold uppercase">
                            {ro.source}
                          </span>
                          <span className="font-extrabold text-slate-900">{ro.itemName} (x{ro.quantity})</span>
                        </div>
                        <div className="p-2 bg-red-100/80 border border-red-300 rounded-xl text-red-950 font-bold text-[11px] leading-relaxed">
                          <strong>❌ अस्वीकृति का कारण:</strong> {ro.rejectionReason || ro.notes || 'ओनर (देवी) द्वारा अमान्य ठहराया गया (भोजन गुणवत्ता या अन्य समस्या)'}
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap self-start sm:self-center">
                        <span className="text-red-700 font-black text-xs block">पेआउट: ₹0 (क्रेडिट नहीं हुआ)</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ro.rejectedAt ? new Date(ro.rejectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'हाल ही में'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                { id: 'all', label: 'सक्रिय ऑर्डर्स', count: activeOrders.length },
                { id: 'tiffin', label: '🍱 TiffinMate ऑटो-सिंक', count: activeOrders.filter(o => o.source === 'tiffin_website').length },
                { id: '3p', label: '🛵 3P (ज़ोमैटो / स्वीगी)', count: activeOrders.filter(o => o.source !== 'tiffin_website').length },
                { id: 'zomato', label: 'Zomato', count: activeOrders.filter(o => o.source === 'zomato').length },
                { id: 'swiggy', label: 'Swiggy', count: activeOrders.filter(o => o.source === 'swiggy').length }
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
                    TiffinMate अधिकृत अनुबंध: हमेशा ₹2,000 रिज़र्व बैलेंस लक्ष्य रहेगा। शुक्रवार-गुरुवार चक्र का भुगतान हर मंगलवार को होगा।
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-slate-300">
                  <span>बिलिंग चक्र: </span>
                  <strong className="text-emerald-300">शुक्रवार से गुरुवार (पेआउट: मंगलवार)</strong>
                </div>
              </div>

              {/* 🛡️ SECURITY RESERVE STATUS BREAKDOWN CARD (3 BOXES + PROGRESS BAR) */}
              <div className="bg-slate-900/90 border-2 border-amber-500/50 p-5 rounded-2xl space-y-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h3 className="text-sm font-black text-amber-400">सुरक्षा रिज़र्व बैलेंस ब्रेकडाउन (Target: ₹2,000)</h3>
                      <p className="text-[11px] text-slate-300">
                        वेंडर सुरक्षा रिज़र्व लक्ष्य ₹2,000 जमा होने तक पेआउट लॉक रहेगा। इसके बाद का अतिरिक्त बैलेंस मंगलवार को ट्रांसफर होगा।
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center border ${
                    Math.min(wallet.currentBalance ?? 0, 2000) >= 2000 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  }`}>
                    {Math.min(wallet.currentBalance ?? 0, 2000) >= 2000 ? '✅ रिज़र्व 100% पूर्ण (Payout Unlocked)' : '⏳ रिज़र्व जमा प्रगति पर'}
                  </span>
                </div>

                {/* Reserve Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-300">
                    <span>सुरक्षा रिज़र्व जमा प्रगति:</span>
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
                    <span className="text-[10px] text-slate-400 block">वर्तमान में सुरक्षित रिज़र्व राशि</span>
                  </div>

                  <div className="bg-slate-800/90 p-4 rounded-xl border border-rose-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-rose-300 block tracking-wider">⏳ रिज़र्व पूरा होने हेतु शेष</span>
                    <span className="text-2xl font-black text-rose-400 block font-mono">
                      ₹{Math.max(0, 2000 - (wallet.currentBalance ?? 0)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {Math.max(0, 2000 - (wallet.currentBalance ?? 0)) > 0 ? 'पेआउट अनलॉक होने हेतु आवश्यक' : 'कोई शेष नहीं (रिज़र्व 100% पूरा)'}
                    </span>
                  </div>

                  <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-1">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-300 block tracking-wider">💰 मंगलवार पेआउट देय राशि</span>
                    <span className="text-2xl font-black text-emerald-400 block font-mono">
                      ₹{Math.max(0, (wallet.currentBalance ?? 0) - 2000).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-200 block">
                      {Math.max(0, (wallet.currentBalance ?? 0) - 2000) > 0 ? 'अगले मंगलवार को ट्रांसफर योग्य' : 'रिज़र्व पूरा होने के बाद अनलॉक'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Financial Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-slate-300 block font-medium">कुल वॉलेट बैलेंस</span>
                  <span className="text-2xl font-black text-white mt-1 block font-mono">
                    ₹{(wallet.currentBalance ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">तैयार व डिलीवर ऑर्डर्स</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-amber-300 block font-medium">सुरक्षा रिज़र्व लक्ष्य</span>
                  <span className="text-2xl font-black text-amber-300 mt-1 block font-mono">
                    ₹{(wallet.minimumReserve ?? 2000).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">हमेशा वॉलेट में सुरक्षित</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <span className="text-[11px] text-blue-300 block font-medium">10-दिन रोलिंग होल्ड</span>
                  <span className="text-2xl font-black text-blue-300 mt-1 block font-mono">
                    ₹{(wallet.tenDayHoldAmount ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">DNS / डिस्प्यूट क्लीयरेंस पर देय</span>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-300 block font-bold">मंगलवार देय पेआउट</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                      ₹{Math.max(0, (wallet.currentBalance ?? 0) - 2000).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-200 block mt-0.5">साप्ताहिक सेटलमेंट देय</span>
                  </div>
                  {Math.max(0, (wallet.currentBalance ?? 0) - 2000) > 0 && (
                    <button
                      onClick={() => {
                        setReqPayoutAmount(Math.max(0, (wallet.currentBalance ?? 0) - 2000));
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
                <p>1. <strong>सुरक्षा रिज़र्व:</strong> आपके वॉलेट में हमेशा ₹2,000 सुरक्षा रिज़र्व जमा रहेगा।</p>
                <p>2. <strong>वीकली ट्रांसफर:</strong> ₹2,000 के ऊपर का पात्र बैलेंस हर हफ्ते <strong>मंगलवार (Tuesday)</strong> को ट्रांसफर किया जाएगा।</p>
                <p>3. <strong>साप्ताहिक चक्र व 1 हफ्ते का रोलिंग अंतराल:</strong> पेमेंट 1 हफ्ते के अंतराल (Rolling Lag) से चलेगा, यानी पिछले शुक्रवार से इस गुरुवार तक के साइकिल का भुगतान अगले मंगलवार को ट्रांसफर होगा।</p>
                <p>4. <strong>रिफंड कटौती:</strong> कस्टमर ऑर्डर कैंसल या खराब होने पर तय वेंडर का हिस्सा वॉलेट से स्वतः कटेगा।</p>
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
                          <p className="font-bold text-slate-500 text-xs">कोई लेन-देन इतिहास उपलब्ध नहीं है</p>
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
                            txn.type === 'incentive_bonus' ? 'bg-gradient-to-r from-amber-200 to-emerald-200 text-emerald-950 border border-emerald-400 font-extrabold' :
                            txn.type === 'payout_disbursed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {txn.type === 'order_credit' ? 'ऑर्डर कमाई' :
                             txn.type === 'incentive_bonus' ? '🎯 इंसेंटिव बोनस' :
                             txn.type === 'payout_disbursed' ? 'पेआउट ट्रांसफर' : 'होल्ड'}
                          </span>
                        </td>
                        <td className="p-3 font-black font-mono">
                          <span className={txn.type === 'payout_disbursed' ? 'text-red-600' : 'text-emerald-600 font-black'}>
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
                    <p className="text-xs font-bold text-slate-600">कोई इन्वेंटरी आइटम नहीं है</p>
                  </div>
                ) : (
                  inventory.map(item => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {item.category}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 mt-1">{item.name}</h4>
                          <p className="text-xs text-slate-500">{item.hindiName}</p>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'sufficient' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="font-bold text-slate-700">वर्तमान स्टॉक: <strong className="text-slate-900 font-mono text-sm">{item.currentStock} {item.unit}</strong></span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleInventoryAdjust(item.id, -1)}
                            className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-slate-800 font-black hover:bg-slate-100 cursor-pointer"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleInventoryAdjust(item.id, 1)}
                            className="w-7 h-7 bg-white border border-slate-300 rounded-lg text-slate-800 font-black hover:bg-slate-100 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 6: DAILY MENU & REGULAR FIX SCHEDULE
            ========================================================================= */}
        {activeTab === 'daily_menu' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-amber-500 text-slate-950 rounded-full">
                    TiffinMate Official Kitchen Schedule
                  </span>
                  <h2 className="text-xl font-black mt-1">दैनिक विशेष व ऑल-डे फिक्स मेनू चार्ट</h2>
                  <p className="text-xs text-slate-300">
                    यहाँ देखें कि सप्ताह के किस दिन क्या विशेष मेनू बनेगा और कौन सा मेनू रोज (Permanent Fix) उपलब्ध रहता है।
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 text-xs text-amber-300 space-y-0.5">
                  <div className="font-bold">⏰ स्लॉट समय:</div>
                  <div className="text-[11px] text-slate-200">लंच: {dailyMenuConfig?.lunchSlotTime || '12:00 PM - 3:30 PM'}</div>
                  <div className="text-[11px] text-slate-200">डिनर: {dailyMenuConfig?.dinnerSlotTime || '7:30 PM - 10:30 PM'}</div>
                </div>
              </div>

              {/* Day / Schedule Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/10">
                <button
                  onClick={() => setSelectedDailyDayTab('today')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedDailyDayTab === 'today'
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  🌟 आज का विशेष मेनू (Today)
                </button>
                <button
                  onClick={() => setSelectedDailyDayTab('regular_fixed')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    selectedDailyDayTab === 'regular_fixed'
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  📌 ऑल-डे फिक्स मेनू (Regular Fix)
                </button>
                {[
                  { id: 'monday', label: 'सोमवार' },
                  { id: 'tuesday', label: 'मंगलवार' },
                  { id: 'wednesday', label: 'बुधवार' },
                  { id: 'thursday', label: 'गुरुवार' },
                  { id: 'friday', label: 'शुक्रवार' },
                  { id: 'saturday', label: 'शनिवार' },
                  { id: 'sunday', label: 'रविवार' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDailyDayTab(d.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedDailyDayTab === d.id
                        ? 'bg-slate-100 text-slate-900 font-black shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VIEW 1: TODAY'S SCHEDULED MENU */}
            {(selectedDailyDayTab === 'today' || !selectedDailyDayTab) && (() => {
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const todayDayId = dayNames[new Date().getDay()] || 'monday';
              const todayData = dailyMenuConfig?.dayWiseSchedules?.[todayDayId];

              return (
                <div className="space-y-6">
                  {/* Today Highlights Card */}
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <div>
                          <h3 className="text-base font-black text-amber-950">
                            आज का विशेष मेनू: {todayData?.dayNameHindi || todayDayId.toUpperCase()}
                          </h3>
                          <p className="text-xs text-amber-800 font-medium">
                            खास सब्जी: <strong>{todayData?.specialCurry}</strong> • खास राइस: <strong>{todayData?.specialRice}</strong> • ब्रेड: <strong>{todayData?.specialBread}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-200 text-amber-950 rounded-full font-black text-xs self-start sm:self-center">
                        आज का लाइव मेनू
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Lunch Dishes */}
                      <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center justify-between">
                          <span>☀️ लंच विशेष डिशेज़ ({dailyMenuConfig?.lunchSlotTime || '12:00 PM - 3:30 PM'})</span>
                        </h4>
                        <div className="divide-y divide-amber-100 space-y-2">
                          {todayData?.lunchDishes?.map((dish: any, idx: number) => (
                            <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                <span className="text-[10px] text-slate-500 font-mono">{dish.name}</span>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div>
                                  <span className="text-emerald-700 font-black block">₹{dish.vendorPayoutRate} वेंडर पेआउट</span>
                                  <span className="text-[10px] text-slate-400 line-through">₹{dish.listingPrice} Zomato</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setPunchItemId(dish.dishId);
                                    setShowPunchModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow-xs cursor-pointer"
                                >
                                  पंच करें 🚀
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dinner Dishes */}
                      <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center justify-between">
                          <span>🌙 डिनर विशेष डिशेज़ ({dailyMenuConfig?.dinnerSlotTime || '7:30 PM - 10:30 PM'})</span>
                        </h4>
                        <div className="divide-y divide-amber-100 space-y-2">
                          {todayData?.dinnerDishes?.map((dish: any, idx: number) => (
                            <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                <span className="text-[10px] text-slate-500 font-mono">{dish.name}</span>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div>
                                  <span className="text-emerald-700 font-black block">₹{dish.vendorPayoutRate} वेंडर पेआउट</span>
                                  <span className="text-[10px] text-slate-400 line-through">₹{dish.listingPrice} Zomato</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setPunchItemId(dish.dishId);
                                    setShowPunchModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow-xs cursor-pointer"
                                >
                                  पंच करें 🚀
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Regular Fix Section in Today View */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <span>📌</span>
                          <span>नियमित दैनिक फिक्स मेनू (Always Available 365 Days)</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          पराठे + चाय कॉम्बो, समोसा + चाय, पोहा, तवा रोटी, बासमती राइस व कुल्हड़ चाय जो हर दिन उपलब्ध रहते हैं।
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full">
                        {dailyMenuConfig?.regularFixedDishes?.length || 0} फिक्स आइटम्स
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dailyMenuConfig?.regularFixedDishes?.map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full uppercase block w-max mb-1">
                              रोज उपलब्ध (Fix)
                            </span>
                            <strong className="text-xs font-black text-slate-900 block">{item.hindiName || item.name}</strong>
                            <span className="text-[10px] text-slate-400 font-mono">{item.name}</span>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="text-xs font-black text-emerald-700 block">₹{item.vendorPayoutRate} पेआउट</span>
                            <button
                              onClick={() => {
                                setPunchItemId(item.dishId);
                                setShowPunchModal(true);
                              }}
                              className="mt-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                            >
                              पंच करें 🚀
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* VIEW 2: REGULAR FIXED MENU ONLY */}
            {selectedDailyDayTab === 'regular_fixed' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📌</span>
                      <span>ऑल-डे नियमित फिक्स मेनू (Regular Fixed Items - 365 Days)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      यह वह मेनू है जो हर दिन किचन में बिना किसी बदलाव के तैयार रहता है।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dailyMenuConfig?.regularFixedDishes?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ऑल-डे रेगुलर फ़िक्स
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{item.hindiName || item.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">{item.name}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-emerald-700 font-black block">₹{item.vendorPayoutRate} वेंडर पेआउट</span>
                          <span className="text-[10px] text-slate-400 line-through">₹{item.listingPrice} MRP</span>
                        </div>
                        <button
                          onClick={() => {
                            setPunchItemId(item.dishId);
                            setShowPunchModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                        >
                          आर्डर पंच करें 🚀
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: DAY-WISE SCHEDULE (Monday to Sunday) */}
            {selectedDailyDayTab !== 'today' && selectedDailyDayTab !== 'regular_fixed' && (() => {
              const dayData = dailyMenuConfig?.dayWiseSchedules?.[selectedDailyDayTab];

              return (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                          7-दिवसीय शेड्यूल्ड मेनू
                        </span>
                        <h3 className="text-xl font-black text-slate-900 mt-1">
                          {dayData?.dayNameHindi || selectedDailyDayTab.toUpperCase()} विशेष मेनू
                        </h3>
                      </div>
                      <div className="text-xs text-slate-600 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        खास सब्जी: <strong>{dayData?.specialCurry}</strong> • खास रा收: <strong>{dayData?.specialRice}</strong> • ब्रेड: <strong>{dayData?.specialBread}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lunch Column */}
                      <div className="space-y-3">
                        <div className="bg-amber-100/70 p-3 rounded-2xl text-amber-950 font-black text-xs flex items-center justify-between">
                          <span>☀️ लंच विशेष डिशेज़</span>
                          <span>{dailyMenuConfig?.lunchSlotTime || '12:00 PM - 3:30 PM'}</span>
                        </div>

                        <div className="space-y-2">
                          {dayData?.lunchDishes?.map((dish: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">{dish.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-700 font-black block">₹{dish.vendorPayoutRate} वेंडर दर</span>
                                <button
                                  onClick={() => {
                                    setPunchItemId(dish.dishId);
                                    setShowPunchModal(true);
                                  }}
                                  className="mt-1 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  पंच करें
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dinner Column */}
                      <div className="space-y-3">
                        <div className="bg-indigo-100/70 p-3 rounded-2xl text-indigo-950 font-black text-xs flex items-center justify-between">
                          <span>🌙 डिनर विशेष डिशेज़</span>
                          <span>{dailyMenuConfig?.dinnerSlotTime || '7:30 PM - 10:30 PM'}</span>
                        </div>

                        <div className="space-y-2">
                          {dayData?.dinnerDishes?.map((dish: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
                              <div>
                                <strong className="text-slate-900 block">{dish.hindiName || dish.name}</strong>
                                <span className="text-[10px] text-slate-400 font-mono">{dish.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-700 font-black block">₹{dish.vendorPayoutRate} वेंडर दर</span>
                                <button
                                  onClick={() => {
                                    setPunchItemId(dish.dishId);
                                    setShowPunchModal(true);
                                  }}
                                  className="mt-1 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                                >
                                  पंच करें
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
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
                      किचन स्टॉक और इंडेंट विवरण यहाँ प्रदर्शित होंगे।
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

              {/* Security & Password Management Card */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>🔐</span>
                    <span>खाता सुरक्षा व पासवर्ड प्रबंधन (Security)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    अपना पोर्टल लॉगिन पासवर्ड कभी भी बदलें या नया पासवर्ड सेट करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>🔑</span>
                  <span>पासवर्ड बदलें / सेट करें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 7: VENDOR INCENTIVE & REWARD HUB
            ========================================================================= */}
        {activeTab === 'incentives' && (
          <div className="space-y-6">
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-black">
                    <span>🎯</span>
                    <span>TiffinMate वेंडर इंसेंटिव व रिवॉर्ड्स प्रोग्राम</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    साप्ताहिक इंसेंटिव व बोनस हब
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl">
                    जितने ज्यादा टिफिन और जितनी तेज व स्वादिष्ट सेवा, उतना अधिक अतिरिक्त बोनस! यह बोनस आपके वॉलेट में तुरंत जुड़ता है और सोमवार पेआउट में बिना किसी लिमिट के आपके खाते में ट्रांसफर होता है।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-950/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
                    <span className="text-[11px] text-white/80 block font-semibold">इस हफ़्ते अर्जित बोनस</span>
                    <span className="text-2xl font-black text-amber-200">
                      ₹{(incentiveStats.totalIncentiveEarnedThisCycle || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/70 block font-bold">
                      लाइफटाइम: ₹{(incentiveStats.totalLifetimeIncentives || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Weekly Target Progress Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>🚀</span>
                    <span>वर्तमान सप्ताह की डिलीवरी प्रोग्रेस</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    बिलिंग चक्र: {incentiveStats.cycleStart || 'शुक्रवार'} से {incentiveStats.cycleEnd || 'गुरुवार'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">वर्तमान स्तर:</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black flex items-center gap-1 border border-emerald-300">
                    <span>{incentiveStats.currentMilestoneTier?.badge || '🌱'}</span>
                    <span>{incentiveStats.currentMilestoneTier?.title || 'शुरुआती स्तर'}</span>
                  </span>
                </div>
              </div>

              {/* Big Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                  <span>
                    डिलीवर किए गए टिफिन: <strong className="text-emerald-700 text-sm font-black">{incentiveStats.deliveredMealsThisCycle || 0}</strong>
                  </span>
                  <span className="font-mono text-slate-500">
                    प्रोग्रेस: {incentiveStats.progressPercent || 0}%
                  </span>
                </div>

                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${Math.max(5, incentiveStats.progressPercent || 0)}%` }}
                  ></div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>
                    {incentiveStats.mealsNeededForNextTier > 0 ? (
                      <span>
                        🔥 <strong>सिर्फ {incentiveStats.mealsNeededForNextTier} टिफिन और!</strong> अगला <strong>{incentiveStats.nextMilestoneTier?.title} (+₹{incentiveStats.nextMilestoneTier?.bonusAmount} बोनस)</strong> अनलॉक करने के लिए।
                      </span>
                    ) : (
                      <span>🎉 शानदार कार्य! आपने उच्चतम स्तर के सभी टारगेट पूरे कर लिए हैं!</span>
                    )}
                  </span>
                  <span className="text-amber-800 shrink-0 font-black">
                    {incentiveStats.nextMilestoneTier ? `टारगेट: ${incentiveStats.nextMilestoneTier.milestoneMeals} मील` : '100% Achieved'}
                  </span>
                </div>
              </div>
            </div>

            {/* Milestone Slabs Grid */}
            <div className="space-y-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🏆</span>
                <span>तय साप्ताहिक माइलस्टोन स्लैब्स (Milestone Rewards)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-400 shadow-sm'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {isUnlocked && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          सफल ✓
                        </div>
                      )}

                      <div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-3 shadow-inner">
                          {tier.badge}
                        </div>
                        <h4 className="font-black text-slate-900 text-sm">{tier.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{tier.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold">बोनस राशि:</span>
                          <span className="text-xl font-black text-emerald-700">+₹{tier.bonusAmount}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 font-mono">
                          {tier.milestoneMeals} मील
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Performance Bonus Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏱️</span>
                  <h4 className="font-black text-indigo-950 text-xs">समय पर तैयारी (On-Time SLA)</h4>
                </div>
                <div className="text-2xl font-black text-indigo-900">
                  +₹{incentiveConfig.onTimeBonusPerMeal || 5} <span className="text-xs font-semibold text-indigo-700">/ मील</span>
                </div>
                <p className="text-[11px] text-indigo-800 font-medium">
                  राइडर के आने से पहले 100% समय पर गर्म और तैयार पैक टिफिन सौंपने पर।
                </p>
              </div>

              <div className="bg-teal-50/70 p-5 rounded-3xl border border-teal-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <h4 className="font-black text-teal-950 text-xs">ज़ीरो कस्टमर कंप्लेंट अवॉर्ड</h4>
                </div>
                <div className="text-2xl font-black text-teal-900">
                  +₹{incentiveConfig.zeroComplaintWeeklyBonus || 250} <span className="text-xs font-semibold text-teal-700">/ सप्ताह</span>
                </div>
                <p className="text-[11px] text-teal-800 font-medium">
                  पूरे सप्ताह बिना किसी रिफंड या स्वाद/पैकिंग शिकायत के सेवा देने पर।
                </p>
              </div>

              <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚫</span>
                  <h4 className="font-black text-rose-950 text-xs">डेली 0 कैंसिलेशन बोनस</h4>
                </div>
                <div className="text-2xl font-black text-rose-900">
                  +₹{incentiveConfig.dailyZeroCancellationBonus || 50} <span className="text-xs font-semibold text-rose-700">/ दिन</span>
                </div>
                <p className="text-[11px] text-rose-800 font-medium">
                  पूरे दिन में एक भी ऑर्डर रिजेक्ट या कैंसिल न करने पर मिलने वाला दैनिक बोनस।
                </p>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌐</span>
                  <h4 className="font-black text-emerald-950 text-xs">100% ऑनलाइन उपलब्धता बोनस</h4>
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  +₹{incentiveConfig.weeklyHundredPercentOnlineBonus || 300} <span className="text-xs font-semibold text-emerald-700">/ सप्ताह</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">
                  पूरे सप्ताह 100% समय किचन ऑनलाइन व उपलब्ध रखने पर प्रोत्साहन बोनस।
                </p>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-3xl border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  <h4 className="font-black text-amber-950 text-xs">1-क्लिक देवी स्पॉट बोनस</h4>
                </div>
                <div className="text-2xl font-black text-amber-900">
                  ₹150 - ₹2,000 <span className="text-xs font-semibold text-amber-700">तुरंत</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  वीकेंड पीक लोड व त्योहारों पर देवी (मालिक) द्वारा सीधे आपके वॉलेट में भेजा जाने वाला विशेष रिवॉर्ड।
                </p>
              </div>
            </div>

            {/* Incentive History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📜</span>
                  <h3 className="text-base font-black text-slate-900">
                    आपके अर्जित इंसेंटिव का विवरण ({incentiveHistory.length})
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  कुल बोनस: ₹{(incentiveStats.totalLifetimeIncentives || 0).toLocaleString()}
                </span>
              </div>

              {incentiveHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                  <div className="text-3xl">🎯</div>
                  <p className="font-bold text-slate-600">अभी तक कोई इंसेंटिव दर्ज नहीं हुआ है</p>
                  <p className="text-[11px] text-slate-400">जैसे ही आप 25+ टिफिन पूरे करेंगे या मालिक द्वारा स्पॉट बोनस मिलेगा, वह यहाँ दिखेगा।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black">
                      <tr>
                        <th className="px-4 py-3">तारीख</th>
                        <th className="px-4 py-3">इंसेंटिव प्रकार</th>
                        <th className="px-4 py-3">विवरण / कारण</th>
                        <th className="px-4 py-3">मंजूरी</th>
                        <th className="px-4 py-3 text-right">क्रेडिट बोनस</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {incentiveHistory.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {inc.grantedAt ? new Date(inc.grantedAt).toLocaleDateString('hi-IN') : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              inc.type === 'spot_bonus'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}>
                              {inc.type === 'spot_bonus' ? '⚡ स्पॉट बोनस' : '🏆 माइलस्टोन रिवॉर्ड'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-800 font-bold">
                            {inc.reason}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">
                            {inc.grantedBy || 'Owner Desk'}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                            +₹{inc.amount}
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

        {/* =========================================================================
            SCREEN 8: VENDOR CLOUD PROFILE EDITING
            ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center text-3xl shadow-md overflow-hidden border-2 border-emerald-400">
                    {profPicUrl ? (
                      <img src={profPicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>🏪</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      वेंडर प्रोफ़ाइल सेटिंग्स (Cloud Sync)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      आपकी जानकारी सीधे TiffinMate सर्वर डेटाबेस (`server_vendor_vault.json`) में सुरक्षित होगी।
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSaveSubmit} className="space-y-5 text-xs font-bold text-slate-700">
                {/* Profile Photo Upload */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <label className="block text-slate-900 font-black text-xs uppercase">
                    📸 प्रोफ़ाइल फोटो (Profile Picture):
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {profPicUrl && (
                      <img src={profPicUrl} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm" />
                    )}
                    <div className="flex-1 space-y-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, setProfPicUrl)}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 block font-normal">
                        अपनी या अपनी रसोई की मुख्य फोटो चुनें (अधिकतम 5MB)। फोटो क्लाउड पर सुरक्षित होगी।
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-slate-800">रसोई / मेस का नाम (Kitchen Name)*</label>
                    <input
                      type="text"
                      required
                      value={profVendorName}
                      onChange={(e) => setProfVendorName(e.target.value)}
                      placeholder="e.g. निरंकारी टिफिन सेंटर & रसोई"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-800">मालिक / पार्टनर का नाम (Owner Name)*</label>
                    <input
                      type="text"
                      required
                      value={profOwnerName}
                      onChange={(e) => setProfOwnerName(e.target.value)}
                      placeholder="e.g. NIR8800 वेंडर पार्टनर"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-800">संपर्क फ़ोन नंबर (Phone Number)*</label>
                    <input
                      type="text"
                      required
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      placeholder="e.g. 8800880088"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-800">UPI पेमेंट ID (पेआउट प्राप्त करने हेतु)*</label>
                    <input
                      type="text"
                      required
                      value={profUpi}
                      onChange={(e) => setProfUpi(e.target.value)}
                      placeholder="e.g. 9118409672@upi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">रसोई का पूरा पता (Address)*</label>
                  <textarea
                    rows={2}
                    required
                    value={profAddress}
                    onChange={(e) => setProfAddress(e.target.value)}
                    placeholder="e.g. प्लॉट 42, सेक्टर 62, नोएडा, उत्तर प्रदेश"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs flex items-center gap-2"
                  >
                    {savingProfile ? 'सहेजा जा रहा है...' : '💾 क्लाउड पर प्रोफ़ाइल सहेजें'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (Mobile-First 1-Tap Switching)
          ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-2 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {[
            { id: 'home', label: 'होम', icon: '🏠' },
            { id: 'orders', label: 'ऑर्डर्स', icon: '🍱', badge: orders.length },
            { id: 'rate_card', label: 'रेट कार्ड', icon: '📋' },
            { id: 'wallet', label: 'वॉलेट', icon: '💰' },
            { id: 'incentives', label: 'इंसेंटिव', icon: '🎯', badge: incentiveStats.totalIncentiveEarnedThisCycle > 0 ? `₹${incentiveStats.totalIncentiveEarnedThisCycle}` : undefined },
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
          MODAL: 3P ORDER PUNCHER (ZOMATO / SWIGGY / DIRECT) - MULTI-ITEM & LAPTOP FRIENDLY
          ========================================================================= */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto animate-fade-in max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
                  <span>🛵</span>
                  <span>3P मल्टी-मील ऑर्डर पंचिंग (Zomato / Swiggy / Direct)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  एक ही आर्डर ID में जितनी चाहें डिशेज़ दर्ज करें
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  ऑर्डर ID दर्ज करें, मेनू से डिश चुनकर बास्केट में जोड़ें, और 1-क्लिक में किचन को भेजें।
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPunchModal(false);
                  setDraftBasket([]);
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                title="बंद करें"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePunchSubmit} className="space-y-6 text-xs">
              
              {/* STEP 1: PLATFORM & PROMINENT ORDER ID CARD */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-6 rounded-2xl text-white space-y-4 shadow-md border border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Platform Choice Buttons */}
                  <div className="space-y-2 md:w-1/2">
                    <label className="text-xs font-black text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <span>1️⃣</span>
                      <span>प्लेटफ़ॉर्म चुनें:</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'zomato', label: 'Zomato 🔴', activeColor: 'bg-red-600 text-white border-red-400' },
                        { id: 'swiggy', label: 'Swiggy 🟠', activeColor: 'bg-orange-600 text-white border-orange-400' },
                        { id: 'magicpin', label: 'Magicpin 🔵', activeColor: 'bg-blue-600 text-white border-blue-400' },
                        { id: 'direct', label: 'Direct 🟢', activeColor: 'bg-emerald-600 text-white border-emerald-400' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPunchSource(p.id as any)}
                          className={`py-2 px-1 rounded-xl border text-xs font-black cursor-pointer transition-all text-center ${
                            punchSource === p.id
                              ? `${p.activeColor} ring-2 ring-white shadow-md scale-102`
                              : 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PROMINENT ORDER ID INPUT FIELD */}
                  <div className="space-y-1.5 md:w-1/2">
                    <label className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <span>📌</span>
                      <span>2️⃣ आर्डर ID (Order ID / Reference #)*:</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={punchOrderId}
                        onChange={(e) => setPunchOrderId(e.target.value)}
                        placeholder="उदा: #ZOM-99214 या 98402"
                        className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 font-mono font-black text-base sm:text-lg placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-emerald-400 border-2 border-amber-400 shadow-inner"
                      />
                      {punchOrderId && (
                        <span className="absolute right-3 top-3 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                          ID सेट ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      * एक ही आर्डर ID दर्ज करके आप नीचे कई अलग-अलग डिशेज़ जोड़ सकते हैं।
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 2 & 3: MAIN DISH SELECTION & LIVE ORDER BASKET (SIDE BY SIDE ON LAPTOP) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: DISH PICKER & PORTION CONTROLS (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span>🍱</span>
                      <span>3️⃣ डिश खोजें व चुनें ({filteredPunchDishes.length} उपलब्ध)</span>
                    </h4>
                    {selectedRateItem && (
                      <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full truncate max-w-[200px]">
                        चयनित: {selectedRateItem.name}
                      </span>
                    )}
                  </div>

                  {/* Instant Search Bar */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
                    <input
                      type="text"
                      value={punchDishSearch}
                      onChange={(e) => setPunchDishSearch(e.target.value)}
                      placeholder="डिश खोजें (उदा. tea, चाय, पनीर, दाल, थाली, कॉम्बो)..."
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    {punchDishSearch && (
                      <button
                        type="button"
                        onClick={() => setPunchDishSearch('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer p-0.5"
                        title="सर्च साफ़ करें"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Chips Scrollbar */}
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
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          punchDishCategory === cat.id
                            ? 'bg-emerald-700 text-white font-black shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Visual Dish Catalog List */}
                  <div className="max-h-52 overflow-y-auto space-y-1.5 p-1.5 rounded-xl bg-white border border-slate-200 divide-y divide-slate-100">
                    {filteredPunchDishes.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 space-y-1">
                        <p className="font-bold text-xs text-slate-600">कोई डिश नहीं मिली</p>
                        <p className="text-[11px]">सर्च बदलें या 'सभी मेनू' फ़िल्टर चुनें</p>
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
                            className={`p-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-2 border-emerald-600 shadow-xs'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-xs truncate">{item.name}</span>
                                <span className="text-[11px] text-slate-500 font-medium truncate">({item.hindiName})</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400 font-semibold">{item.categoryLabel}</span>
                                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.2 rounded-md">
                                  पेआउट दर: ₹{startPayout}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSelected ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs">
                                  <span>✓</span>
                                  <span>चयनित</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700">
                                  चुनें +
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Portion & Quantity Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1 text-xs">पोर्शन साइज (Size):</label>
                      <select
                        value={punchPortionSize}
                        onChange={(e) => setPunchPortionSize(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        {selectedRateItem?.portions.map((p, idx) => (
                          <option key={idx} value={p.size}>
                            {p.size} — भुगतान: ₹{p.vendorPayoutRate} (MRP: ₹{p.listingPrice})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1 text-xs">मात्रा (Quantity):</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPunchQuantity(q => Math.max(1, q - 1))}
                          className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-black text-sm cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={punchQuantity}
                          onChange={(e) => setPunchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 h-9 rounded-xl border border-slate-300 text-center font-black text-sm bg-white text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setPunchQuantity(q => q + 1)}
                          className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-black text-sm cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ADD TO BASKET BUTTON */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAddToBasket}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 shadow-md active:scale-98 cursor-pointer transition-all"
                    >
                      <span>🛒</span>
                      <span>+ इस आर्डर में यह डिश जोड़ें (+ Add Dish to Order Basket)</span>
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: LIVE ORDER BASKET SUMMARY (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-4 bg-emerald-50/80 p-4 sm:p-5 rounded-2xl border border-emerald-300">
                  <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                    <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                      <span>📦</span>
                      <span>4️⃣ आर्डर बास्केट ({draftBasket.length} डिशेज़)</span>
                    </h4>
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      #{punchOrderId || 'NO-ID'}
                    </span>
                  </div>

                  {/* Basket Item Table / List */}
                  {draftBasket.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 space-y-2 bg-white/70 p-4 rounded-xl border border-dashed border-emerald-300">
                      <div className="text-3xl">🧺</div>
                      <p className="font-bold text-xs text-slate-700">बास्केट अभी खाली है</p>
                      <p className="text-[11px] text-slate-500">
                        एक ही ऑर्डर ID में आप 1, 2, 5 या जितनी चाहें अलग-अलग डिशेज़ जोड़ सकते हैं। बायां पैनल प्रयोग करें।
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="divide-y divide-emerald-200/80 max-h-56 overflow-y-auto space-y-1 bg-white p-3 rounded-xl border border-emerald-200 shadow-inner">
                        {draftBasket.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-2 first:pt-0 text-xs">
                            <div className="min-w-0 pr-2">
                              <strong className="text-slate-900 block truncate">{item.itemName}</strong>
                              <span className="text-slate-500 text-[10px] font-semibold">
                                {item.portionSize} • ₹{item.vendorPayoutRate} × {item.quantity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-black text-emerald-800 text-xs font-mono">
                                ₹{item.totalPayout}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFromBasket(idx)}
                                className="text-red-600 hover:text-red-800 font-bold p-1 rounded-md hover:bg-red-50 cursor-pointer"
                                title="डिश हटाएं"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Order Financial Summary */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-300 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>कुल डिश संख्या:</span>
                      <span className="font-black font-mono text-slate-900">
                        {draftBasket.length > 0 ? draftBasket.reduce((acc, i) => acc + i.quantity, 0) : punchQuantity} थाली/मील
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-1 border-t border-slate-100">
                      <span className="text-slate-900">डिलीवरी पर कुल वॉलेट पेआउट:</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        ₹{draftBasket.length > 0
                          ? draftBasket.reduce((acc, i) => acc + i.totalPayout, 0)
                          : ((selectedRateItem?.portions.find(p => p.size === punchPortionSize)?.vendorPayoutRate || 80) * punchQuantity)
                        }
                      </span>
                    </div>
                  </div>

                  {/* Special Notes & Dispatch Slot */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1 text-[11px]">डिस्पैच समय / स्लॉट:</label>
                      <select
                        value={punchTimeSlot}
                        onChange={(e) => setPunchTimeSlot(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-900"
                      >
                        <option value="Immediate (15-20 Mins)">तत्काल (Immediate 15-20 mins)</option>
                        <option value="Lunch (12:00 PM - 02:00 PM)">लंच (Lunch Slot)</option>
                        <option value="Dinner (07:30 PM - 09:30 PM)">डिनर (Dinner Slot)</option>
                        <option value="Pre-Order Scheduled">पूर्व-निर्धारित शेडयूल</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1 text-[11px]">विशेष निर्देश (Optional Notes):</label>
                      <input
                        type="text"
                        value={punchNotes}
                        onChange={(e) => setPunchNotes(e.target.value)}
                        placeholder="उदा. कम तेल, एक्स्ट्रा सलाद, राइडर आ चुका है"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 font-medium text-xs bg-white text-slate-900"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* ACTION BUTTONS BAR */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>
                    ऑर्डर पंच होते ही किचन में 'Preparing 🍳' स्थिति में दिखाई देगा।
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPunchModal(false);
                      setDraftBasket([]);
                    }}
                    className="w-1/2 sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    रद्द करें
                  </button>

                  <button
                    type="submit"
                    disabled={!punchOrderId.trim()}
                    className={`w-1/2 sm:w-auto px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      punchOrderId.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>🚀 आर्डर पंच करें</span>
                    <span className="px-2 py-0.5 bg-black/20 rounded-md font-mono text-[11px]">
                      #{punchOrderId.trim() || '...'}
                    </span>
                  </button>
                </div>
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

      {/* =========================================================================
          MODAL 3: VENDOR PASSWORD SETUP / CHANGE MODAL
          ========================================================================= */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🔐</span>
                <span>वेंडर पासवर्ड सेटअप व परिवर्तन</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} autoComplete="off" className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">वर्तमान पासवर्ड (Current Password):</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="वर्तमान पासवर्ड डालें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">नया पासवर्ड (New Password):</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="नया पासवर्ड बनाएं (कम से कम 4 अक्षर)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">नया पासवर्ड पुनः दर्ज करें (Confirm Password):</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="नया पासवर्ड दोबारा लिखें"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {passwordChangeLoading ? (
                    <span>सेव हो रहा है...</span>
                  ) : (
                    <span>पासवर्ड अपडेट करें 🔒</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
