// Service Worker for Casa Coqueiro PWA / SaaS
const CACHE_NAME = 'coqueiro-cache-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.png',
  './logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache pre-fill warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch events: Network first, cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notifications receiver
self.addEventListener('push', (event) => {
  let data = { title: 'Casa Coqueiro', body: 'Atualização recebida!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.warn('[SW] Push text message fallback:', event.data?.text());
    data = { title: 'Casa Coqueiro', body: event.data?.text() || 'Novidade no painel!' };
  }

  let isIOS = false;
  try {
    const ua = (self.navigator && self.navigator.userAgent) || '';
    isIOS = /iPad|iPhone|iPod/.test(ua) || 
            (ua.includes('Macintosh') && self.navigator && self.navigator.maxTouchPoints > 0);
  } catch (e) {}

  const options = {
    body: data.body,
    tag: data.tag || 'coqueiro-order-alert',
    data: data.data || {}
  };

  // Only apply rich visual actions on non-iOS browsers to avoid silent failures on Apple devices
  if (!isIOS) {
    options.icon = './logo.png';
    options.badge = './logo.png';
    options.vibrate = [200, 100, 200];
    options.requireInteraction = true;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options).catch((err) => {
      console.warn('[SW] High compatibility notification fallback:', err);
      return self.registration.showNotification(data.title, {
        body: data.body,
        tag: data.tag || 'coqueiro-order-alert'
      });
    })
  );
});

// On notification click, open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) client.navigate(targetUrl);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
