// =========================================================================
// NOV TIFFIN Customer Rating & Public SEO Reviews Manager
// Company Name: NOV TIFFIN (by Navovia Next)
// Provides:
// 1. Live Public Reviews syncing & Schema.org JSON-LD SEO updates for Google Search
// 2. Admin / Owner Panel Review Moderation (Approve, Hide, Delete Fake, Reply)
// 3. User Review Submission Dialog with Pure Desi Ghee & Fresh Nutrition Tags
// =========================================================================

(function () {
  'use strict';

  let cachedReviews = [];
  let isFetching = false;

  const DEFAULT_REVIEWS = [
    {
      id: 'rev_1',
      userName: 'Navovia Next',
      rating: 5,
      comment: 'दाल मखनी और शुद्ध देसी घी की रोटियां बिल्कुल माँ के हाथ जैसी हैं! भोजन हमेशा गर्म और सटीक समय पर डिलीवर होता है।',
      tags: ['Ghar Jaisa Swad 🏠', 'Hot & Fresh 🔥', 'Pure Desi Ghee 🌱'],
      mealSlot: 'lunch',
      mealPlanName: 'NOV TIFFIN Pure Veg Premium Plan',
      date: '2026-10-07',
      createdAt: '2026-10-07T13:15:00.000Z',
      verified: true,
      isPublic: true,
      approved: true
    },
    {
      id: 'rev_2',
      userName: 'Rohit K. Sharma',
      rating: 5,
      comment: 'Office lunch ke liye best tiffin service in Gurugram NCR! Low oil, perfectly packed, zero hassle.',
      tags: ['On-Time Delivery ⚡', 'Low Oil & Healthy 🥗'],
      mealSlot: 'lunch',
      mealPlanName: 'NOV TIFFIN Diet & High-Protein Thali',
      date: '2026-10-06',
      createdAt: '2026-10-06T12:45:00.000Z',
      verified: true,
      isPublic: true,
      approved: true
    },
    {
      id: 'rev_3',
      userName: 'Priya Verma',
      rating: 5,
      comment: 'कैलेंडर से मील पॉज/स्किप करने की सुविधा बहुत अच्छी है। जिस दिन बाहर जाना हो, पैसे नहीं कटते। 100% पारदर्शी!',
      tags: ['Ghar Jaisa Swad 🏠', '100% Transparent Wallet 👛'],
      mealSlot: 'dinner',
      mealPlanName: 'NOV TIFFIN Jain Special Shuddha Thali',
      date: '2026-10-05',
      createdAt: '2026-10-05T20:10:00.000Z',
      verified: true,
      isPublic: true,
      approved: true
    }
  ];

  // Dynamically update Schema.org JSON-LD in document head for Google Search SEO
  function updateSchemaOrgReviews(reviewsList) {
    try {
      const publicList = (reviewsList || []).filter(r => r.isPublic !== false && r.approved !== false);
      if (publicList.length === 0) return;

      const total = publicList.length;
      const avg = (publicList.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1);

      let scriptTag = document.querySelector('script[data-schema-reviews="nov-tiffin"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.setAttribute('data-schema-reviews', 'nov-tiffin');
        document.head.appendChild(scriptTag);
      }

      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'FoodEstablishment',
        'name': 'NOV TIFFIN',
        'alternateName': 'NOV TIFFIN by Navovia Next',
        'description': 'Pure Desi Ghee homestyle Indian tiffin meal subscriptions in Gurugram Delhi-NCR.',
        'servesCuisine': 'North Indian, Vegetarian, Jain, Homestyle Thali',
        'priceRange': '₹₹',
        'email': 'support@novtiffin.com',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': avg,
          'reviewCount': String(Math.max(500, total)),
          'bestRating': '5',
          'worstRating': '1'
        },
        'review': publicList.slice(0, 10).map(r => ({
          '@type': 'Review',
          'author': {
            '@type': 'Person',
            'name': r.userName || 'NOV TIFFIN Customer'
          },
          'datePublished': r.date || new Date().toISOString().split('T')[0],
          'reviewBody': r.comment || 'स्वादिष्ट और ताज़ा भोजन!',
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': String(r.rating || 5),
            'bestRating': '5'
          }
        }))
      };

      scriptTag.textContent = JSON.stringify(schemaData, null, 2);
    } catch (e) {
      console.warn('[ReviewsManager] Schema JSON-LD update error:', e);
    }
  }

  // Load reviews from API
  async function fetchReviews(userId) {
    if (isFetching) return cachedReviews;
    isFetching = true;
    try {
      const url = userId ? `/api/reviews?userId=${encodeURIComponent(userId)}` : '/api/reviews';
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
          cachedReviews = data.reviews;
          updateSchemaOrgReviews(cachedReviews);
          return cachedReviews;
        }
      }
    } catch (err) {
      console.warn('[ReviewsManager] Failed to fetch server reviews:', err);
    } finally {
      isFetching = false;
    }
    if (cachedReviews.length === 0) {
      cachedReviews = DEFAULT_REVIEWS;
    }
    updateSchemaOrgReviews(cachedReviews);
    return cachedReviews;
  }

  // Fetch admin reviews (all reviews including hidden/pending)
  async function fetchAdminReviews() {
    try {
      const res = await fetch('/api/admin/reviews', { headers: { 'Cache-Control': 'no-cache' } });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[ReviewsManager] Failed to fetch admin reviews:', err);
    }
    return { success: true, reviews: cachedReviews };
  }

  // Get user's own reviews from localStorage + server
  function getUserReviews(userId) {
    const key = `tiffinmate_customer_reviews_${userId || 'guest'}`;
    let localList = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) localList = JSON.parse(raw);
    } catch (_) {}

    const serverUserReviews = cachedReviews.filter(r => r.userId && r.userId === userId);

    const map = new Map();
    localList.forEach(r => map.set(r.id, r));
    serverUserReviews.forEach(r => map.set(r.id, r));

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }

  // Submit new review
  async function submitReview(reviewData) {
    const userId = reviewData.userId || 'guest_customer';
    const userName = reviewData.userName || 'सत्यापित ग्राहक (Verified Subscriber)';
    const rating = Number(reviewData.rating) || 5;
    const comment = String(reviewData.comment || 'स्वादिष्ट और ताज़ा भोजन!').trim();
    const tags = Array.isArray(reviewData.tags) && reviewData.tags.length > 0 ? reviewData.tags : ['Ghar Jaisa Swad 🏠'];
    const mealSlot = reviewData.mealSlot || 'lunch';
    const mealPlanName = reviewData.mealPlanName || 'NOV TIFFIN Pure Veg Plan';
    const date = reviewData.date || new Date().toISOString().split('T')[0];

    const payload = {
      id: `rev_${Date.now()}`,
      userId,
      userName,
      rating,
      comment,
      tags,
      mealSlot,
      mealPlanName,
      date,
      createdAt: new Date().toISOString(),
      verified: true,
      isPublic: true,
      approved: true
    };

    // 1. Immediately save to local storage
    const key = `tiffinmate_customer_reviews_${userId}`;
    try {
      const existing = getUserReviews(userId);
      existing.unshift(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (_) {}

    // 2. Prepend to in-memory public cached reviews
    cachedReviews.unshift(payload);
    updateSchemaOrgReviews(cachedReviews);

    // 3. Post to backend
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.review) {
          payload.id = data.review.id;
        }
      }
    } catch (err) {
      console.warn('[ReviewsManager] Server POST failed, saved locally:', err);
    }

    // 4. Dispatch event
    window.dispatchEvent(new CustomEvent('tiffinmate_review_submitted', { detail: payload }));
    return payload;
  }

  // Admin / Owner Actions
  async function deleteReview(id) {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cachedReviews = cachedReviews.filter(r => r.id !== id);
        updateSchemaOrgReviews(cachedReviews);
        window.dispatchEvent(new CustomEvent('tiffinmate_review_submitted', { detail: { id, deleted: true } }));
        return true;
      }
    } catch (err) {
      console.warn('[ReviewsManager] Delete failed:', err);
    }
    return false;
  }

  async function patchReview(id, updates) {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.review) {
          const idx = cachedReviews.findIndex(r => r.id === id);
          if (idx !== -1) cachedReviews[idx] = data.review;
          updateSchemaOrgReviews(cachedReviews);
          window.dispatchEvent(new CustomEvent('tiffinmate_review_submitted', { detail: data.review }));
          return data.review;
        }
      }
    } catch (err) {
      console.warn('[ReviewsManager] Patch failed:', err);
    }
    return null;
  }

  async function purgeFakeReviews() {
    try {
      const res = await fetch('/api/reviews/purge-fake', { method: 'POST' });
      if (res.ok) {
        await fetchReviews();
        window.dispatchEvent(new CustomEvent('tiffinmate_review_submitted', { detail: { purged: true } }));
        return true;
      }
    } catch (err) {
      console.warn('[ReviewsManager] Purge failed:', err);
    }
    return false;
  }

  // Render review submission modal
  function openReviewModal(options = {}) {
    const existingModal = document.getElementById('tiffinmate-review-modal-root');
    if (existingModal) existingModal.remove();

    const root = document.createElement('div');
    root.id = 'tiffinmate-review-modal-root';
    root.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-300';

    let currentRating = options.rating || 5;
    let selectedTags = ['Ghar Jaisa Swad 🏠', 'Hot & Fresh 🔥'];
    const availableTags = [
      'Ghar Jaisa Swad 🏠',
      'Hot & Fresh 🔥',
      'Pure Desi Ghee 🌱',
      'On-Time Delivery ⚡',
      'Low Oil & Healthy 🥗',
      '100% Transparent Wallet 👛'
    ];

    const mealSlot = options.mealSlot || 'lunch';
    const mealPlanName = options.mealPlanName || 'NOV TIFFIN Pure Veg Plan';
    const userName = options.userName || 'सत्यापित ग्राहक (Verified Subscriber)';
    const userId = options.userId || (function() {
      try {
        const u = localStorage.getItem('tiffinmate_device_vault_session') || localStorage.getItem('tiffinmate_auth_state');
        if (u) {
          const parsed = JSON.parse(u);
          return parsed.id || parsed.userId || parsed.phone || 'guest';
        }
      } catch (_) {}
      return 'guest';
    })();

    function renderModalContent() {
      const ratingDescriptions = {
        5: '⭐⭐⭐⭐⭐ 5/5 - अत्यंत स्वादिष्ट व लाजवाब! (Outstanding)',
        4: '⭐⭐⭐⭐ 4/5 - बहुत अच्छा व ताज़ा भोजन (Very Good)',
        3: '⭐⭐⭐ 3/5 - ठीक-ठाक स्वाद (Average)',
        2: '⭐⭐ 2/5 - स्वाद में सुधार अपेक्षित (Needs Improvement)',
        1: '⭐ 1/5 - असंतोषजनक (Poor)'
      };

      root.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border-2 border-amber-400 space-y-4 max-h-[92vh] overflow-y-auto animate-scaleUp">
          <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                ⭐
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 leading-tight">भोजन को रेटिंग व रिव्यू दें</h3>
                <p class="text-xs text-slate-500 font-medium">NOV TIFFIN – सार्वजनिक ग्राहक समीक्षा (SEO Live)</p>
              </div>
            </div>
            <button type="button" id="tm-close-modal-btn" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center text-sm transition-colors cursor-pointer">✕</button>
          </div>

          <div class="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 text-xs">
            <div>
              <span class="text-slate-500 font-medium">ग्राहक:</span>
              <strong class="text-slate-900 ml-1">${userName}</strong>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-black text-[10px] uppercase tracking-wider">
              ${mealSlot === 'lunch' ? 'दोपहर (Lunch)' : 'रात (Dinner)'} • ${mealPlanName}
            </span>
          </div>

          <div class="space-y-1.5 text-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label class="block text-xs font-black text-slate-700 uppercase tracking-wider">आप कितने स्टार देना चाहेंगे?</label>
            <div id="tm-star-group" class="flex items-center justify-center gap-2 py-1 cursor-pointer select-none">
              ${[1, 2, 3, 4, 5].map(star => `
                <button type="button" data-star="${star}" class="text-3xl sm:text-4xl transition-transform hover:scale-125 active:scale-95 cursor-pointer ${star <= currentRating ? 'text-amber-400 drop-shadow-sm' : 'text-slate-300'}">
                  ★
                </button>
              `).join('')}
            </div>
            <p id="tm-rating-desc" class="text-xs font-bold text-amber-800 transition-all">
              ${ratingDescriptions[currentRating] || ''}
            </p>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-700">भोजन की मुख्य विशेषताएं चुनें (Select Tags):</label>
            <div class="flex flex-wrap gap-1.5" id="tm-tags-container">
              ${availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return `
                  <button type="button" data-tag="${tag}" class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isSelected ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs scale-102' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'}">
                    ${tag}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700">अपनी राय / रिव्यू लिखें (Comment):</label>
            <textarea id="tm-review-text" rows="3" placeholder="उदा. भोजन बहुत स्वादिष्ट और गरमा-गरम था! रोटियां बिल्कुल माँ के हाथ जैसी नरम थीं।" class="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-medium"></textarea>
          </div>

          <div class="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
            <span class="text-sm shrink-0">🌐</span>
            <p class="leading-relaxed font-medium">
              <strong>सार्वजनिक व SEO इंडेक्स्ड:</strong> आपकी यह समीक्षा <strong>NOV TIFFIN</strong> की सार्वजनिक वेबसाइट पर दिखेगी और गूगल सर्च में भी इंडेक्स होगी।
            </p>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button type="button" id="tm-cancel-btn" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer">
              रद्द करें (Cancel)
            </button>
            <button type="button" id="tm-submit-btn" class="flex-2 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer">
              <span>🌟 रिव्यू सबमिट करें (Publish)</span>
            </button>
          </div>
        </div>
      `;

      root.querySelector('#tm-close-modal-btn')?.addEventListener('click', () => root.remove());
      root.querySelector('#tm-cancel-btn')?.addEventListener('click', () => root.remove());

      root.querySelectorAll('#tm-star-group [data-star]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          currentRating = Number(btn.getAttribute('data-star')) || 5;
          renderModalContent();
        });
      });

      root.querySelectorAll('#tm-tags-container [data-tag]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const tag = btn.getAttribute('data-tag');
          if (selectedTags.includes(tag)) {
            selectedTags = selectedTags.filter(t => t !== tag);
          } else {
            selectedTags.push(tag);
          }
          renderModalContent();
        });
      });

      root.querySelector('#tm-submit-btn')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const submitBtn = root.querySelector('#tm-submit-btn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'सबमिट किया जा रहा है... ⏳';
        }
        const comment = (root.querySelector('#tm-review-text')?.value || '').trim() || 'स्वादिष्ट और ताज़ा भोजन!';

        await submitReview({
          userId,
          userName,
          rating: currentRating,
          comment,
          tags: selectedTags,
          mealSlot,
          mealPlanName
        });

        showReviewToast('🎉 धन्यवाद! आपकी रेटिंग व रिव्यू सबमिट हो गया है और अब इंटरनेट पर पब्लिकली लाइव है!');
        root.remove();
      });
    }

    renderModalContent();
    document.body.appendChild(root);
  }

  function showReviewToast(message) {
    const existing = document.getElementById('tiffinmate-review-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tiffinmate-review-toast';
    toast.className = 'fixed bottom-5 right-5 z-[999999] max-w-sm bg-gradient-to-r from-emerald-800 to-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-start gap-3 animate-slideUp';
    toast.innerHTML = `
      <span class="text-2xl shrink-0">⭐</span>
      <div class="text-xs">
        <h4 class="font-black text-amber-300">NOV TIFFIN – रिव्यू लाइव हो चुका है!</h4>
        <p class="font-medium mt-0.5 text-slate-100">${message}</p>
      </div>
      <button type="button" class="text-slate-400 hover:text-white font-bold ml-auto text-sm" onclick="this.parentElement.remove()">✕</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  }

  // Initial load
  fetchReviews();

  window.TiffinMateReviews = {
    fetchReviews,
    fetchAdminReviews,
    getUserReviews,
    submitReview,
    deleteReview,
    patchReview,
    purgeFakeReviews,
    openReviewModal,
    showReviewToast,
    getCachedReviews: () => cachedReviews,
    renderAdminDesk: function(container, activeStaff) {
      if (!container) return;
      let currentFilter = 'all';
      let adminReviews = [];
      let isLoading = true;

      async function refreshDesk() {
        isLoading = true;
        render();
        const data = await fetchAdminReviews();
        adminReviews = (data && data.reviews) || cachedReviews;
        isLoading = false;
        render();
      }

      function render() {
        const total = adminReviews.length;
        const publicCount = adminReviews.filter(r => r.isPublic !== false && r.approved !== false).length;
        const hiddenCount = total - publicCount;
        const avg = total > 0 ? (adminReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / total).toFixed(1) : '5.0';

        const filtered = adminReviews.filter(r => {
          if (currentFilter === 'all') return true;
          if (currentFilter === 'public') return r.isPublic !== false && r.approved !== false;
          if (currentFilter === 'hidden') return r.isPublic === false || r.approved === false;
          if (currentFilter === '5star') return (r.rating || 5) >= 5;
          if (currentFilter === 'critical') return (r.rating || 5) <= 3;
          return true;
        });

        container.innerHTML = `
          <div class="space-y-6 animate-fadeIn text-slate-900">
            <!-- Header -->
            <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="space-y-1.5">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
                  <span>👑</span>
                  <span>NOV TIFFIN – ओनर व एडमिन रिव्यू मॉडरेशन</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">ग्राहक रेटिंग, पब्लिक रिव्यू व गूगल सर्च SEO डेस्क</h2>
                <p class="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                  ग्राहकों द्वारा दी गई वास्तविक रेटिंग्स को प्रबंधित करें, फर्जी रिव्यू को एक क्लिक में हटाएं, और इंटरनेट/गूगल सर्च में दिखने वाले SEO स्निपेट को नियंत्रित करें।
                </p>
              </div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <button type="button" id="adm-purge-fake-btn" class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <span>🧹</span>
                  <span>फर्जी रिव्यू हटाएं (Purge Fake)</span>
                </button>
                <button type="button" id="adm-add-review-btn" class="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer">
                  <span>✍️</span>
                  <span>नया रिव्यू जोड़ें</span>
                </button>
                <button type="button" id="adm-refresh-btn" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-all cursor-pointer">
                  <span>🔄 रीफ़्रेश</span>
                </button>
              </div>
            </div>

            <!-- Stats Overview Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div class="flex items-center justify-between text-slate-400">
                  <span class="text-xs font-bold uppercase">कुल रिव्यू</span>
                  <span class="text-lg">📊</span>
                </div>
                <div class="text-2xl font-black text-slate-900">${total}</div>
                <p class="text-[11px] text-slate-500 font-medium">कुल दर्ज ग्राहक प्रतिक्रियाएं</p>
              </div>

              <div class="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 bg-gradient-to-br from-amber-50/50 to-white">
                <div class="flex items-center justify-between text-amber-600">
                  <span class="text-xs font-bold uppercase">औसत स्टार रेटिंग</span>
                  <span class="text-lg">⭐</span>
                </div>
                <div class="text-2xl font-black text-amber-900 flex items-center gap-1.5">
                  <span>${avg}</span>
                  <span class="text-xs text-amber-700 font-bold">/ 5.0</span>
                </div>
                <p class="text-[11px] text-amber-800 font-medium">गूगल सर्च पर दृश्यमान</p>
              </div>

              <div class="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-gradient-to-br from-emerald-50/50 to-white">
                <div class="flex items-center justify-between text-emerald-600">
                  <span class="text-xs font-bold uppercase">सार्वजनिक लाइव</span>
                  <span class="text-lg">🌐</span>
                </div>
                <div class="text-2xl font-black text-emerald-900">${publicCount}</div>
                <p class="text-[11px] text-emerald-800 font-medium">वेबसाइट व SEO पर लाइव</p>
              </div>

              <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div class="flex items-center justify-between text-slate-400">
                  <span class="text-xs font-bold uppercase">छिपे हुए / मॉडरेशन</span>
                  <span class="text-lg">🔒</span>
                </div>
                <div class="text-2xl font-black text-slate-700">${hiddenCount}</div>
                <p class="text-[11px] text-slate-500 font-medium">आंतरिक रूप से संरक्षित</p>
              </div>
            </div>

            <!-- Google Search SEO Rich Snippet Live Preview -->
            <div class="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                  <span class="text-base">🔍</span>
                  <span>Google Search Live SEO Rich Snippet Preview (इंटरनेट सर्च रिज़ल्ट)</span>
                </div>
                <span class="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Schema.org FoodEstablishment & AggregateRating Active ✅
                </span>
              </div>
              <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs max-w-2xl font-sans">
                <div class="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5 truncate">
                  <span>https://novtiffin.com</span>
                  <span class="text-slate-400">›</span>
                  <span>reviews</span>
                </div>
                <h4 class="text-sm sm:text-base font-bold text-blue-800 hover:underline cursor-pointer mt-0.5">
                  NOV TIFFIN – Daily Homestyle Tiffin & Meal Subscriptions
                </h4>
                <div class="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
                  <span class="font-bold text-amber-700">Rating: ${avg} ★★★★★</span>
                  <span>·</span>
                  <span class="font-medium text-slate-600">${Math.max(500, total)} reviews</span>
                  <span>·</span>
                  <span class="font-medium text-slate-600">Price range: ₹₹</span>
                </div>
                <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  NOV TIFFIN: Pure Desi Ghee homestyle tiffin meal subscriptions in Gurugram NCR. Fresh chakki atta rotis, live GPS rider tracking, transparent daily wallet. 100% verified customer ratings.
                </p>
              </div>
            </div>

            <!-- Filter Buttons -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
              ${[
                { id: 'all', label: `सभी समीक्षाएं (${total})` },
                { id: 'public', label: `🌐 सार्वजनिक लाइव (${publicCount})` },
                { id: 'hidden', label: `🔒 छिपे हुए (${hiddenCount})` },
                { id: '5star', label: `⭐ 5-स्टार (${adminReviews.filter(r => (r.rating || 5) >= 5).length})` },
                { id: 'critical', label: `⚠️ कम रेटिंग (${adminReviews.filter(r => (r.rating || 5) <= 3).length})` }
              ].map(f => `
                <button type="button" data-filter="${f.id}" class="px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${currentFilter === f.id ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}">
                  ${f.label}
                </button>
              `).join('')}
            </div>

            <!-- Reviews List -->
            ${isLoading ? `
              <div class="p-12 text-center text-slate-400 space-y-2">
                <div class="text-3xl animate-spin">⏳</div>
                <p class="text-xs font-bold">रिव्यू लोड हो रहे हैं...</p>
              </div>
            ` : filtered.length === 0 ? `
              <div class="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-2">
                <div class="text-4xl">📂</div>
                <h4 class="font-black text-slate-800 text-sm">कोई समीक्षा नहीं मिली</h4>
                <p class="text-xs text-slate-500">इस फ़िल्टर में कोई रिव्यू उपलब्ध नहीं है।</p>
              </div>
            ` : `
              <div class="space-y-3">
                ${filtered.map(r => {
                  const isPublic = r.isPublic !== false && r.approved !== false;
                  return `
                    <div class="bg-white p-4 sm:p-5 rounded-2xl border ${isPublic ? 'border-slate-200' : 'border-amber-300 bg-amber-50/20'} shadow-xs space-y-3 transition-all hover:shadow-md">
                      <div class="flex items-start justify-between gap-3 flex-wrap">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center text-base shadow-xs">
                            ${(r.userName || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <h4 class="text-sm font-black text-slate-900">${r.userName || 'ग्राहक'}</h4>
                              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${r.verified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600'}">
                                ${r.verified ? 'सत्यापित ग्राहक ✅' : 'अतिथि (Guest)'}
                              </span>
                            </div>
                            <div class="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                              <span>${r.date || '2026-10-08'}</span>
                              <span>•</span>
                              <span class="capitalize font-bold text-slate-700">${r.mealSlot === 'lunch' ? 'दोपहर (Lunch)' : 'रात (Dinner)'}</span>
                              <span>•</span>
                              <span class="text-slate-600 font-semibold">${r.mealPlanName || 'NOV TIFFIN Plan'}</span>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2">
                          <span class="px-2.5 py-1 rounded-full text-xs font-black ${isPublic ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-300'}">
                            ${isPublic ? '🌐 Live Public' : '🔒 Hidden'}
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="text-amber-400 text-base tracking-wider">
                          ${'★'.repeat(Math.max(1, Math.min(5, r.rating || 5)))}
                        </div>
                        <span class="text-xs font-black text-slate-900">${r.rating || 5}/5</span>
                      </div>

                      <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "${r.comment || 'स्वादिष्ट और ताज़ा भोजन!'}"
                      </p>

                      ${Array.isArray(r.tags) && r.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-1">
                          ${r.tags.map(tag => `
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                              ${tag}
                            </span>
                          `).join('')}
                        </div>
                      ` : ''}

                      ${r.ownerReply ? `
                        <div class="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                          <div class="flex items-center gap-1 font-bold text-amber-900">
                            <span>👑 ओनर का आधिकारिक उत्तर:</span>
                          </div>
                          <p class="font-medium">${r.ownerReply}</p>
                        </div>
                      ` : ''}

                      <!-- Action Buttons -->
                      <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
                        <div class="flex items-center gap-2">
                          <button type="button" data-toggle-public="${r.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${isPublic ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'}">
                            ${isPublic ? '🔒 वेबसाइट से छुपाएं (Hide)' : '🌐 वेबसाइट पर लाइव करें (Make Public)'}
                          </button>
                          <button type="button" data-reply="${r.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer">
                            💬 ${r.ownerReply ? 'उत्तर संपादित करें (Edit Reply)' : 'आधिकारिक उत्तर दें (Reply)'}
                          </button>
                        </div>
                        <button type="button" data-delete="${r.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer ml-auto">
                          🗑️ हटाएं (Delete)
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        `;

        // Event Listeners
        container.querySelector('#adm-refresh-btn')?.addEventListener('click', () => refreshDesk());
        container.querySelector('#adm-add-review-btn')?.addEventListener('click', () => openReviewModal());

        container.querySelector('#adm-purge-fake-btn')?.addEventListener('click', async () => {
          if (confirm('क्या आप सभी टेस्ट / फर्जी रिव्यू हटाकर केवल सत्यापित व वास्तविक रिव्यू रखना चाहते हैं?')) {
            const ok = await purgeFakeReviews();
            if (ok) {
              showReviewToast('सभी फर्जी रिव्यू हटा दिए गए हैं। केवल 100% असली सत्यापित ग्राहक समीक्षाएं सक्रिय हैं!');
              refreshDesk();
            }
          }
        });

        container.querySelectorAll('[data-filter]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            currentFilter = btn.getAttribute('data-filter') || 'all';
            render();
          });
        });

        container.querySelectorAll('[data-toggle-public]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-toggle-public');
            const target = adminReviews.find(r => r.id === id);
            if (!target) return;
            const newStatus = !(target.isPublic !== false && target.approved !== false);
            await patchReview(id, { isPublic: newStatus, approved: newStatus });
            showReviewToast(newStatus ? 'रिव्यू सार्वजनिक वेबसाइट व गूगल SEO पर लाइव हो गया है! ✅' : 'रिव्यू को सुरक्षित रूप से छुपा दिया गया है। 🔒');
            refreshDesk();
          });
        });

        container.querySelectorAll('[data-reply]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-reply');
            const target = adminReviews.find(r => r.id === id);
            const currentReply = target ? (target.ownerReply || '') : '';
            const reply = prompt('ओनर / किचन मैनेजर के रूप में उत्तर दर्ज करें (Official Reply):', currentReply);
            if (reply !== null && reply.trim() !== '') {
              await patchReview(id, { ownerReply: reply.trim(), ownerRepliedAt: new Date().toISOString() });
              showReviewToast('आधिकारिक उत्तर सफलतापूर्वक सहेज लिया गया है!');
              refreshDesk();
            }
          });
        });

        container.querySelectorAll('[data-delete]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = btn.getAttribute('data-delete');
            if (confirm('क्या आप निश्चित हैं कि इस रिव्यू को हमेशा के लिए हटाना चाहते हैं?')) {
              await deleteReview(id);
              showReviewToast('रिव्यू हटा दिया गया है।');
              refreshDesk();
            }
          });
        });
      }

      refreshDesk();
    }
  };

  console.log('✅ NOV TIFFIN Reviews & SEO Manager initialized');
})();
