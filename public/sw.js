// Service Worker for TiffinMate Customer App
const CACHE_VERSION = 'tiffinmate-v-20261007-v8';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge all legacy caches so no stale scripts ever break the app
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', () => {
  // Pass all network requests directly to the server - completely avoids blank screen / stale asset traps
  return;
});

