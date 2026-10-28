// =========================================================================
// Dynamic Google Maps Script Loader
// Loads Google Maps JavaScript API safely via server-side configuration
// Supports environment variable override & HTTP Referrer security policies
// =========================================================================

(function () {
  'use strict';

  if (window.__GOOGLE_MAPS_LOADER_INITIALIZED__) {
    return;
  }
  window.__GOOGLE_MAPS_LOADER_INITIALIZED__ = true;

  async function loadGoogleMaps() {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      return;
    }

    let apiKey = '';
    let libraries = 'places,geometry,marker';

    try {
      const res = await fetch('/api/config/maps');
      if (res.ok) {
        const data = await res.json();
        if (data && data.key) {
          apiKey = data.key;
          if (data.libraries) libraries = data.libraries;
        }
      }
    } catch (_) {
      // Fallback in case of offline/network glitch
    }

    if (!apiKey) {
      apiKey = 'AIzaSyBNOOCxQ9wNDxWpPR36FoezaWpIEbRipR4';
    }

    // Check if script element already exists
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=${libraries}&loading=async`;
    script.onerror = () => {
      console.warn('[MapsLoader] Google Maps script failed to load. Please verify HTTP Referrer restrictions in Google Cloud Console.');
    };

    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGoogleMaps);
  } else {
    loadGoogleMaps();
  }
})();
