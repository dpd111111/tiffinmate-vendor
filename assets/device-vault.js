// =========================================================================
// TiffinMate 4-Layer Permanent Device Vault
// Device-Reset Resistant Storage for Uninterrupted Customer Login
// =========================================================================

(function () {
  // Prevent double installation if script runs multiple times
  if (window.__TIFFIN_VAULT_INSTALLED__) {
    return;
  }
  window.__TIFFIN_VAULT_INSTALLED__ = true;

  const DB_NAME = 'TiffinPermanentVault';
  const DB_VERSION = 1;
  const STORE_NAME = 'auth_session';
  const KEY_NAME = 'active_customer';
  const COOKIE_NAME = 'tiffin_perm_vault';

  let persistenceRequested = false;
  let isInternalSync = false;

  // Cache native Storage prototype methods directly - immune to monkeypatching recursion
  const rawProto = window.Storage ? window.Storage.prototype : null;
  const rawSetItem = (rawProto && rawProto.setItem) ? rawProto.setItem : null;
  const rawRemoveItem = (rawProto && rawProto.removeItem) ? rawProto.removeItem : null;
  const rawGetItem = (rawProto && rawProto.getItem) ? rawProto.getItem : null;

  function safeStorageGet(key) {
    try {
      if (rawGetItem && window.localStorage) {
        return rawGetItem.call(window.localStorage, key);
      }
    } catch (_) {}
    return null;
  }

  function safeStorageSet(key, val) {
    try {
      if (rawSetItem && window.localStorage) {
        rawSetItem.call(window.localStorage, key, val);
      }
    } catch (_) {}
  }

  function safeStorageRemove(key) {
    try {
      if (rawRemoveItem && window.localStorage) {
        rawRemoveItem.call(window.localStorage, key);
      }
    } catch (_) {}
  }

  // Request browser storage persistence so data is never evicted on low memory
  function requestStoragePersistence() {
    if (persistenceRequested) return;
    persistenceRequested = true;
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(granted => {
          if (granted) {
            console.log('[Tiffin Vault] Browser storage persistence granted.');
          }
        }).catch(() => {});
      }
    } catch (_) {}
  }

  // Open IndexedDB
  function openVaultDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        return resolve(null);
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  // Save to IndexedDB
  async function saveToIndexedDB(user) {
    try {
      const db = await openVaultDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(user, KEY_NAME);
    } catch (_) {}
  }

  // Read from IndexedDB
  async function readFromIndexedDB() {
    try {
      const db = await openVaultDB();
      if (!db) return null;
      return new Promise(resolve => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(KEY_NAME);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    }
  }

  // Delete from IndexedDB
  async function clearIndexedDB() {
    try {
      const db = await openVaultDB();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(KEY_NAME);
    } catch (_) {}
  }

  // 10-Year Permanent Cookie Helper
  function saveToCookie(user) {
    try {
      const serialized = encodeURIComponent(JSON.stringify(user));
      const maxAge = 315360000; // 10 years in seconds
      document.cookie = `${COOKIE_NAME}=${serialized}; max-age=${maxAge}; path=/; SameSite=Lax;`;
      if (window.location && window.location.hostname) {
        document.cookie = `${COOKIE_NAME}=${serialized}; domain=.${window.location.hostname}; max-age=${maxAge}; path=/; SameSite=Lax;`;
      }
    } catch (_) {}
  }

  function readFromCookie() {
    try {
      const cookies = document.cookie.split(';');
      for (const c of cookies) {
        const trimmed = c.trim();
        if (trimmed.startsWith(COOKIE_NAME + '=')) {
          const val = decodeURIComponent(trimmed.substring(COOKIE_NAME.length + 1));
          return JSON.parse(val);
        }
      }
    } catch (_) {}
    return null;
  }

  function clearCookie() {
    try {
      document.cookie = `${COOKIE_NAME}=; max-age=0; path=/;`;
      if (window.location && window.location.hostname) {
        document.cookie = `${COOKIE_NAME}=; domain=.${window.location.hostname}; max-age=0; path=/;`;
      }
    } catch (_) {}
  }

  // Public Vault API
  window.TiffinVault = {
    saveUser: async function (user) {
      if (!user || user.id === 'guest_user') return;
      if (isInternalSync) return;
      isInternalSync = true;
      try {
        requestStoragePersistence();
        safeStorageSet('tiffin_current_user', JSON.stringify(user));
        safeStorageSet('tiffin_perm_vault_backup', JSON.stringify(user));
        saveToCookie(user);
        await saveToIndexedDB(user);
      } finally {
        isInternalSync = false;
      }
    },

    clearUser: async function () {
      if (isInternalSync) return;
      isInternalSync = true;
      try {
        safeStorageRemove('tiffin_current_user');
        safeStorageRemove('tiffin_perm_vault_backup');
        clearCookie();
        await clearIndexedDB();
      } finally {
        isInternalSync = false;
      }
    },

    restoreIfMissing: async function () {
      if (isInternalSync) return null;
      try {
        const local = safeStorageGet('tiffin_current_user');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.id && parsed.id !== 'guest_user') {
            // Already active; sync other layers safely
            saveToCookie(parsed);
            saveToIndexedDB(parsed);
            return parsed;
          }
        }
      } catch (_) {}

      // Check Layer 2: Cookie
      const fromCookie = readFromCookie();
      if (fromCookie && fromCookie.id && fromCookie.id !== 'guest_user') {
        console.log('[Tiffin Vault] Restored permanent session from 10-year Cookie.');
        window.TiffinVault.saveUser(fromCookie);
        return fromCookie;
      }

      // Check Layer 3: IndexedDB
      const fromIDB = await readFromIndexedDB();
      if (fromIDB && fromIDB.id && fromIDB.id !== 'guest_user') {
        console.log('[Tiffin Vault] Restored permanent session from deep IndexedDB.');
        window.TiffinVault.saveUser(fromIDB);
        return fromIDB;
      }

      // Check Layer 4: Local backup key
      try {
        const backup = safeStorageGet('tiffin_perm_vault_backup');
        if (backup) {
          const parsed = JSON.parse(backup);
          if (parsed && parsed.id && parsed.id !== 'guest_user') {
            window.TiffinVault.saveUser(parsed);
            return parsed;
          }
        }
      } catch (_) {}

      return null;
    }
  };

  // Immediate synchronous & asynchronous restore attempt on script load
  window.TiffinVault.restoreIfMissing();

  // Monkey-patch localStorage.setItem safely without reentrancy
  if (window.localStorage && rawSetItem) {
    const originalSet = window.localStorage.setItem;
    window.localStorage.setItem = function (key, value) {
      // Call raw prototype method directly
      rawSetItem.call(this, key, value);
      if (!isInternalSync && key === 'tiffin_current_user') {
        try {
          const user = JSON.parse(value);
          if (user && user.id && user.id !== 'guest_user') {
            window.TiffinVault.saveUser(user);
          } else if (user && user.id === 'guest_user') {
            window.TiffinVault.clearUser();
          }
        } catch (_) {}
      }
    };
  }
})();
