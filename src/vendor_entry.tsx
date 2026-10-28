import React from 'react';
import ReactDOM from 'react-dom/client';
import { VendorPortalApp } from '../management/vendor/vendor_portal_app';

// Ensure Title and Meta for Vendor Partner Portal
if (typeof document !== 'undefined') {
  document.title = 'NOV TIFFIN – Vendor Partner Portal (वेंडर पोर्टल)';
}

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <VendorPortalApp />
    </React.StrictMode>
  );
}
