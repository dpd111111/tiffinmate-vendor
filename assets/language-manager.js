// =========================================================================
// TiffinMate Smart Mother Tongue / मातृभाषा & Geolocation Manager
// Priority: मातृभाषा / Mother Tongue First (Zero English Compulsion)
// Witty & Humorous Critical Option for English (Angrezi Babu Mode)
// =========================================================================

(function () {
  const MOTHER_TONGUES = [
    { code: 'hi', label: 'हिंदी', sub: 'Hindi', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', sub: 'Marathi', flag: '🚩' },
    { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati', flag: '🪔' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', sub: 'Punjabi', flag: '🌾' },
    { code: 'bn', label: 'বাংলা', sub: 'Bengali', flag: '🌺' },
    { code: 'ta', label: 'தமிழ்', sub: 'Tamil', flag: '🏛️' },
    { code: 'te', label: 'తెలుగు', sub: 'Telugu', flag: '☀️' },
    { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada', flag: '🌴' },
    { code: 'ml', label: 'മലയാളം', sub: 'Malayalam', flag: '🥥' }
  ];

  const ALL_LANGUAGES = [
    ...MOTHER_TONGUES,
    { code: 'en', label: 'English', sub: 'अंग्रेजी', flag: '🇬🇧' }
  ];

  const REGION_MAP = {
    maharashtra: 'mr',
    mumbai: 'mr',
    pune: 'mr',
    nagpur: 'mr',
    gujarat: 'gu',
    ahmedabad: 'gu',
    surat: 'gu',
    vadodara: 'gu',
    punjab: 'pa',
    ludhiana: 'pa',
    amritsar: 'pa',
    'west bengal': 'bn',
    kolkata: 'bn',
    'tamil nadu': 'ta',
    chennai: 'ta',
    coimbatore: 'ta',
    madurai: 'ta',
    karnataka: 'kn',
    bengaluru: 'kn',
    bangalore: 'kn',
    mysore: 'kn',
    telangana: 'te',
    hyderabad: 'te',
    'andhra pradesh': 'te',
    visakhapatnam: 'te',
    vijayawada: 'te',
    kerala: 'ml',
    kochi: 'ml',
    thiruvananthapuram: 'ml',
    // Hindi belt
    'uttar pradesh': 'hi',
    delhi: 'hi',
    'new delhi': 'hi',
    noida: 'hi',
    lucknow: 'hi',
    kanpur: 'hi',
    varanasi: 'hi',
    bihar: 'hi',
    patna: 'hi',
    'madhya pradesh': 'hi',
    bhopal: 'hi',
    indore: 'hi',
    rajasthan: 'hi',
    jaipur: 'hi',
    haryana: 'hi',
    gurugram: 'hi',
    gurgaon: 'hi',
    uttarakhand: 'hi',
    dehradun: 'hi',
    'himachal pradesh': 'hi',
    jharkhand: 'hi',
    ranchi: 'hi',
    chhattisgarh: 'hi'
  };

  const STORAGE_KEY_LANG = 'tiffin_preferred_lang';
  const STORAGE_KEY_PROMPTED = 'tiffin_lang_preference_set';

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'hi';
  }

  function applyLanguage(code, isManual) {
    localStorage.setItem(STORAGE_KEY_LANG, code);
    localStorage.setItem(STORAGE_KEY_PROMPTED, 'true');

    // Set Google Translate cookie
    const cookieVal = code === 'hi' ? '/auto/hi' : `/auto/${code}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=${cookieVal}; domain=.${window.location.hostname}; path=/;`;
    }

    updateFloatingButton(code);

    if (isManual) {
      if (code === 'en') {
        showToast('लो जी! अंग्रेज़ी सेट कर दी 🎩... पर याद रखना, दाल-रोटी का असली स्वाद मातृभाषा में ही है! 😉');
      } else {
        const match = ALL_LANGUAGES.find(l => l.code === code) || ALL_LANGUAGES[0];
        showToast(`आपकी मातृभाषा / Mother Tongue (${match.label}) सेट हो गई! 🇮🇳`);
      }
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else if (isManual) {
      window.location.reload();
    }
  }

  function updateFloatingButton(code) {
    const btnText = document.getElementById('tm-lang-current-label');
    if (btnText) {
      const match = ALL_LANGUAGES.find(l => l.code === code) || ALL_LANGUAGES[0];
      btnText.textContent = `${match.flag} ${match.label}`;
    }
  }

  function showLanguageModal(isExplicitUserRequest) {
    const existing = document.getElementById('tm-lang-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tm-lang-modal-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px; font-family: system-ui, -apple-system, sans-serif;
      animation: tmFadeIn 0.25s ease-out;
    `;

    const currentLang = getCurrentLang();

    overlay.innerHTML = `
      <div style="background: #ffffff; border-radius: 26px; max-width: 500px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid #e2e8f0; animation: tmScaleUp 0.25s ease-out;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1b5e20, #2e7d32); padding: 22px 24px; color: #ffffff; position: relative;">
          ${isExplicitUserRequest ? `
            <button id="tm-close-modal-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
          ` : ''}
          <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.18); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
            <span>🇮🇳</span> मातृभाषा / Mother Tongue
          </div>
          <h3 style="margin: 0; font-size: 20px; font-weight: 900; line-height: 1.3;">अपनी मातृभाषा (Mother Tongue) चुनें</h3>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #c8e6c9; font-weight: 500;">
            ${isExplicitUserRequest ? 'अपनी पसंद की मातृभाषा / Mother Tongue में ऐप का आनंद लें:' : 'लोकेशन नहीं मिली! कृपया अपनी मातृभाषा / Mother Tongue चुनें (अंग्रेजी अनिवार्य नहीं है):'}
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 20px; max-height: 420px; overflow-y: auto;">
          <div style="font-size: 11px; font-weight: 800; color: #1b5e20; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
            ✨ भारतीय मातृभाषाएँ (Mother Tongues):
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${MOTHER_TONGUES.map(l => {
              const isSelected = l.code === currentLang;
              return `
                <button 
                  data-lang="${l.code}" 
                  class="tm-lang-opt-btn"
                  style="
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 14px; border-radius: 16px; border: 2px solid ${isSelected ? '#2e7d32' : '#e2e8f0'};
                    background: ${isSelected ? '#e8f5e9' : '#ffffff'};
                    color: ${isSelected ? '#1b5e20' : '#1e293b'};
                    cursor: pointer; text-align: left; transition: all 0.15s ease;
                    outline: none; box-shadow: ${isSelected ? '0 4px 12px rgba(46,125,50,0.15)' : 'none'};
                  "
                >
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 22px;">${l.flag}</span>
                    <div>
                      <div style="font-size: 14px; font-weight: 800; line-height: 1.2;">${l.label}</div>
                      <div style="font-size: 10px; color: #64748b; font-weight: 600;">${l.sub}</div>
                    </div>
                  </div>
                  ${isSelected ? '<span style="color: #2e7d32; font-weight: 900; font-size: 16px;">✓</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Humorous & Playfully Critical English Option -->
          <div style="margin-top: 16px; padding: 14px 16px; background: #fff1f2; border: 1.5px dashed #f43f5e; border-radius: 20px; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="font-size: 11px; font-weight: 900; color: #be123c; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
                🧐 क्या सच में अंग्रेज़ी चाहिए? (Angrezi Babu Mode)
              </span>
              <span style="font-size: 15px;">🎩☕</span>
            </div>
            <p style="margin: 6px 0 10px 0; font-size: 11.5px; color: #9f1239; line-height: 1.45; font-weight: 500;">
              "अरे बाबूजी! शुद्ध देसी घी की दाल-रोटी और घर के टिफिन का असली स्वाद तो अपनी <strong>मातृभाषा (Mother Tongue)</strong> में ही आता है... अब अंग्रेज़ी में खाओगे तो क्या पनीर का स्वाद बढ़ जाएगा? 😂 पर चलिए, अगर आपको अंग्रेज़ी बाबू ही बनना है तो आपकी मर्ज़ी!"
            </p>
            <button 
              data-lang="en" 
              class="tm-lang-opt-btn"
              style="
                width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
                padding: 10px 16px; border-radius: 12px; border: 1.5px solid #e11d48;
                background: ${currentLang === 'en' ? '#fecdd3' : '#ffffff'}; color: #be123c; font-size: 12px; font-weight: 900;
                cursor: pointer; transition: all 0.15s ease; box-shadow: 0 2px 6px rgba(225,29,72,0.1);
              "
            >
              <span>🇬🇧 English</span>
              <span>(हाँ भाई, मुझे अंग्रेज़ी बाबू ही बनना है! 🎩)</span>
              <span>${currentLang === 'en' ? '✓ सक्रिय' : '→'}</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
          <span>🇮🇳 मातृभाषा सर्वोत्तम है • कभी भी बदलें</span>
          ${isExplicitUserRequest ? `
            <button id="tm-cancel-modal-btn" style="background: transparent; border: none; color: #0f172a; font-weight: 700; cursor: pointer; padding: 4px 8px;">रद्द करें</button>
          ` : `
            <button data-lang="hi" class="tm-lang-opt-btn" style="background: #2e7d32; color: #fff; border: none; font-weight: 700; border-radius: 10px; padding: 6px 14px; cursor: pointer;">मातृभाषा में जारी रखें</button>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.tm-lang-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-lang');
        if (code) {
          applyLanguage(code, true);
          overlay.remove();
        }
      });
    });

    const closeBtn = overlay.querySelector('#tm-close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.remove());

    const cancelBtn = overlay.querySelector('#tm-cancel-modal-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => overlay.remove());
  }

  function showToast(message) {
    const existing = document.getElementById('tm-toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'tm-toast-notification';
    toast.style.cssText = `
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #1b5e20; color: #ffffff; padding: 11px 20px; border-radius: 50px;
      font-size: 12px; font-weight: 800; box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 99998; display: flex; align-items: center; gap: 8px; font-family: system-ui, sans-serif;
      animation: tmFadeIn 0.3s ease; text-align: center; max-width: 90vw;
    `;
    toast.innerHTML = `<span>🌐</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }

  function createFloatingLanguageButton() {
    if (document.getElementById('tm-floating-lang-btn')) return;

    const currentLang = getCurrentLang();
    const match = ALL_LANGUAGES.find(l => l.code === currentLang) || ALL_LANGUAGES[0];

    const btn = document.createElement('button');
    btn.id = 'tm-floating-lang-btn';
    btn.type = 'button';
    btn.title = 'मातृभाषा / Mother Tongue बदलें';
    btn.style.cssText = `
      position: fixed; top: 12px; right: 12px; z-index: 9999;
      background: #ffffff; border: 1.5px solid #2e7d32; color: #1b5e20;
      padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12); cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      transition: all 0.2s ease; font-family: system-ui, sans-serif;
    `;
    btn.innerHTML = `
      <span id="tm-lang-current-label">${match.flag} ${match.label}</span>
      <span style="font-size: 9px; color: #64748b;">▼</span>
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
      btn.style.background = '#e8f5e9';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
      btn.style.background = '#ffffff';
    });
    btn.addEventListener('click', () => {
      showLanguageModal(true);
    });

    document.body.appendChild(btn);
  }

  async function detectLocationAndSetLanguage() {
    const hasPrompted = localStorage.getItem(STORAGE_KEY_PROMPTED);
    if (hasPrompted) {
      // User already has set or confirmed their preferred mother tongue
      const savedLang = getCurrentLang();
      applyLanguage(savedLang, false);
      createFloatingLanguageButton();
      return;
    }

    createFloatingLanguageButton();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('IP response not ok');
      const data = await res.json();

      const region = String(data.region || '').toLowerCase().trim();
      const city = String(data.city || '').toLowerCase().trim();

      let detectedLang = 'hi'; // Default mother tongue is Hindi (zero English compulsion)
      let foundRegionName = '';

      for (const [key, code] of Object.entries(REGION_MAP)) {
        if (region.includes(key) || city.includes(key)) {
          detectedLang = code;
          foundRegionName = data.region || data.city;
          break;
        }
      }

      const matchLang = ALL_LANGUAGES.find(l => l.code === detectedLang) || ALL_LANGUAGES[0];
      applyLanguage(detectedLang, false);
      showToast(`लोकेशन (${foundRegionName || 'भारत'}) अनुसार आपकी मातृभाषा "${matchLang.label}" सेट की गई। 🇮🇳`);
    } catch (e) {
      console.warn('[Location Language Auto-Detect Note]:', e.message);
      // Location could not be fetched! Prompt the customer ONCE politely:
      showLanguageModal(false);
    }
  }

  // Inject CSS animations and hide Google Translate default banner
  const style = document.createElement('style');
  style.textContent = `
    @keyframes tmFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes tmScaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .goog-te-banner-frame.skiptranslate, .goog-te-banner-frame { display: none !important; }
    body { top: 0px !important; }
    #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
    .goog-text-highlight { background: none !important; box-shadow: none !important; }
    .goog-tooltip { display: none !important; }
    .goog-tooltip:hover { display: none !important; }
    .goog-te-spinner-pos { display: none !important; }
    iframe.skiptranslate { display: none !important; }
  `;
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectLocationAndSetLanguage);
  } else {
    detectLocationAndSetLanguage();
  }

  window.openLanguageSelector = () => showLanguageModal(true);
})();
