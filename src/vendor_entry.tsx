import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { VendorPortalApp } from '../management/vendor/vendor_portal_app';
import { OwnerVendorPanel } from '../management/owner/owner_vendor_panel';

function RootApp() {
  const [currentApp, setCurrentApp] = useState<'vendor' | 'owner'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        const appParam = u.searchParams.get('app');
        if (appParam === 'owner' || window.location.pathname.includes('/owner')) {
          return 'owner';
        }
        const saved = localStorage.getItem('tiffin_active_app_mode');
        if (saved === 'owner') return 'owner';
      }
    } catch {}
    return 'vendor';
  });

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (currentApp === 'owner') {
          document.title = 'NOV TIFFIN – मालिक कंट्रोल हब (Owner Panel)';
        } else {
          document.title = 'NOV TIFFIN – Vendor Partner Portal (वेंडर पोर्टल)';
        }
      }
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.set('app', currentApp);
        window.history.replaceState({}, '', u.toString());
        localStorage.setItem('tiffin_active_app_mode', currentApp);
      }
    } catch {}
  }, [currentApp]);

  if (currentApp === 'owner') {
    return <OwnerVendorPanel onSwitchToVendor={() => setCurrentApp('vendor')} />;
  }

  return <VendorPortalApp onSwitchToOwner={() => setCurrentApp('owner')} />;
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <RootApp />
    </React.StrictMode>
  );
}
