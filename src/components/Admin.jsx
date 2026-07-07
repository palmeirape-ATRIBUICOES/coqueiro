import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';
import {  
  getCompanies, saveCompanies, 
  getUsers, saveUsers, 
  getProducts, saveProducts, 
  getOrders, saveOrders,
  getMessages, saveMessages,
  syncFromCloud
} from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { 
  Settings, Users, ShoppingBag, ClipboardList, Plus, Trash2, Edit2, ArrowLeft, 
  Save, AlertCircle, Printer, Shield, BarChart3, Store 
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { company, reloadBranding } = useWhitelabel();

  const [currentUser, setCurrentUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const addToast = (msg) => {
    setToasts(prev => [...prev, { id: Date.now(), message: msg }]);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showNativeNotification = (title, body, tag) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
                  (ua.includes('Macintosh') && navigator.maxTouchPoints > 0);

    const options = {
      body,
      tag,
      data: { url: window.location.href }
    };

    if (!isIOS) {
      options.icon = './logo.png';
      options.badge = './logo.png';
      options.vibrate = [200, 100, 200];
    }

    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options).catch(err => {
          console.warn('[SW] showNotification fallback:', err);
          reg.showNotification(title, { body, tag });
        });
      });
    } else {
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn('new Notification failed', e);
      }
    }
  };

  const savePushSubscriptionToFirebase = async (userCode, subscription) => {
    const dbUrl = localStorage.getItem("firebase_db_url") || "https://coqueiro-a586e-default-rtdb.firebaseio.com";
    const endpointSafe = btoa(subscription.endpoint).replace(/[^a-zA-Z0-9]/g, '');
    const url = `${dbUrl}/pushSubscriptions/${userCode}/${endpointSafe}.json`;
    try {
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });
      console.log('[Push] Subscription saved successfully for:', userCode);
    } catch (e) {
      console.error('[Push] Error saving subscription:', e);
    }
  };

  const registerPushSubscription = async (user) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      
      // Force service worker update to bypass caching of push handlers
      try {
        await reg.update();
      } catch (err) {
        console.warn('[Push] reg.update failed:', err);
      }

      const publicKey = "BP7J_touxNd1qY6-ioJIZhNKlJPi6_gnNfRBmkHZqzpCX-xB7JtbM5OU9Z4t1zJ8M2l26rGopNzWyxpw6-oE0VQ";
      const urlBase64ToUint8 = (base64) => {
        const pad = '='.repeat((4 - base64.length % 4) % 4);
        const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(b64);
        return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
      };

      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe().catch(() => {});
      }

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8(publicKey)
      });

      await savePushSubscriptionToFirebase(user.code, sub);
    } catch (err) {
      console.warn('[Push] Error registering push subscription:', err);
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          showNativeNotification('Casa Coqueiro', 'Notificações ativadas com sucesso! 🎉', 'setup-success');
          if (currentUser) {
            registerPushSubscription(currentUser);
          }
        }
      });
    }
  };
  const prevOrdersCountRef = useRef(0);
  const prevMessagesCountRef = useRef(0);
  const [notificationPermission, setNotificationPermission] = useState('Notification' in window ? Notification.permission : 'denied');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Global DB states
  const [companies, setCompanies] = useState({});
  const [users, setUsers] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChatClient, setSelectedChatClient] = useState(null);
  const [adminNewMessage, setAdminNewMessage] = useState('');

  // Admin Master specific form states
  const [newCompany, setNewCompany] = useState({
    id: '', name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
    primaryColor: '#059669', secondaryColor: '#eab308', accentColor: '#ef4444',
    address: '', phone: '', whatsapp: '', hours: '08:00 às 18:00'
  });
  const [newGlobalUser, setNewGlobalUser] = useState({
    code: '', name: '', role: 'store-admin', status: 'Active', companyId: ''
  });

  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'admin-master') return;

    const companyId = newCompany.id.trim().toLowerCase().replace(/\s+/g, '-');
    if (!companyId) {
      showError('Identificador da empresa inválido.');
      return;
    }

    if (companies[companyId]) {
      showError('Já existe uma empresa cadastrada com este identificador.');
      return;
    }

    const updatedCompanies = {
      ...companies,
      [companyId]: {
        ...newCompany,
        id: companyId
      }
    };

    saveCompanies(updatedCompanies);
    setCompanies(updatedCompanies);
    showSuccess(`Empresa "${newCompany.name}" cadastrada com sucesso!`);
    
    // Reset form
    setNewCompany({
      id: '', name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
      primaryColor: '#059669', secondaryColor: '#eab308', accentColor: '#ef4444',
      address: '', phone: '', whatsapp: '', hours: '08:00 às 18:00'
    });
  };

  const handleCreateGlobalUser = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'admin-master') return;

    const code = newGlobalUser.code.trim().toUpperCase();
    if (code.length !== 5) {
      showError('O código deve conter exatamente 5 caracteres.');
      return;
    }

    if (users[code]) {
      showError('Código de acesso já está em uso.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        ...newGlobalUser,
        code,
        companyId: newGlobalUser.role === 'admin-master' ? null : newGlobalUser.companyId,
        permissions: newGlobalUser.role === 'store-admin' ? null : {
          financeiro: true, produtos: true, precos: true, clientes: true,
          funcionarios: true, relatorios: true, impressao: true, visualConfig: true,
          estoque: true, usuarios: true
        }
      }
    };

    // Persist new user locally and sync to cloud
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(`Usuário ${newGlobalUser.name} cadastrado com código "${code}"`);

    // Reset form fields
    setNewGlobalUser({
      code: '', name: '', role: 'store-admin', status: 'Active', companyId: ''
    });
  };

  // Store Admin / Staff specific CRUD states
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: ''
  });

  const [newClient, setNewClient] = useState({
    name: '', phone: '', code: ''
  });
  const [editingClient, setEditingClient] = useState(null);

  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    code: '', name: '', role: 'vendedor', status: 'Active',
    permissions: {
      financeiro: false, produtos: false, precos: false, clientes: true,
      funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
      estoque: false, usuarios: false
    }
  });

  const [storeConfig, setStoreConfig] = useState({
    name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
    primaryColor: '#000000', secondaryColor: '#000000', accentColor: '#000000',
    address: '', phone: '', whatsapp: '', hours: ''
  });

  const [firebaseUrl, setFirebaseUrl] = useState(localStorage.getItem("firebase_db_url") || '');

  // Resilient Multi-Proxy Google Image Search (DuckDuckGo Backend)
  const [searchingImages, setSearchingImages] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [showImageSearchModal, setShowImageSearchModal] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');

  // Print Order data state
  const [activePrintOrder, setActivePrintOrder] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printFormat, setPrintFormat] = useState('A4'); // 'A4', '80mm', '60mm'
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [visibleProductsCount, setVisibleProductsCount] = useState(30);
  const [productSearch, setProductSearch] = useState('');

  // Load database
  const loadDbData = () => {
    setCompanies(getCompanies());
    setUsers(getUsers());
    setProducts(getProducts());
    setOrders(getOrders());
    setMessages(getMessages());
  };

  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.6, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.3); // C5
      playTone(659.25, 0.12, 0.3); // E5
      playTone(783.99, 0.24, 0.4); // G5
    } catch (e) {
      console.warn("AudioContext tone playback failed:", e);
    }
  };

  useEffect(() => {
    const currentOrders = getOrders();
    prevOrdersCountRef.current = currentOrders.length;
  }, []);

  useEffect(() => {
    if (currentUser && navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_USER_SESSION',
        user: { code: currentUser.code, role: currentUser.role, companyId: currentUser.companyId }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'facilitadora_orders') {
        const nextOrders = getOrders();
        if (nextOrders.length > prevOrdersCountRef.current) {
          const diff = nextOrders.length - prevOrdersCountRef.current;
          addToast(`Você recebeu ${diff} novo(s) orçamento(s)!`);
        }
        prevOrdersCountRef.current = nextOrders.length;
        setOrders(nextOrders);
      }
      if (e.key === 'facilitadora_products') {
        setProducts(getProducts());
      }
      if (e.key === 'facilitadora_users') {
        setUsers(getUsers());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Periodically pull database values from Firebase to sync in real-time
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      syncFromCloud().then(() => {
        const nextOrders = getOrders();
        if (nextOrders.length > prevOrdersCountRef.current) {
          const diff = nextOrders.length - prevOrdersCountRef.current;
          addToast(`Você recebeu ${diff} novo(s) orçamento(s)!`);
          showNativeNotification('Novo Orçamento! 📥', `Você recebeu ${diff} novo(s) orçamento(s) de clientes.`, 'new-order');
          
          const latestOrder = nextOrders[nextOrders.length - 1];
          if (latestOrder) {
            setNewOrderAlert(latestOrder);
            playAlertChime();
          }
        }
        prevOrdersCountRef.current = nextOrders.length;
        setOrders(nextOrders);

        // Check for new chat messages from clients
        const nextMessages = getMessages();
        const companyMessages = nextMessages.filter(m => currentUser.companyId ? m.companyId === currentUser.companyId : true);
        const prevMessagesCount = prevMessagesCountRef.current;
        if (prevMessagesCount > 0 && companyMessages.length > prevMessagesCount) {
          const newMsgs = companyMessages.slice(prevMessagesCount).filter(m => m.sender === 'cliente');
          if (newMsgs.length > 0) {
            const latestMsg = newMsgs[newMsgs.length - 1];
            addToast(`Nova mensagem de ${latestMsg.senderName}: "${latestMsg.text}"`);
            showNativeNotification(`Nova mensagem de ${latestMsg.senderName}! 💬`, latestMsg.text, `msg-${latestMsg.id}`);
            playAlertChime();
          }
        }
        prevMessagesCountRef.current = companyMessages.length;
        setMessages(nextMessages);

        setUsers(getUsers());
        setProducts(getProducts());
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Reset pagination limit when switching tabs or searching
  useEffect(() => {
    setVisibleProductsCount(30);
  }, [activeTab, productSearch]);

  // Infinite scroll listener for products table list
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab === 'products') {
        const threshold = 350;
        const position = window.innerHeight + window.scrollY;
        const height = document.documentElement.scrollHeight;
        if (position >= height - threshold) {
          setVisibleProductsCount(prev => prev + 30);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  useEffect(() => {
    // 1. Authenticate user
    const storedUser = localStorage.getItem('coqueiro_active_merchant');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem('coqueiro_active_merchant');
      navigate('/login');
      return;
    }
    if (!user || user.role === 'cliente') {
      navigate('/');
      return;
    }
    setCurrentUser(user);

    if ('Notification' in window && Notification.permission === 'granted') {
      registerPushSubscription(user);
    }

    // 2. Load DB values (offline cache first)
    const allCompanies = getCompanies();
    setCompanies(allCompanies);
    setUsers(getUsers());
    setProducts(getProducts());
    
    const initialOrders = getOrders();
    prevOrdersCountRef.current = initialOrders.length;
    setOrders(initialOrders);

    const initialMessages = getMessages();
    const companyMessages = initialMessages.filter(m => user.companyId ? m.companyId === user.companyId : true);
    prevMessagesCountRef.current = companyMessages.length;
    setMessages(initialMessages);

    // 2.1. Sync from Firebase in background and reload state
    syncFromCloud().then(() => {
      const freshCompanies = getCompanies();
      setCompanies(freshCompanies);
      setUsers(getUsers());
      setProducts(getProducts());
      const syncedOrders = getOrders();
      prevOrdersCountRef.current = syncedOrders.length;
      setOrders(syncedOrders);
      if (user.companyId && freshCompanies[user.companyId]) {
        setStoreConfig({ ...freshCompanies[user.companyId] });
      }
    });

    // 3. Set default configs if user has a store
    if (user.companyId && allCompanies[user.companyId]) {
      setStoreConfig({ ...allCompanies[user.companyId] });
      setNewGlobalUser(prev => ({ ...prev, companyId: user.companyId }));
    }

    // 4. Resolve default active tab based on role & permissions
    if (user.role === 'admin-master') {
      setActiveTab('dashboard-master');
    } else {
      // Determine what tabs are available
      const tabs = [];
      const hasDashboard = user.role === 'store-admin' || user.permissions?.financeiro || user.permissions?.relatorios;
      const hasProducts = user.role === 'store-admin' || user.permissions?.produtos;
      const hasClients = user.role === 'store-admin' || user.permissions?.clientes;
      const hasStaff = user.role === 'store-admin' || user.permissions?.funcionarios;
      const hasSettings = user.role === 'store-admin' || user.permissions?.visualConfig;

      if (hasDashboard) tabs.push('dashboard');
      tabs.push('orders'); // Orders is always open as base backoffice workflow
      if (hasProducts) tabs.push('products');
      if (hasClients) tabs.push('clients');
      if (hasStaff) tabs.push('staff');
      if (hasSettings) tabs.push('settings');

      // Always start at home card dashboard
      setActiveTab('home');
    }
  }, [navigate]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('coqueiro_active_merchant');
    navigate('/login');
  };

  // Check custom permission for actions
  const checkPermission = (actionType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'store-admin' || currentUser.role === 'admin-master') return true;
    return !!currentUser.permissions?.[actionType];
  };

  // --- ACTIONS: ADMIN MASTER ---

  const handleDeleteUser = (code) => {
    if (code === currentUser.code) {
      showError('Você não pode excluir sua própria conta.');
      return;
    }
    if (confirm(`Deseja realmente remover o usuário "${code}"?`)) {
      const updated = { ...users };
      delete updated[code];
      saveUsers(updated);
      setUsers(updated);
      showSuccess('Usuário removido.');
    }
  };

  // --- ACTIONS: STORE ADMIN & STAFF ---

  // Order status update
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    saveOrders(updated);
    setOrders(updated);
    showSuccess(`Orçamento ${orderId} atualizado para "${newStatus}".`);
    // Notify vendor of status change
    addToast(`Orçamento ${orderId} foi alterado para "${newStatus}".`);
  };

  const handleDeleteOrder = (orderId) => {
    if (!confirm(`Tem certeza de que deseja excluir o orçamento ${orderId}?`)) {
      return;
    }
    const updated = orders.filter(ord => ord.id !== orderId);
    saveOrders(updated);
    setOrders(updated);
    showSuccess(`Orçamento ${orderId} excluído com sucesso.`);
  };

  // Print Order Action
  const triggerPrintOrder = (ord) => {
    if (!checkPermission('impressao')) {
      showError('Você não tem permissão para imprimir pedidos.');
      return;
    }
    setActivePrintOrder(ord);
    setShowPrintModal(true);
  };

  // Product actions
  const handleAddOrEditProduct = (e) => {
    e.preventDefault();
    if (!checkPermission('produtos')) {
      showError('Você não possui permissão para cadastrar/editar produtos.');
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showError('Preço unitário inválido.');
      return;
    }

    // Permission checks for values
    const finalPrice = checkPermission('precos') ? priceNum : (editingProduct ? editingProduct.price : 0);
    const finalStock = checkPermission('estoque') ? stockNum : (editingProduct ? editingProduct.stock : 0);

    let updatedProducts = [...products];

    if (editingProduct) {
      updatedProducts = updatedProducts.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code: newProduct.code,
            description: newProduct.description,
            category: newProduct.category,
            brand: newProduct.brand,
            unit: newProduct.unit,
            price: finalPrice,
            stock: finalStock,
            imageUrl: newProduct.imageUrl
          };
        }
        return p;
      });
      showSuccess('Produto atualizado!');
    } else {
      const pId = `prod-${Date.now()}`;
      const productToAdd = {
        id: pId,
        code: newProduct.code || `PROD-${Math.floor(100 + Math.random() * 900)}`,
        description: newProduct.description,
        category: newProduct.category,
        brand: newProduct.brand || 'Marca Própria',
        unit: newProduct.unit,
        price: finalPrice,
        stock: finalStock || 100,
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
        companyId: currentUser.companyId
      };
      updatedProducts = [productToAdd, ...updatedProducts];
      showSuccess('Produto adicionado ao catálogo!');
    }

    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    
    // Clear Form
    setNewProduct({
      code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: ''
    });
    setEditingProduct(null);
  };

  const handleStartEditProduct = (p) => {
    setEditingProduct(p);
    setNewProduct({
      code: p.code,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl
    });
  };

  const handleSearchProductImage = (query) => {
    if (!query || !query.trim()) return;
    setImageSearchQuery(query.trim());
    setShowImageSearchModal(true);
    searchGoogleImages(query.trim());
  };

  const searchGoogleImages = async (queryText) => {
    const fullQuery = encodeURIComponent(queryText + " png fundo branco");
    const searchUrl = `https://duckduckgo.com/?q=${fullQuery}`;
    
    const proxies = [
      url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    setSearchingImages(true);
    setImageResults([]);

    for (let proxyFn of proxies) {
      try {
        const htmlRes = await fetch(proxyFn(searchUrl));
        if (!htmlRes.ok) continue;
        const html = await htmlRes.text();

        const vqdRegex = /vqd=['"]([^'"]+)['"]/;
        const match = html.match(vqdRegex);
        if (!match) continue;
        const vqd = match[1];

        const apiUrl = `https://duckduckgo.com/i.js?q=${fullQuery}&vqd=${vqd}&o=json`;
        const apiRes = await fetch(proxyFn(apiUrl));
        if (!apiRes.ok) continue;
        const data = await apiRes.json();

        if (data.results && data.results.length > 0) {
          const results = data.results.slice(0, 15).map(item => ({
            url: item.image,
            thumbnail: item.thumbnail,
            title: item.title
          }));
          setImageResults(results);
          setSearchingImages(false);
          return;
        }
      } catch (e) {
        console.error("Proxy query failed, trying next fallback...", e);
      }
    }

    setSearchingImages(false);
  };

  const handleDeleteProduct = (id) => {
    if (!checkPermission('produtos')) {
      showError('Você não tem permissão para deletar produtos.');
      return;
    }
    if (confirm('Deseja realmente remover este produto?')) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
      showSuccess('Produto removido do catálogo.');
    }
  };

  const handleInlineProductChange = (productId, field, value) => {
    if (!checkPermission('produtos')) {
      showError('Você não tem permissão para editar produtos.');
      return;
    }
    const updated = products.map(p => {
      if (p.id === productId) {
        const updatedItem = { ...p, [field]: value };
        if (field === 'price' && p.packageItems) {
          updatedItem.packagePrice = parseFloat((value * p.packageItems * 0.95).toFixed(2));
        }
        return updatedItem;
      }
      return p;
    });
    saveProducts(updated);
    setProducts(updated);
  };

  // Client Actions
  const handleAddOrEditClient = (e) => {
    e.preventDefault();
    if (!checkPermission('clientes')) {
      showError('Você não possui permissão para gerenciar clientes.');
      return;
    }

    const code = newClient.code.trim().toUpperCase();
    if (!/^[A-Z]{5,10}$/.test(code)) {
      showError('O código de acesso do cliente deve conter entre 5 e 10 letras (A-Z).');
      return;
    }

    if (!editingClient && users[code]) {
      showError('Código de acesso já está cadastrado.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        code,
        name: newClient.name,
        role: 'cliente',
        status: 'Active',
        companyId: currentUser.companyId,
        phone: newClient.phone
      }
    };

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(editingClient ? `Cliente "${newClient.name}" atualizado!` : `Cliente "${newClient.name}" cadastrado! Código: ${code}`);

    setNewClient({ name: '', phone: '', code: '' });
    setEditingClient(null);
  };

  const handleStartEditClient = (cli) => {
    setEditingClient(cli);
    setNewClient({
      name: cli.name,
      phone: cli.phone || '',
      code: cli.code
    });
  };

  const handleDeleteClient = (code) => {
    if (!checkPermission('clientes')) {
      showError('Você não possui permissão para deletar clientes.');
      return;
    }
    if (confirm(`Deseja realmente remover o cliente com código "${code}"?`)) {
      const updated = { ...users };
      delete updated[code];
      saveUsers(updated);
      setUsers(updated);
      showSuccess('Cliente removido com sucesso.');
    }
  };

  const generateRandomClientCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (users[code]) {
      generateRandomClientCode();
    } else {
      setNewClient(prev => ({ ...prev, code }));
    }
  };

  // Staff & Permissions Actions
  const handleAddOrEditStaff = (e) => {
    e.preventDefault();
    if (!checkPermission('funcionarios')) {
      showError('Você não possui permissão para gerenciar funcionários.');
      return;
    }

    const code = newStaff.code.trim().toUpperCase();
    if (code.length !== 5) {
      showError('Código deve ter exatamente 5 caracteres.');
      return;
    }

    if (!editingStaff && users[code]) {
      showError('Este código de acesso já está em uso.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        code,
        name: newStaff.name,
        role: newStaff.role,
        status: newStaff.status,
        companyId: currentUser.companyId,
        permissions: newStaff.permissions
      }
    };

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(editingStaff ? 'Funcionário atualizado!' : 'Funcionário registrado com sucesso!');

    setNewStaff({
      code: '', name: '', role: 'vendedor', status: 'Active',
      permissions: {
        financeiro: false, produtos: false, precos: false, clientes: true,
        funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
        estoque: false, usuarios: false
      }
    });
    setEditingStaff(null);
  };

  const handleDeleteStaff = () => {
    if (!editingStaff) return;
    if (!checkPermission('funcionarios')) {
      showError('Você não possui permissão para gerenciar funcionários.');
      return;
    }
    if (editingStaff.code === currentUser.code) {
      showError('Você não pode excluir o seu próprio usuário!');
      return;
    }
    if (!confirm(`Tem certeza de que deseja excluir o funcionário ${editingStaff.name}?`)) {
      return;
    }
    const updatedUsers = { ...users };
    delete updatedUsers[editingStaff.code];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess('Funcionário excluído com sucesso!');
    setNewStaff({
      code: '', name: '', role: 'vendedor', status: 'Active',
      permissions: {
        financeiro: false, produtos: false, precos: false, clientes: true,
        funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
        estoque: false, usuarios: false
      }
    });
    setEditingStaff(null);
  };

  const handleStartEditStaff = (st) => {
    setEditingStaff(st);
    setNewStaff({
      code: st.code,
      name: st.name,
      role: st.role,
      status: st.status,
      permissions: st.permissions || {
        financeiro: false, produtos: false, precos: false, clientes: false,
        funcionarios: false, relatorios: false, impressao: false, visualConfig: false,
        estoque: false, usuarios: false
      }
    });
  };

  const handleStaffPermissionToggle = (key) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Store Config Actions
  const handleSaveStoreConfig = (e) => {
    e.preventDefault();
    if (!checkPermission('visualConfig')) {
      showError('Sem permissão para alterar visual da loja.');
      return;
    }

    const updatedCompanies = {
      ...companies,
      [currentUser.companyId]: {
        ...storeConfig
      }
    };

    saveCompanies(updatedCompanies);
    setCompanies(updatedCompanies);
    reloadBranding();
    showSuccess('Configuração visual e dados da loja salvos com sucesso!');
  };

  const handleSaveFirebaseUrl = (e) => {
    e.preventDefault();
    localStorage.setItem("firebase_db_url", firebaseUrl.trim());
    showSuccess('URL do Firebase salva com sucesso! Sincronizando dados...');
    if (firebaseUrl.trim()) {
      syncFromCloud().then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  // Filter lists by tenant
  const isMaster = currentUser.role === 'admin-master';
  
  const tenantProducts = products.filter(p => isMaster ? true : p.companyId === currentUser.companyId);
  const uniqueCategories = Array.from(new Set(tenantProducts.map(p => p.category))).filter(Boolean);
  if (uniqueCategories.length === 0) {
    uniqueCategories.push('Geral');
  }
  const tenantOrders = orders.filter(o => isMaster ? true : o.companyId === currentUser.companyId);
  const tenantClients = Object.values(users).filter(u => u.role === 'cliente' && (isMaster ? true : u.companyId === currentUser.companyId));
  const tenantStaff = Object.values(users).filter(u => (u.role === 'gestor' || u.role === 'vendedor') && (isMaster ? true : u.companyId === currentUser.companyId));
  const storeRevenue = tenantOrders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0);

  // Render variables
  const filteredTenantProducts = tenantProducts.filter(p => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.description.toLowerCase().includes(q) ||
           p.code.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q);
  });
  const lowStockProducts = tenantProducts.filter(p => p.stock < 20);

  // Build module list for non-master home screen
  const homeModules = !isMaster ? [
    ...((currentUser.role === 'store-admin' || currentUser.permissions?.financeiro || currentUser.permissions?.relatorios) ? [{
      key: 'dashboard', icon: '📊', label: 'Indicadores',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    }] : []),
    { key: 'orders', icon: '📋', label: 'Orçamentos',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      badge: tenantOrders.filter(o => o.status === 'Pendente' || o.status === 'Em Aprovação').length
    },
    { key: 'messages', icon: '💬', label: 'Mensagens',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    ...((currentUser.role === 'store-admin' || currentUser.permissions?.produtos) ? [{
      key: 'products', icon: '📦', label: 'Produtos',
      gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
      badge: lowStockProducts.length
    }] : []),
    ...((currentUser.role === 'store-admin' || currentUser.permissions?.clientes) ? [{
      key: 'clients', icon: '👥', label: 'Clientes',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      badge: tenantClients.filter(c => c.status === 'Pendente').length
    }] : []),
    ...((currentUser.role === 'store-admin' || currentUser.permissions?.funcionarios) ? [{
      key: 'staff', icon: '🛡️', label: 'Equipe',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
      badge: tenantStaff.length
    }] : []),
    ...((currentUser.role === 'store-admin' || currentUser.permissions?.visualConfig) ? [{
      key: 'settings', icon: '⚙️', label: 'Configurações',
      gradient: 'linear-gradient(135deg, #64748b 0%, #334155 100%)'
    }] : []),
  ] : [];

  return (
    <div className="admin-container">
      {/* Toast notifications */}
      <div className="print-hide" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* iOS/PWA Notification Permission Banner */}
      {('Notification' in window) && notificationPermission === 'default' && (
        <div style={{
          borderRadius: '12px',
          padding: '16px',
          margin: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #d1fae5',
          color: '#065f46'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                Receber Alertas de Novos Orçamentos
              </h4>
              <p style={{ fontSize: '12px', margin: 0, opacity: 0.9 }}>
                Ative as notificações para receber avisos em tempo real ao receber novos orçamentos de clientes.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="btn btn-primary"
            style={{
              backgroundColor: '#059669',
              border: 'none',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Ativar
          </button>
        </div>
      )}

      {/* ===================== MASTER ADMIN LAYOUT ===================== */}
      {isMaster && (
        <div>
          {/* Master Header */}
          <div className="admin-header print-hide">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline"
                style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <ArrowLeft size={16} /> Voltar ao Catálogo
              </button>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>
                  Painel Administrativo Master
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Visão Geral — Facilitadora
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Cargo: <strong style={{ color: 'var(--primary-color)' }}>{currentUser.role.toUpperCase()}</strong>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--border-color)' }}>
                Sair
              </button>
            </div>
          </div>

          {/* Banners */}
          {successMsg && (<div className="print-hide" style={{ backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5', color: '#065f46', padding: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>✅ {successMsg}</div>)}
          {errorMsg && (<div className="print-hide" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', padding: '12px', fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>⚠️ {errorMsg}</div>)}

          {/* Master Layout: Sidebar + Content */}
          <div className="admin-layout">
            <aside className="admin-sidebar print-hide">
              <button onClick={() => setActiveTab('dashboard-master')} className={`admin-tab-btn ${activeTab === 'dashboard-master' ? 'active' : ''}`}>
                <BarChart3 size={18} /> Painel Global
              </button>
              <button onClick={() => setActiveTab('companies')} className={`admin-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}>
                <Store size={18} /> Gestão de Lojas
              </button>
              <button onClick={() => setActiveTab('global-users')} className={`admin-tab-btn ${activeTab === 'global-users' ? 'active' : ''}`}>
                <Shield size={18} /> Usuários Globais
              </button>
            </aside>
            <main className="admin-content" style={{ textAlign: 'left' }}>
              {/* ====== MASTER TAB: GLOBAL DASHBOARD ====== */}
              {activeTab === 'dashboard-master' && (
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                    Painel Administrativo Master
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <div className="card">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lojas Registradas</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>{Object.keys(companies).length}</div>
                    </div>
                    <div className="card">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faturamento Acumulado</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                        R$ {orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="card">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Orçamentos Solicitados</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>{orders.length}</div>
                    </div>
                    <div className="card">
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Usuários Ativos</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                        {Object.values(users).filter(u => u.status === 'Active').length}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Orçamentos Recentes das Filiais</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead><tr><th>Cód Pedido</th><th>Loja</th><th>Cliente</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>
                          {orders.slice(0, 10).map(ord => (
                            <tr key={ord.id}>
                              <td style={{ fontWeight: 700 }}>{ord.id}</td>
                              <td style={{ fontWeight: 600 }}>{companies[ord.companyId]?.name || ord.companyId}</td>
                              <td>{ord.clientName}</td>
                              <td>R$ {ord.total.toFixed(2)}</td>
                              <td><span className={`badge badge-${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>{ord.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ====== MASTER TAB: COMPANIES ====== */}
              {activeTab === 'companies' && (
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                    Gerenciar Lojas e Clientes Administrativos
                  </h2>
                  <div className="admin-grid-layout">
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <table className="admin-table">
                        <thead><tr><th>ID</th><th>Nome</th><th>Telefone</th><th>Endereço</th></tr></thead>
                        <tbody>
                          {Object.values(companies).map(c => (
                            <tr key={c.id}>
                              <td style={{ fontWeight: 700 }}>{c.id}</td>
                              <td>{c.name}</td>
                              <td>{c.phone}</td>
                              <td style={{ fontSize: '12px' }}>{c.address}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="card">
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Cadastrar Nova Loja</h3>
                      <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>ID da Loja</label>
                          <input className="input-field" placeholder="ex: coqueiro-matriz" value={newCompany.id} onChange={e => setNewCompany(p => ({ ...p, id: e.target.value }))} required /></div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nome Completo</label>
                          <input className="input-field" placeholder="Nome da loja" value={newCompany.name} onChange={e => setNewCompany(p => ({ ...p, name: e.target.value }))} required /></div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nome Fantasia</label>
                          <input className="input-field" placeholder="Nome fantasia" value={newCompany.tradeName} onChange={e => setNewCompany(p => ({ ...p, tradeName: e.target.value }))} /></div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Telefone</label>
                          <input className="input-field" placeholder="(xx) xxxxx-xxxx" value={newCompany.phone} onChange={e => setNewCompany(p => ({ ...p, phone: e.target.value }))} /></div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Cadastrar Loja</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* ====== MASTER TAB: GLOBAL USERS ====== */}
              {activeTab === 'global-users' && (
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                    Gerenciar Usuários Globais
                  </h2>
                  <div className="admin-grid-layout">
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <table className="admin-table">
                        <thead><tr><th>Código</th><th>Nome</th><th>Cargo</th><th>Loja</th><th>Status</th></tr></thead>
                        <tbody>
                          {Object.values(users).map(u => (
                            <tr key={u.code}>
                              <td style={{ fontWeight: 700 }}>{u.code}</td>
                              <td>{u.name}</td>
                              <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                              <td style={{ fontSize: '12px' }}>{companies[u.companyId]?.name || u.companyId || '—'}</td>
                              <td><span className={`badge badge-${u.status?.toLowerCase()}`}>{u.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="card">
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Cadastrar Novo Usuário</h3>
                      <form onSubmit={handleCreateGlobalUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Código de Acesso</label>
                          <input className="input-field" placeholder="ex: ADMIN01" value={newGlobalUser.code} onChange={e => setNewGlobalUser(p => ({ ...p, code: e.target.value }))} required /></div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nome</label>
                          <input className="input-field" placeholder="Nome completo" value={newGlobalUser.name} onChange={e => setNewGlobalUser(p => ({ ...p, name: e.target.value }))} required /></div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Cargo</label>
                          <select className="input-field" value={newGlobalUser.role} onChange={e => setNewGlobalUser(p => ({ ...p, role: e.target.value }))}>
                            <option value="admin-master">Admin Master</option>
                            <option value="store-admin">Admin de Loja</option>
                            <option value="gestor">Gestor</option>
                            <option value="vendedor">Vendedor</option>
                          </select>
                        </div>
                        <div><label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Loja</label>
                          <select className="input-field" value={newGlobalUser.companyId} onChange={e => setNewGlobalUser(p => ({ ...p, companyId: e.target.value }))}>
                            <option value="">Selecione uma loja...</option>
                            {Object.values(companies).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                          </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>Registrar Acesso</button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* ===================== NON-MASTER HOME SCREEN ===================== */}
      {!isMaster && activeTab === 'home' && (

        <div className="missoes-home-page">
          {/* iOS-style header */}
          <header className="missoes-header print-hide">
            <div className="missoes-header-left">
              <div className="missoes-logo-circle" style={{ background: `linear-gradient(135deg, ${company.primaryColor}, ${company.secondaryColor})` }}>
                🏪
              </div>
              <div>
                <div className="missoes-header-title">Painel do Administrador</div>
                <div className="missoes-header-sub">{company.tradeName || company.name}</div>
              </div>
            </div>
            <div className="missoes-header-right">
              <div className="missoes-header-user">
                <span style={{ fontSize: '16px' }}>👑</span> {currentUser.name}
              </div>
              <div className="missoes-header-date">{new Date().toLocaleDateString('pt-BR')}</div>
              <button onClick={handleLogout} className="missoes-sair-btn">Sair</button>
            </div>
          </header>

          {/* Message banners */}
          {successMsg && (<div style={{ backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5', color: '#065f46', padding: '10px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>✅ {successMsg}</div>)}
          {errorMsg && (<div style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', padding: '10px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>⚠️ {errorMsg}</div>)}

          <main className="missoes-main">
            {/* Stats cards row */}
            <div className="missoes-stats-row">
              <div className="missoes-stat-card">
                <div className="missoes-stat-label">ORÇAMENTOS</div>
                <div className="missoes-stat-value">{tenantOrders.length}</div>
                <div className="missoes-stat-sub">{tenantOrders.filter(o => o.status === 'Pendente').length} pendentes</div>
              </div>
              <div className="missoes-stat-card">
                <div className="missoes-stat-label">CLIENTES B2B</div>
                <div className="missoes-stat-value" style={{ color: company.primaryColor }}>{tenantClients.length}</div>
                <div className="missoes-stat-sub">cadastrados</div>
              </div>
              <div className="missoes-stat-card">
                <div className="missoes-stat-label">PRODUTOS</div>
                <div className="missoes-stat-value">{tenantProducts.length}</div>
                <div className="missoes-stat-sub">no catálogo</div>
              </div>
              <div className="missoes-stat-card">
                <div className="missoes-stat-label">ESTOQUE CRÍTICO</div>
                <div className="missoes-stat-value" style={{ color: lowStockProducts.length > 0 ? '#ef4444' : company.primaryColor }}>
                  {lowStockProducts.length}
                </div>
                <div className="missoes-stat-sub">abaixo de 20un</div>
              </div>
            </div>

            {/* Modules grid */}
            <div className="missoes-section-label">MÓDULOS</div>
            <div className="missoes-modules-grid">
              {homeModules.map(mod => (
                <button key={mod.key} className="missoes-module-card" onClick={() => setActiveTab(mod.key)}>
                  {mod.badge > 0 && (
                    <span className="missoes-module-badge">{mod.badge > 99 ? '99+' : mod.badge}</span>
                  )}
                  <div className="missoes-module-icon" style={{ background: mod.gradient }}>
                    <span>{mod.icon}</span>
                  </div>
                  <div className="missoes-module-label">{mod.label}</div>
                </button>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* ===================== NON-MASTER MODULE SCREENS ===================== */}
      {!isMaster && activeTab !== 'home' && (
        <div className="missoes-module-page">
          {/* Slim sub-header with back button */}
          <header className="missoes-module-header print-hide">
            <button className="missoes-back-btn" onClick={() => setActiveTab('home')}>
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="missoes-module-header-title">
              {homeModules.find(m => m.key === activeTab)?.icon || '📄'} {homeModules.find(m => m.key === activeTab)?.label || activeTab}
            </div>
            <button onClick={handleLogout} className="missoes-sair-btn">Sair</button>
          </header>

          {/* Message banners */}
          {successMsg && (<div className="print-hide" style={{ backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5', color: '#065f46', padding: '10px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>✅ {successMsg}</div>)}
          {errorMsg && (<div className="print-hide" style={{ backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b', padding: '10px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>⚠️ {errorMsg}</div>)}

          <main className="admin-content" style={{ textAlign: 'left', maxWidth: '1200px', margin: '0 auto' }}>
            
          {/* ========================================= */}
          {/* TAB: GLOBAL DASHBOARD (MASTER) */}
          {activeTab === 'dashboard-master' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Painel Administrativo Master
              </h2>

              {/* Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lojas Registradas</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {Object.keys(companies).length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faturamento Acumulado</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    R$ {orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Orçamentos Solicitados</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {orders.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Usuários Ativos</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {Object.values(users).filter(u => u.status === 'Active').length}
                  </div>
                </div>
              </div>

              {/* General list */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Orçamentos Recentes das Filiais</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cód Pedido</th>
                        <th>Loja</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 700 }}>{ord.id}</td>
                          <td style={{ fontWeight: 600 }}>{companies[ord.companyId]?.name || ord.companyId}</td>
                          <td>{ord.clientName}</td>
                          <td>R$ {ord.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: COMPANIE MANAGMENT (MASTER) */}
          {activeTab === 'companies' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gerenciar Lojas e Clientes Administrativos
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Identificador</th>
                        <th>Nome Fantasia</th>
                        <th>Contato</th>
                        <th>Endereço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(companies).map(comp => (
                        <tr key={comp.id}>
                          <td style={{ fontWeight: 700 }}>{comp.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                backgroundColor: comp.primaryColor
                              }} />
                              <strong>{comp.name}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{comp.tradeName}</div>
                          </td>
                          <td>
                            <div>Phone: {comp.phone}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Whats: {comp.whatsapp}</div>
                          </td>
                          <td style={{ fontSize: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {comp.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create Company Form */}
                <form onSubmit={handleCreateCompany} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Nova Empresa
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código/Slug Único (Minúsculo)</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: padaria-central"
                      value={newCompany.id} 
                      onChange={(e) => setNewCompany({ ...newCompany, id: e.target.value.toLowerCase() })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Fantasia</label>
                    <input 
                      type="text" className="form-input" placeholder="Padaria Central"
                      value={newCompany.name} 
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Razão Social</label>
                    <input 
                      type="text" className="form-input" placeholder="Padaria Central Ltda"
                      value={newCompany.tradeName} 
                      onChange={(e) => setNewCompany({ ...newCompany, tradeName: e.target.value })}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Primária</label>
                      <input 
                        type="color" value={newCompany.primaryColor}
                        onChange={(e) => setNewCompany({ ...newCompany, primaryColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Secundária</label>
                      <input 
                        type="color" value={newCompany.secondaryColor}
                        onChange={(e) => setNewCompany({ ...newCompany, secondaryColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Destaque</label>
                      <input 
                        type="color" value={newCompany.accentColor}
                        onChange={(e) => setNewCompany({ ...newCompany, accentColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Telefone de Contato</label>
                    <input 
                      type="text" className="form-input" placeholder="(11) 2233-4455"
                      value={newCompany.phone} 
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Endereço Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="Av. Principal, 100"
                      value={newCompany.address} 
                      onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Registrar Filial
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: GLOBAL USERS MANAGMENT (MASTER) */}
          {activeTab === 'global-users' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Controle Global de Usuários
              </h2>

              <div className="admin-grid-layout">
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Loja</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(users).map(u => (
                        <tr key={u.code}>
                          <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.code}</td>
                          <td>
                            <strong>{u.name}</strong>
                            {u.phone && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tel: {u.phone}</div>}
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>{u.role}</td>
                          <td>{companies[u.companyId]?.name || 'Global (Master)'}</td>
                          <td>
                            <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                              {u.status === 'Active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteUser(u.code)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form users */}
                <form onSubmit={handleCreateGlobalUser} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Novo Usuário Administrativo
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código de Acesso (5 Caracteres)</label>
                    <input 
                      type="text" className="form-input" maxLength={5} placeholder="EXADM"
                      value={newGlobalUser.code} 
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, code: e.target.value.toUpperCase() })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="João da Silva"
                      value={newGlobalUser.name} 
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, name: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cargo / Role</label>
                    <select 
                      className="form-input" 
                      value={newGlobalUser.role}
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, role: e.target.value })}
                    >
                      <option value="admin-master">Admin Master (Global)</option>
                      <option value="store-admin">Administrador de Loja</option>
                      <option value="gestor">Gestor Comercial</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                  </div>

                  {newGlobalUser.role !== 'admin-master' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Vincular à Loja</label>
                      <select 
                        className="form-input" 
                        value={newGlobalUser.companyId}
                        onChange={(e) => setNewGlobalUser({ ...newGlobalUser, companyId: e.target.value })}
                        required
                      >
                        <option value="">Selecione uma loja...</option>
                        {Object.values(companies).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Registrar Acesso
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: STORE GENERAL DASHBOARD INDICATORS */}
          {activeTab === 'dashboard' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Indicadores Gerais da Loja
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faturamento Estimado</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    R$ {storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Solicitações Recebidas</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    {tenantOrders.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Clientes Comerciais</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    {tenantClients.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Estoque Crítico (&lt;20)</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: lowStockProducts.length > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {lowStockProducts.length}
                  </div>
                </div>
              </div>

              {/* Stock Warning Box */}
              {lowStockProducts.length > 0 && (
                <div className="card" style={{ borderLeft: '5px solid var(--danger)', marginBottom: '32px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                    <span style={{ fontWeight: 600 }}>Alerta de Abastecimento: Existem {lowStockProducts.length} produtos com nível de estoque baixo.</span>
                  </div>
                </div>
              )}

              {/* Quick info list */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Fluxo Recente de Orçamentos</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Data da Solicitação</th>
                        <th>Total</th>
                        <th>Status Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantOrders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700 }}>{o.id}</td>
                          <td>{o.clientName}</td>
                          <td>{new Date(o.date).toLocaleDateString('pt-BR')} às {new Date(o.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ fontWeight: 600 }}>R$ {o.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: MESSAGES / CHAT PANEL */}
          {activeTab === 'messages' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Central de Mensagens e Suporte
              </h2>

              <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', minHeight: '550px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                {/* Sidebar: list of client chats */}
                <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Conversas Ativas</h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tenantClients.map(client => {
                      const clientMsgs = messages.filter(m => m.clientCode === client.code);
                      const lastMsg = clientMsgs[clientMsgs.length - 1];
                      const isSelected = selectedChatClient?.code === client.code;
                      
                      return (
                        <div
                          key={client.code}
                          onClick={() => setSelectedChatClient(client)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#ecfdf5' : 'transparent',
                            border: isSelected ? '1px solid #d1fae5' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '13px', color: isSelected ? '#065f46' : 'var(--text-primary)' }}>{client.name}</strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-light)', fontFamily: 'monospace', fontWeight: 700 }}>{client.code}</span>
                          </div>
                          {lastMsg ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lastMsg.sender === 'vendedor' ? 'Você: ' : ''}{lastMsg.text}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontStyle: 'italic' }}>Nenhuma mensagem</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Main chat area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
                  {selectedChatClient ? (
                    <>
                      {/* Chat Header */}
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{selectedChatClient.name}</h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cliente Código: {selectedChatClient.code}</span>
                        </div>
                        {selectedChatClient.phone && (
                          <a
                            href={`https://wa.me/55${selectedChatClient.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              borderRadius: '8px',
                              color: '#25D366',
                              borderColor: '#25D366',
                              backgroundColor: 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              textDecoration: 'none',
                              fontWeight: 700
                            }}
                          >
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      {/* Message History */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f1f5f9' }}>
                        {messages.filter(m => m.clientCode === selectedChatClient.code).length === 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>
                            Envie uma mensagem para iniciar o atendimento.
                          </div>
                        ) : (
                          messages.filter(m => m.clientCode === selectedChatClient.code).map(m => {
                            const isMe = m.sender === 'vendedor';
                            return (
                              <div
                                key={m.id}
                                style={{
                                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                                  maxWidth: '70%',
                                  padding: '12px 16px',
                                  borderRadius: '16px',
                                  borderTopRightRadius: isMe ? '4px' : '16px',
                                  borderTopLeftRadius: !isMe ? '4px' : '16px',
                                  backgroundColor: isMe ? '#059669' : '#ffffff',
                                  color: isMe ? '#ffffff' : 'var(--text-primary)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ fontSize: '13px', lineHeight: 1.4, wordBreak: 'break-word', textAlign: 'left' }}>{m.text}</span>
                                <span style={{ fontSize: '9px', opacity: 0.7, alignSelf: 'flex-end' }}>
                                  {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Chat Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!adminNewMessage.trim()) return;
                          
                          const newMsg = {
                            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                            companyId: currentUser.companyId,
                            clientCode: selectedChatClient.code,
                            clientName: selectedChatClient.name,
                            sender: 'vendedor',
                            senderName: currentUser.name,
                            text: adminNewMessage.trim(),
                            timestamp: new Date().toISOString()
                          };
                          
                          const nextMessages = [...messages, newMsg];
                          saveMessages(nextMessages);
                          setMessages(nextMessages);
                          setAdminNewMessage('');
                        }}
                        style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}
                      >
                        <input
                          type="text"
                          placeholder="Digite sua resposta..."
                          className="form-input"
                          value={adminNewMessage}
                          onChange={(e) => setAdminNewMessage(e.target.value)}
                          style={{ flex: 1, borderRadius: '12px', height: '44px' }}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{
                            backgroundColor: '#059669',
                            border: 'none',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '0 24px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Enviar
                        </button>
                      </form>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', gap: '12px' }}>
                      <span style={{ fontSize: '48px' }}>💬</span>
                      <strong style={{ fontSize: '15px' }}>Selecione um cliente para começar a conversar</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: ORDERS & INVOICES PRINT PANEL */}
          {activeTab === 'orders' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gestão e Separação de Orçamentos
              </h2>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {tenantOrders.length === 0 ? (
                  <div style={{ padding: '40px', color: 'var(--text-light)', textAlign: 'center' }}>
                    Nenhum orçamento solicitado para a loja.
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cód Orçamento</th>
                        <th>Cliente</th>
                        <th>Lista de Produtos</th>
                        <th>Valor Total</th>
                        <th>Status do Pedido</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantOrders.map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 800 }}>{ord.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ord.clientName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Acesso: {ord.clientCode}</div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {ord.items.map((item, idx) => (
                                <div key={idx} style={{ color: 'var(--text-secondary)' }}>
                                  • {item.description} ({item.qty} un)
                                </div>
                              ))}
                            </div>
                            {ord.notes && (
                              <div style={{
                                marginTop: '6px', fontSize: '11px', color: 'var(--text-light)', 
                                fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px'
                              }}>
                                Obs: {ord.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '15px', color: company.primaryColor }}>
                            R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid var(--border-color)',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Recebido">Recebido</option>
                              <option value="Em Separação">Em Separação</option>
                              <option value="Separado">Separado (Pronto)</option>
                              <option value="Aguardando Retirada">Aguardando Retirada</option>
                              <option value="Retirado">Retirado / Entregue</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => triggerPrintOrder(ord)}
                                className="btn btn-outline"
                                title="Imprimir Folha A4 para Separação"
                                style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Printer size={14} /> Separar
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="btn btn-outline"
                                title="Excluir Orçamento"
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '12px', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  color: '#ef4444',
                                  borderColor: 'rgba(239, 68, 68, 0.2)',
                                  backgroundColor: 'transparent'
                                }}
                              >
                                <Trash2 size={14} /> Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: PRODUCTS CATALOG CRUD */}
          {activeTab === 'products' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Catálogo da Loja
              </h2>

              {/* Search bar */}
              <div className="mb-6" style={{ maxWidth: '400px' }}>
                <input 
                  type="text"
                  placeholder="🔍 Buscar produto por nome, código ou prateleira..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 'none' }}
                />
              </div>

              <div className="admin-grid-layout">
                {/* List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço Unitário</th>
                        <th>Preço Atacado</th>
                        <th>Estoque Atual</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenantProducts.slice(0, visibleProductsCount).map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={p.imageUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.description}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cód: {p.code} • Marca: {p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <select
                              value={p.category}
                              onChange={e => handleInlineProductChange(p.id, 'category', e.target.value)}
                              style={{
                                padding: '4px 6px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                               <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>R$</span>
                               <input 
                                 type="number"
                                 step="0.01"
                                 value={p.price || 0}
                                 onChange={e => handleInlineProductChange(p.id, 'price', parseFloat(e.target.value) || 0)}
                                 style={{
                                   width: '75px',
                                   padding: '4px 6px',
                                   borderRadius: '6px',
                                   border: '1px solid var(--border-color)',
                                   fontSize: '13px',
                                   fontWeight: 700,
                                   backgroundColor: 'var(--card-bg)',
                                   color: 'var(--text-primary)',
                                   outline: 'none'
                                 }}
                               />
                             </div>
                           </td>
                           <td>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>R$</span>
                                 <input 
                                   type="number"
                                   step="0.01"
                                   value={p.packagePrice || 0}
                                   onChange={e => handleInlineProductChange(p.id, 'packagePrice', parseFloat(e.target.value) || 0)}
                                   style={{
                                     width: '70px',
                                     padding: '4px 6px',
                                     borderRadius: '6px',
                                     border: '1px solid var(--border-color)',
                                     fontSize: '12px',
                                     fontWeight: 700,
                                     backgroundColor: 'var(--card-bg)',
                                     color: 'var(--text-primary)',
                                     outline: 'none'
                                   }}
                                 />
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cx c/</span>
                                 <input 
                                   type="number"
                                   value={p.packageItems || 1}
                                   onChange={e => handleInlineProductChange(p.id, 'packageItems', parseInt(e.target.value) || 1)}
                                   style={{
                                     width: '45px',
                                     padding: '2px 4px',
                                     borderRadius: '6px',
                                     border: '1px solid var(--border-color)',
                                     fontSize: '11px',
                                     backgroundColor: 'var(--card-bg)',
                                     color: 'var(--text-primary)',
                                     outline: 'none'
                                   }}
                                 />
                               </div>
                             </div>
                           </td>
                           <td>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                               <input 
                                 type="number"
                                 value={p.stock}
                                 onChange={e => handleInlineProductChange(p.id, 'stock', parseInt(e.target.value) || 0)}
                                 style={{
                                   width: '65px',
                                   padding: '4px 6px',
                                   borderRadius: '6px',
                                   border: '1px solid var(--border-color)',
                                   fontSize: '13px',
                                   fontWeight: 600,
                                   backgroundColor: 'var(--card-bg)',
                                   color: p.stock < 20 ? 'var(--danger)' : 'var(--text-primary)',
                                   outline: 'none'
                                 }}
                               />
                               <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>un</span>
                             </div>
                           </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleStartEditProduct(p)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form CRUD */}
                <form onSubmit={handleAddOrEditProduct} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Descrição</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: Melancia Inteira Kg"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código Interno</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: COQ-302"
                      value={newProduct.code}
                      onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Marca</label>
                      <input 
                        type="text" className="form-input" placeholder="ex: Nestlé"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Unidade</label>
                      <input 
                        type="text" className="form-input" placeholder="ex: Kg, Un, Cx"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Categoria</label>
                    <select 
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Preço Comercial (R$)</label>
                      <input 
                        type="number" step="0.01" className="form-input"
                        placeholder="R$ 10,00"
                        value={newProduct.price}
                        disabled={!checkPermission('precos')}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Estoque Inicial</label>
                      <input 
                        type="number" className="form-input"
                        placeholder="ex: 150"
                        value={newProduct.stock}
                        disabled={!checkPermission('estoque')}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span>URL da Foto</span>
                       <button
                         type="button"
                         onClick={() => handleSearchProductImage(newProduct.description)}
                         style={{
                           fontSize: '11px',
                           color: 'var(--primary-color)',
                           background: 'none',
                           border: 'none',
                           cursor: 'pointer',
                           fontWeight: 700,
                           padding: 0
                         }}
                       >
                         🔍 Buscar no Google
                       </button>
                     </label>
                     <input 
                       type="text" className="form-input" placeholder="https://..."
                       value={newProduct.imageUrl}
                       onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                     />
                   </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingProduct ? 'Salvar Edição' : 'Cadastrar'}
                    </button>
                    {editingProduct && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingProduct(null);
                          setNewProduct({ code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: '' });
                        }}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: CLIENTS DIRECTORY */}
          {activeTab === 'clients' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gestão de Clientes B2B
              </h2>

              <div className="admin-grid-layout">
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código Único</th>
                        <th>Nome Comercial</th>
                        <th>Telefone</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantClients.map(cli => (
                        <tr key={cli.code}>
                          <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{cli.code}</td>
                          <td style={{ fontWeight: 600 }}>{cli.name}</td>
                          <td>{cli.phone}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleStartEditClient(cli)}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit2 size={12} /> Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClient(cli.code)}
                              className="btn btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Register/Edit client form */}
                <form onSubmit={handleAddOrEditClient} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {editingClient ? <Edit2 size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />}
                    {editingClient ? `Editar: ${editingClient.code}` : 'Novo Cliente'}
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Comercial / Empresa</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: Supermercado Popular"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">WhatsApp / Telefone</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: (11) 98888-7777"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código de Acesso Único (5 a 10 Letras)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" className="form-input" maxLength={10} placeholder="ex: ABCDEF"
                        value={newClient.code}
                        onChange={(e) => setNewClient({ ...newClient, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                        required
                        disabled={!!editingClient}
                      />
                      {!editingClient && (
                        <button 
                          type="button" 
                          onClick={generateRandomClientCode}
                          className="btn btn-outline"
                          style={{ padding: '8px 12px', fontSize: '12px' }}
                        >
                          Gerar
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingClient ? 'Salvar' : 'Registrar Cliente'}
                    </button>
                    {editingClient && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingClient(null);
                          setNewClient({ name: '', phone: '', code: '' });
                        }}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: STAFF MEMBERS & TOGGLE PERMISSIONS */}
          {activeTab === 'staff' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Equipe e Permissões de Acesso
              </h2>

              <div className="admin-grid-layout">
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Acesso</th>
                        <th>Funcionário</th>
                        <th>Cargo</th>
                        <th>Permissões Ativas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantStaff.map(st => (
                        <tr key={st.code} style={{ cursor: 'pointer' }} onClick={() => handleStartEditStaff(st)}>
                          <td style={{ fontWeight: 800 }}>{st.code}</td>
                          <td>
                            <strong>{st.name}</strong>
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                            {st.role}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {Object.keys(st.permissions || {}).filter(k => st.permissions[k]).map(k => (
                                <span key={k} style={{
                                  fontSize: '9px', backgroundColor: `${company.primaryColor}15`, 
                                  color: company.primaryColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 600
                                }}>
                                  {k}
                                </span>
                              ))}
                              {(!st.permissions || Object.values(st.permissions).every(v => !v)) && (
                                <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Nenhuma</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form Staff */}
                <form onSubmit={handleAddOrEditStaff} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {editingStaff ? `Editar: ${newStaff.name}` : 'Registrar Funcionário'}
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="Fernanda Lima"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Código de Acesso</label>
                      <input 
                        type="text" className="form-input" maxLength={5} placeholder="GES02"
                        value={newStaff.code}
                        disabled={!!editingStaff}
                        onChange={(e) => setNewStaff({ ...newStaff, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cargo</label>
                      <select 
                        className="form-input"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="gestor">Gestor</option>
                        <option value="vendedor">Vendedor</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle permissions switches */}
                  <div style={{
                    border: '1px solid var(--border-color)', borderRadius: '12px',
                    padding: '16px', backgroundColor: 'var(--bg-color)', marginTop: '8px'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Permissões Comerciais (Toggles)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { key: 'financeiro', label: 'Financeiro / Faturamento' },
                        { key: 'produtos', label: 'Cadastro de Produtos' },
                        { key: 'precos', label: 'Alteração de Preços' },
                        { key: 'clientes', label: 'Cadastro de Clientes' },
                        { key: 'funcionarios', label: 'Gerenciar Funcionários' },
                        { key: 'relatorios', label: 'Visualizar Relatórios' },
                        { key: 'impressao', label: 'Impressão de Pedidos' },
                        { key: 'visualConfig', label: 'Alterar Cores / Logos' },
                        { key: 'estoque', label: 'Gestão de Estoque' }
                      ].map(perm => (
                        <div key={perm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{perm.label}</span>
                          <label className="switch">
                            <input 
                              type="checkbox"
                              checked={!!newStaff.permissions[perm.key]}
                              onChange={() => handleStaffPermissionToggle(perm.key)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingStaff ? 'Salvar' : 'Cadastrar'}
                    </button>
                    {editingStaff && (
                      <>
                        <button 
                          type="button"
                          onClick={handleDeleteStaff}
                          className="btn btn-outline"
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            borderColor: '#ef4444',
                            fontWeight: 700
                          }}
                        >
                          Excluir
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingStaff(null);
                            setNewStaff({
                              code: '', name: '', role: 'vendedor', status: 'Active',
                              permissions: {
                                financeiro: false, produtos: false, precos: false, clientes: true,
                                funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
                                estoque: false, usuarios: false
                              }
                            });
                          }}
                          className="btn btn-outline"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: VISUAL CONFIG & BRANDING (STORE ADMIN) */}
          {activeTab === 'settings' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Configuração da Marca Dinâmica
              </h2>

              <form onSubmit={handleSaveStoreConfig} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  Identidade Visual e Contato do Estabelecimento
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome da Loja</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.name}
                      onChange={(e) => setStoreConfig({ ...storeConfig, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Razão Social / Nome Fantasia Completo</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.tradeName}
                      onChange={(e) => setStoreConfig({ ...storeConfig, tradeName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tipo do Logotipo</label>
                    <select 
                      className="form-input"
                      value={storeConfig.logoType}
                      onChange={(e) => setStoreConfig({ ...storeConfig, logoType: e.target.value })}
                    >
                      <option value="text">Texto</option>
                      <option value="image">Imagem (URL)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{storeConfig.logoType === 'text' ? 'Texto do Logo' : 'URL do Logotipo'}</label>
                    <input 
                      type="text" className="form-input" 
                      placeholder={storeConfig.logoType === 'text' ? 'MinhaLoja' : 'https://...'}
                      value={storeConfig.logoType === 'text' ? storeConfig.logoText : storeConfig.logoUrl}
                      onChange={(e) => {
                        if (storeConfig.logoType === 'text') {
                          setStoreConfig({ ...storeConfig, logoText: e.target.value, logoUrl: '' });
                        } else {
                          setStoreConfig({ ...storeConfig, logoUrl: e.target.value, logoText: '' });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Colors block */}
                <div style={{
                  border: '1px solid var(--border-color)', borderRadius: '12px',
                  padding: '16px', backgroundColor: 'var(--bg-color)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Cores de Identidade da Loja</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Primária</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.primaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, primaryColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.primaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, primaryColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Secundária</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.secondaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, secondaryColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.secondaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, secondaryColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor de Destaque</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.accentColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, accentColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.accentColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, accentColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Telefone Comercial</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.phone}
                      onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">WhatsApp Oficial</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.whatsapp}
                      onChange={(e) => setStoreConfig({ ...storeConfig, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Horário de Funcionamento</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.hours}
                      onChange={(e) => setStoreConfig({ ...storeConfig, hours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Endereço Comercial Físico</label>
                  <input 
                    type="text" className="form-input" 
                    value={storeConfig.address}
                    onChange={(e) => setStoreConfig({ ...storeConfig, address: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
                  <Save size={16} /> Salvar Alterações
                </button>
              </form>

              {/* Firebase Cloud Sync Configuration Section */}
              <form onSubmit={handleSaveFirebaseUrl} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  ☁️ Integração Cloud Database (Firebase)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Conecte o sistema a um banco de dados online para sincronizar pedidos, clientes e produtos entre diferentes abas (normais e anônimas) e diferentes aparelhos (computador e celular) em tempo real.
                </p>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Firebase Realtime Database URL</label>
                  <input 
                    type="url" className="form-input" 
                    placeholder="https://seu-projeto-default-rtdb.firebaseio.com"
                    value={firebaseUrl}
                    onChange={(e) => setFirebaseUrl(e.target.value)}
                  />
                  <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px', fontSize: '11px' }}>
                    * Deixe em branco para usar o modo de simulação LocalStorage (apenas offline).
                  </small>
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignSelf: 'flex-start', backgroundColor: '#eab308', color: '#1e293b' }}>
                  <Save size={16} /> Conectar e Sincronizar Firebase
                </button>
              </form>
            </div>
          )}

        </main>
        </div>
      )}

      {/* HIDDEN PRINT LAYOUT: DESIGNED FOR PAPER A4 PRINTS */}

      {activePrintOrder && (
        <div 
          className={`print-invoice-sheet format-${printFormat}`} 
          style={{ 
            color: 'black', 
            backgroundColor: 'white', 
            padding: printFormat === 'A4' ? '20px' : '5px',
            fontFamily: printFormat === 'A4' ? 'inherit' : "'Courier New', Courier, monospace",
            width: printFormat === 'A4' ? '100%' : printFormat === '80mm' ? '76mm' : '56mm',
            margin: '0 auto'
          }}
        >
          {printFormat === 'A4' ? (
            <>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>{company.name}</h1>
                <p style={{ margin: '2px 0', fontSize: '10pt' }}>{company.tradeName || ''}</p>
                <p style={{ margin: '2px 0', fontSize: '10pt' }}>{company.address}</p>
                <p style={{ margin: '2px 0', fontSize: '10pt' }}>Tel: {company.phone} | WhatsApp: {company.whatsapp}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '11pt' }}>
                <div>
                  <p><strong>CÓD ORÇAMENTO:</strong> {activePrintOrder.id}</p>
                  <p><strong>DATA DE CRIAÇÃO:</strong> {new Date(activePrintOrder.date).toLocaleString('pt-BR')}</p>
                  <p><strong>TIPO DO DOCUMENTO:</strong> Orçamento de Separação B2B</p>
                </div>
                <div>
                  <p><strong>CLIENTE:</strong> {activePrintOrder.clientName}</p>
                  <p><strong>CÓD ACESSO:</strong> {activePrintOrder.clientCode}</p>
                  <p><strong>ENTREGA / RETIRADA:</strong> {activePrintOrder.deliveryAddress || 'Retirada presencial na loja'}</p>
                </div>
              </div>

              {activePrintOrder.notes && (
                <div style={{ border: '1px solid black', padding: '8px', marginBottom: '20px', fontSize: '10pt' }}>
                  <strong>INSTRUÇÕES DO CLIENTE:</strong> {activePrintOrder.notes}
                </div>
              )}

              <table className="print-invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>Item Cód</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>Descrição do Produto</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>Qtd</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>Unidade</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>Preço Unitário</th>
                    <th style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {activePrintOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ border: '1px solid black', padding: '6px' }}>{item.id}</td>
                      <td style={{ border: '1px solid black', padding: '6px' }}>{item.description}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>R$ {Number(item.price || 0).toFixed(2)}</td>
                      <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>R$ {Number((item.price * item.qty) || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid black', paddingTop: '10px' }}>
                <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>
                  VALOR TOTAL ESTIMADO: R$ {activePrintOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
                <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                  Separado por (Almoxarifado)
                </div>
                <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                  Assinatura do Cliente
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: printFormat === '80mm' ? '12px' : '10px', textAlign: 'left', lineHeight: 1.3 }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed black', paddingBottom: '8px', marginBottom: '8px' }}>
                <strong style={{ fontSize: printFormat === '80mm' ? '16px' : '13px' }}>{company.name}</strong>
                {company.tradeName && <div style={{ fontSize: '10px' }}>{company.tradeName}</div>}
                <div style={{ fontSize: '9px' }}>{company.address}</div>
                <div style={{ fontSize: '9px' }}>Tel: {company.phone}</div>
              </div>

              {/* Order Info */}
              <div style={{ borderBottom: '1px dashed black', paddingBottom: '6px', marginBottom: '6px' }}>
                <div><strong>ORÇAMENTO:</strong> {activePrintOrder.id}</div>
                <div><strong>DATA:</strong> {new Date(activePrintOrder.date).toLocaleString('pt-BR')}</div>
                <div><strong>CLIENTE:</strong> {activePrintOrder.clientName}</div>
                <div><strong>CÓD ACESSO:</strong> {activePrintOrder.clientCode}</div>
                <div><strong>ENTREGA:</strong> {activePrintOrder.deliveryAddress || 'Retirada'}</div>
              </div>

              {/* Items List */}
              <div style={{ borderBottom: '1px dashed black', paddingBottom: '6px', marginBottom: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px', fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '2px', marginBottom: '4px' }}>
                  <span>Qtd</span>
                  <span>Descrição</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
                {activePrintOrder.items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 60px' }}>
                      <span style={{ fontWeight: 'bold' }}>{item.qty} {item.unit}</span>
                      <span style={{ wordBreak: 'break-word' }}>{item.description}</span>
                      <span style={{ textAlign: 'right' }}>R${Number(item.price * item.qty).toFixed(2)}</span>
                    </div>
                    <div style={{ fontSize: '9px', color: '#666', paddingLeft: '40px' }}>
                      P. Unit: R${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Instructions */}
              {activePrintOrder.notes && (
                <div style={{ borderBottom: '1px dashed black', paddingBottom: '6px', marginBottom: '6px', fontStyle: 'italic' }}>
                  <strong>Obs:</strong> {activePrintOrder.notes}
                </div>
              )}

              <div style={{ textAlign: 'right', fontSize: printFormat === '80mm' ? '14px' : '11px', fontWeight: 'bold', marginBottom: '15px' }}>
                TOTAL ESTIMADO: R$ {activePrintOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>

              {/* Signature lines */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', fontSize: '9px', textAlign: 'center' }}>
                <div style={{ borderTop: '1px solid black', width: '80%', paddingTop: '3px' }}>
                  Assinatura do Separador
                </div>
                <div style={{ borderTop: '1px solid black', width: '80%', paddingTop: '3px' }}>
                  Assinatura do Cliente
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Google Image Search Modal */}
      {showImageSearchModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{
            backgroundColor: 'var(--card-bg)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                🔍 Imagens do Google (PNG)
              </h3>
              <button 
                onClick={() => setShowImageSearchModal(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-color)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={imageSearchQuery}
                onChange={e => setImageSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchGoogleImages(imageSearchQuery)}
                className="form-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Palavra-chave do produto..."
              />
              <button
                type="button"
                onClick={() => searchGoogleImages(imageSearchQuery)}
                disabled={searchingImages}
                className="btn btn-primary"
                style={{ padding: '0 16px', margin: 0, backgroundColor: company.primaryColor }}
              >
                {searchingImages ? '⏳' : 'Buscar'}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: '240px', padding: '4px' }}>
              {searchingImages ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px' }}>⏳</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Buscando imagens PNG com fundo branco...</div>
                </div>
              ) : imageResults.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-light)', textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>🖼️</span>
                  <span style={{ fontSize: '13px', marginTop: '8px' }}>Nenhuma imagem encontrada.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {imageResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewProduct(prev => ({ ...prev, imageUrl: item.url }));
                        setShowImageSearchModal(false);
                      }}
                      style={{
                        position: 'relative',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1',
                        transition: 'all 0.15s'
                      }}
                    >
                      <img
                        src={item.thumbnail || item.url}
                        alt=""
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Indisponivel' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '16px' }}>
              Buscas focadas em arquivos PNG de alta qualidade com fundo branco para etiquetas e PDV.
            </div>
          </div>
        </div>
      )}

      {/* New Order Alert Modal (Forced On-Screen Notification) */}
      {newOrderAlert && (
        <div className="print-hide" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 11000,
          width: '90%',
          maxWidth: '500px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
          borderLeft: '8px solid #059669',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: 'slide-down 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', textAlign: 'left' }}>
              <span style={{ fontSize: '28px' }}>📥</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Novo Orçamento Recebido!</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cliente: <strong>{newOrderAlert.clientName}</strong></span>
              </div>
            </div>
            <button 
              onClick={() => setNewOrderAlert(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'left', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
            <div><strong>Código:</strong> {newOrderAlert.id}</div>
            <div><strong>Valor Total:</strong> R$ {newOrderAlert.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => {
                setActiveTab('orders');
                setNewOrderAlert(null);
              }}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Ver Orçamentos
            </button>
            <button
              onClick={() => setNewOrderAlert(null)}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f1f5f9',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Print Format Selection Modal */}
      {showPrintModal && activePrintOrder && (
        <div className="print-hide" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 10500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>Formato de Impressão</h3>
              <button 
                onClick={() => {
                  setShowPrintModal(false);
                  setActivePrintOrder(null);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>
            
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Selecione o tamanho do papel ideal para a sua impressora de separação:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'A4', label: '📄 Folha A4 (Padrão Escritório)' },
                { value: '80mm', label: '🧾 Cupom 80mm (Bobina Térmica Larga)' },
                { value: '60mm', label: '🧾 Cupom 60mm (Mini Impressora)' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPrintFormat(opt.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: printFormat === opt.value ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    backgroundColor: printFormat === opt.value ? `${company.primaryColor}08` : '#ffffff',
                    color: printFormat === opt.value ? 'var(--primary-color)' : 'var(--text-primary)',
                    fontWeight: printFormat === opt.value ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  setTimeout(() => {
                    window.print();
                  }, 150);
                }}
                className="btn btn-primary"
                style={{ flex: 1, fontWeight: 700, backgroundColor: company.primaryColor, border: 'none' }}
              >
                Confirmar e Imprimir
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPrintModal(false);
                  setActivePrintOrder(null);
                }}
                className="btn btn-outline"
                style={{ fontWeight: 600 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
