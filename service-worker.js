const CACHE_NAME = 'pwa-install-demo-v4';
const BASE_PATH = '/pwa-check/';
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'index2.html',
  BASE_PATH + 'app.webmanifest',
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Only handle requests from our own origin
  if (requestUrl.origin !== location.origin) {
    return;
  }
  
  // For navigation requests, serve index2.html when the app is installed
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(BASE_PATH + 'index2.html').then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        // Cache the fetched response for future visits
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Update the service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
