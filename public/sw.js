self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple offline fallback – serve cached response if available
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
