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

// Active User Session for background polling
let activeUser = null;
let lastOrders = null;
let lastMessagesCount = null;
let pollingInterval = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_USER_SESSION') {
    activeUser = event.data.user;
    lastOrders = null;
    lastMessagesCount = null;
    
    // Start background sync polling loop
    startBackgroundSync();
  }
});

function startBackgroundSync() {
  if (pollingInterval) clearInterval(pollingInterval);
  
  // Poll every 15 seconds
  pollingInterval = setInterval(() => {
    if (!activeUser) return;
    performBackgroundChecks();
  }, 15000);
  
  // Trigger immediately
  performBackgroundChecks();
}

async function performBackgroundChecks() {
  if (!activeUser) return;
  const dbUrl = "https://coqueiro-a586e-default-rtdb.firebaseio.com";
  
  try {
    // 1. Check Orders
    const ordersRes = await fetch(`${dbUrl}/orders.json`);
    if (ordersRes.ok) {
      const allOrdersObj = await ordersRes.json();
      if (allOrdersObj) {
        const allOrders = Array.isArray(allOrdersObj) ? allOrdersObj : Object.values(allOrdersObj);
        const tenantOrders = allOrders.filter(o => o && o.companyId === activeUser.companyId);
        
        if (activeUser.role === 'cliente') {
          // Client: Check for status changes on their orders
          const myOrders = tenantOrders.filter(o => o.clientCode === activeUser.code);
          if (lastOrders) {
            myOrders.forEach(newOrd => {
              const oldOrd = lastOrders.find(o => o.id === newOrd.id);
              if (oldOrd && oldOrd.status !== newOrd.status) {
                showSwNotification(
                  `Orçamento Atualizado! 🛍️`,
                  `O status do orçamento #${newOrd.id} mudou para: ${newOrd.status}`,
                  `order-${newOrd.id}`
                );
              }
            });
          }
          lastOrders = myOrders;
        } else {
          // Seller / Admin: Check for new incoming orders
          if (lastOrders && tenantOrders.length > lastOrders.length) {
            const diff = tenantOrders.length - lastOrders.length;
            showSwNotification(
              `Novo Orçamento! 📥`,
              `Você recebeu ${diff} novo(s) orçamento(s) de clientes.`,
              'new-order'
            );
          }
          lastOrders = tenantOrders;
        }
      }
    }
    
    // 2. Check Messages / Support Chat
    const msgsRes = await fetch(`${dbUrl}/messages.json`);
    if (msgsRes.ok) {
      const allMsgsObj = await msgsRes.json();
      if (allMsgsObj) {
        const allMsgs = Array.isArray(allMsgsObj) ? allMsgsObj : Object.values(allMsgsObj);
        const tenantMsgs = allMsgs.filter(m => m && m.companyId === activeUser.companyId);
        
        let myMsgs = [];
        if (activeUser.role === 'cliente') {
          // Client messages
          myMsgs = tenantMsgs.filter(m => m.clientCode === activeUser.code);
        } else {
          // Seller sees all messages
          myMsgs = tenantMsgs;
        }
        
        if (lastMessagesCount !== null && myMsgs.length > lastMessagesCount) {
          const lastMsg = myMsgs[myMsgs.length - 1];
          // Only notify if message was sent by the opposite side
          const shouldNotify = (activeUser.role === 'cliente' && lastMsg.sender === 'vendedor') ||
                               (activeUser.role !== 'cliente' && lastMsg.sender === 'cliente');
                               
          if (shouldNotify) {
            showSwNotification(
              `Nova Mensagem! 💬`,
              `${lastMsg.senderName}: ${lastMsg.text}`,
              `msg-${lastMsg.id}`
            );
          }
        }
        lastMessagesCount = myMsgs.length;
      }
    }
  } catch (e) {
    console.warn('[SW Background Check Error]:', e);
  }
}

function showSwNotification(title, body, tag) {
  let isIOS = false;
  try {
    const ua = (self.navigator && self.navigator.userAgent) || '';
    isIOS = /iPad|iPhone|iPod/.test(ua) || 
            (ua.includes('Macintosh') && self.navigator && self.navigator.maxTouchPoints > 0);
  } catch (e) {}

  const options = {
    body,
    tag,
    data: { url: './' }
  };

  if (!isIOS) {
    options.icon = './logo.png';
    options.badge = './logo.png';
    options.vibrate = [200, 100, 200];
  }

  self.registration.showNotification(title, options).catch(err => {
    console.warn('[SW Background Notification failed]:', err);
  });
}
