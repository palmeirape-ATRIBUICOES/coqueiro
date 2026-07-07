require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildAdded, onChildChanged, get, remove } = require('firebase/database');
const webpush = require('web-push');

// Express App to satisfy Render web service port binding requirement
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'coqueiro-push-gateway' });
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

// VAPID keys setup
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BP7J_touxNd1qY6-ioJIZhNKlJPi6_gnNfRBmkHZqzpCX-xB7JtbM5OU9Z4t1zJ8M2l26rGopNzWyxpw6-oE0VQ';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'v6_RAEHB8o1rEEj9tb9_Dxldd4hC2sjgVgoV_sNBxCc';
const FIREBASE_DB_URL = process.env.FIREBASE_DATABASE_URL || 'https://coqueiro-a586e-default-rtdb.firebaseio.com';

webpush.setVapidDetails(
  'mailto:suporte@casacoqueiro.com.br',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Initialize Firebase Client SDK (No Google Cloud default credentials warning!)
const firebaseConfig = {
  databaseURL: FIREBASE_DB_URL
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

console.log('Casa Coqueiro Real-time Push Gateway Active (Client SDK mode)!');
console.log('Listening to database URL:', FIREBASE_DB_URL);

// Helper: Send Push Notification to all subscriptions of a specific user
const sendPushToUser = async (userCode, payload) => {
  if (!userCode) return;
  try {
    const subsRef = ref(db, `pushSubscriptions/${userCode}`);
    const snapshot = await get(subsRef);
    const subs = snapshot.val();
    if (!subs) {
      console.log(`[Push] No subscriptions found for user Code: ${userCode}`);
      return;
    }

    const subKeys = Object.keys(subs);
    console.log(`[Push] Sending push to user: ${userCode} on ${subKeys.length} device(s)`);

    const deadKeys = [];
    const promises = subKeys.map(async (key) => {
      const sub = subs[key];
      if (!sub || !sub.endpoint || !sub.keys) return;

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        console.log(`[Push] Notification sent to device ${key} for user ${userCode}`);
      } catch (err) {
        console.error(`[Push] Error sending push to device ${key} for user ${userCode}: status=${err.statusCode}, msg=${err.message}`);
        // Clean up expired/invalid subscription tokens (HTTP status 410 Gone / 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadKeys.push(key);
        }
      }
    });

    await Promise.all(promises);

    if (deadKeys.length > 0) {
      console.log(`[Push] Removing ${deadKeys.length} dead/expired subscription(s) for user ${userCode}`);
      const removePromises = deadKeys.map(key => remove(ref(db, `pushSubscriptions/${userCode}/${key}`)));
      await Promise.all(removePromises);
    }
  } catch (err) {
    console.error(`[Push] Critical error in sendPushToUser for user ${userCode}:`, err);
  }
};

// Start Date offset to prevent notifying on historical items during startup connection
const gatewayStartTime = Date.now();

// 1. Listen to New Orders
onChildAdded(ref(db, 'orders'), async (snapshot) => {
  const order = snapshot.val();
  if (!order) return;

  // Skip orders created before the gateway started or older than 5 minutes
  const orderDate = new Date(order.date).getTime();
  if (orderDate < gatewayStartTime - 2 * 60 * 1000) {
    return;
  }

  console.log(`[New Order] Detected: ${order.id} for company ${order.companyId}`);

  try {
    // Retrieve users list to find sellers of this company
    const usersSnapshot = await get(ref(db, 'users'));
    const usersObj = usersSnapshot.val();
    if (!usersObj) return;

    const users = Array.isArray(usersObj) ? usersObj : Object.values(usersObj);
    const sellersToNotify = users.filter(u => 
      u &&
      u.companyId === order.companyId && 
      (u.role === 'vendedor' || u.role === 'store-admin' || u.role === 'gestor')
    );

    console.log(`[New Order] Notifying ${sellersToNotify.length} staff member(s)...`);

    const payload = {
      title: 'Novo Orçamento Recebido! 📥',
      body: `Cliente ${order.clientName} enviou um orçamento no valor de R$ ${Number(order.total || 0).toFixed(2)}`,
      tag: `new-order-${order.id}`,
      data: {
        url: `/#/admin`
      }
    };

    sellersToNotify.forEach(seller => {
      sendPushToUser(seller.code, payload);
    });
  } catch (err) {
    console.error('[New Order] Notification loop failed:', err);
  }
});

// 2. Listen to Order Changes (Status Updates)
onChildChanged(ref(db, 'orders'), async (snapshot) => {
  const order = snapshot.val();
  if (!order) return;

  console.log(`[Order Update] Detected: ${order.id} status changed to ${order.status}`);

  try {
    const payload = {
      title: 'Atualização do seu Orçamento! 🛍️',
      body: `O status do orçamento #${order.id} mudou para: ${order.status}`,
      tag: `order-status-${order.id}`,
      data: {
        url: `/#/checkout`
      }
    };

    sendPushToUser(order.clientCode, payload);
  } catch (err) {
    console.error('[Order Update] Notification failed:', err);
  }
});

// 3. Listen to New Messages (In-App Support Chat)
onChildAdded(ref(db, 'messages'), async (snapshot) => {
  const message = snapshot.val();
  if (!message) return;

  // Skip messages sent before gateway startup or older than 5 minutes
  if (message.timestamp < gatewayStartTime - 2 * 60 * 1000) {
    return;
  }

  console.log(`[New Message] Detected: from ${message.senderName} (${message.sender}) to recipient ${message.recipient}`);

  try {
    const payload = {
      title: `Nova Mensagem! 💬`,
      body: `${message.senderName}: ${message.text}`,
      tag: `msg-${message.id || Date.now()}`,
      data: {
        url: message.sender === 'cliente' ? `/#/admin` : `/#/store`
      }
    };

    sendPushToUser(message.recipient, payload);
  } catch (err) {
    console.error('[New Message] Notification failed:', err);
  }
});
