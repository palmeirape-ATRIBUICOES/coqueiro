import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getOrders, syncFromCloud, getMessages, saveMessages } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import logoImg from '../assets/logo.png';
import CartDrawer from './CartDrawer';
import ProductCard from './ProductCard';
import { Search, ShoppingCart, LogOut, ClipboardList, ShoppingBag, Calendar, Clock } from 'lucide-react';

const categoryEmojiMap = {
  'Todos': '🛍️',
  'Bebidas': '🥤',
  'Hortifruti': '🍎',
  'Mercearia': '🥫',
  'Biscoitos': '🍪',
  'Laticínios': '🧀',
  'Limpeza': '🧹',
  'Higiene': '🧼'
};

const getCategoryEmoji = (cat) => {
  return categoryEmojiMap[cat] || '📦';
};

export default function Storefront() {
  const navigate = useNavigate();
  const { company } = useWhitelabel();
  const searchInputRef = useRef(null);
  
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('coqueiro_client_active_tab');
    return saved === 'orders' ? 'orders' : 'catalog';
  }); // 'catalog' or 'orders'
  const [clientOrders, setClientOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
  const [visibleCount, setVisibleCount] = useState(30);
  const [notificationPermission, setNotificationPermission] = useState('Notification' in window ? Notification.permission : 'denied');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [clientNewMessage, setClientNewMessage] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMobileSearchClick = () => {
    setActiveTab('catalog');
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  useEffect(() => {
    // 1. Authenticate Client
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
    if (!user || user.role !== 'cliente') {
      navigate('/admin');
      return;
    }
    setMerchant(user);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // 2. Load products filtered strictly by the client's linked company (offline cache first)
    setProducts(getProducts(user.companyId));

    // 3. Load past orders placed by this specific client (offline cache first)
    setClientOrders(getOrders(user.companyId).filter(o => o.clientCode === user.code));
    setMessages(getMessages(user.companyId).filter(m => m.clientCode === user.code));

    // 3.1. Sync from Firebase in background and reload state
    syncFromCloud().then(() => {
      setProducts(getProducts(user.companyId));
      setMessages(getMessages(user.companyId).filter(m => m.clientCode === user.code));
      
      const newOrders = getOrders(user.companyId).filter(o => o.clientCode === user.code);
      // Compare status for push notifications
      setClientOrders(prevOrders => {
        newOrders.forEach(newOrder => {
          const oldOrder = prevOrders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            triggerLocalPushNotification(newOrder.id, newOrder.status);
          }
        });
        return newOrders;
      });
    });

    // 4. Load active cart
    const storedCart = localStorage.getItem(`cart_${user.code}`);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCart([]);
      }
    }

    // 5. Setup periodic background syncing for real-time order status tracking
    const interval = setInterval(() => {
      syncFromCloud().then(() => {
        setMessages(getMessages(user.companyId).filter(m => m.clientCode === user.code));
        const newOrders = getOrders(user.companyId).filter(o => o.clientCode === user.code);
        setClientOrders(prevOrders => {
          newOrders.forEach(newOrder => {
            const oldOrder = prevOrders.find(o => o.id === newOrder.id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              triggerLocalPushNotification(newOrder.id, newOrder.status);
            }
          });
          return newOrders;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  const triggerLocalPushNotification = (orderId, newStatus) => {
    const title = `Orçamento Atualizado! 🛍️`;
    const body = `O status do orçamento #${orderId} foi alterado para: ${newStatus}`;
    const tag = `order-status-${orderId}`;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.5, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.3);
      }, 150);
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }

    showNativeNotification(title, body, tag);
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

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          showNativeNotification('Casa Coqueiro', 'Notificações ativadas com sucesso! 🎉', 'setup-success');
        }
      });
    }
  };

  // Reset pagination limit on search query or category change to keep UI instant
  useEffect(() => {
    setVisibleCount(30);
  }, [search, activeCategory]);

  // Infinite Scroll scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const threshold = 350; // trigger distance in px from bottom
      const position = window.innerHeight + window.scrollY;
      const height = document.documentElement.scrollHeight;
      if (position >= height - threshold) {
        setVisibleCount(prev => prev + 30);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync cart
  useEffect(() => {
    if (merchant) {
      localStorage.setItem(`cart_${merchant.code}`, JSON.stringify(cart));
    }
  }, [cart, merchant]);

  // Rotate banner timer
  useEffect(() => {
    if (company.banners && company.banners.length > 1) {
      const timer = setInterval(() => {
        setActiveBanner(prev => (prev + 1) % company.banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [company.banners]);

  const handleLogout = () => {
    localStorage.removeItem('coqueiro_active_merchant');
    navigate('/login');
  };

  const handleRefreshOrders = () => {
    if (merchant) {
      const allOrders = getOrders(merchant.companyId);
      setClientOrders(allOrders.filter(o => o.clientCode === merchant.code));
    }
  };

  // Cart operations
  const addToCart = (product, variant, price, unit) => {
    setCart(prev => {
      const cartItemId = `${product.id}-${variant}`;
      const exists = prev.find(item => item.cartItemId === cartItemId);
      if (exists) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { ...product, cartItemId, variant, price, unit, qty: 1 }];
      }
    });
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeProductFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const getProductCartQty = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.qty : 0;
  };

  // Filter Catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.description.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const inStock = p.stock !== undefined ? Number(p.stock) > 0 : true;
    return matchesSearch && matchesCategory && inStock;
  });

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);
  const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Recebido': return 'badge-pending';
      case 'Em Separação': return 'badge-shipping';
      case 'Separado': return 'badge-active';
      case 'Aguardando Retirada': return 'badge-delivered';
      case 'Retirado': return 'badge-delivered';
      case 'Cancelado': return 'badge-inactive';
      default: return 'badge-pending';
    }
  };

  const getStatusTranslation = (status) => {
    switch (status) {
      case 'Recebido': return 'Recebido';
      case 'Em Separação': return 'Em Separação';
      case 'Separado': return 'Separado';
      case 'Aguardando Retirada': return 'Aguardando Retirada';
      case 'Retirado': return 'Retirado';
      case 'Cancelado': return 'Cancelado';
      default: return status;
    }
  };

  if (!merchant) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      paddingBottom: isMobile ? '80px' : '0px'
    }}>
      
      {/* 1. Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: company.primaryColor,
        borderBottom: 'none',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        color: '#ffffff'
      }}>
        {isMobile ? (
          /* Mobile Header - screenshot replica */
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent'
          }}>
            {/* Left side: store name and greeting */}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  <img 
                  src={logoImg} 
                  alt="" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    backgroundColor: 'white',
                    padding: '2px',
                    marginRight: '4px'
                  }} 
                />
                </div>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {company.name}
                </span>
              </div>
              <span style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '4px',
                fontWeight: 500
              }}>
                Olá, {merchant?.name ? merchant.name.toLowerCase() : 'visitante'}
              </span>
            </div>

            {/* Right side: round actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  position: 'relative'
                }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: '#ffffff',
                    color: company.primaryColor,
                    borderRadius: '50%',
                    minWidth: '16px',
                    height: '16px',
                    fontSize: '9px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Chat Button */}
              <button
                onClick={() => setIsChatOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <span style={{ fontSize: '16px' }}>💬</span>
              </button>

              {/* Sair Button */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  minHeight: '36px'
                }}
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          /* Desktop Header - screenshot replica */
          <div className="container" style={{
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'transparent'
          }}>
            {/* Left side: store name and greeting */}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src={logoImg} 
                  alt="" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'contain',
                    backgroundColor: 'white',
                    padding: '2px',
                    marginRight: '6px'
                  }} 
                />
                <span style={{
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {company.name}
                </span>
              </div>
              <span style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: '4px',
                fontWeight: 500
              }}>
                Olá, {merchant?.name ? merchant.name.toLowerCase() : 'visitante'}
              </span>
            </div>

            {/* Right side: actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Tab selector on desktop */}
              <div style={{
                display: 'flex',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '4px',
                borderRadius: '8px',
                border: 'none',
                marginRight: '12px'
              }}>
                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    localStorage.setItem('coqueiro_client_active_tab', 'catalog');
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'catalog' ? '#ffffff' : 'transparent',
                    color: activeTab === 'catalog' ? company.primaryColor : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'catalog' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <ShoppingBag size={14} /> Catálogo
                </button>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    localStorage.setItem('coqueiro_client_active_tab', 'orders');
                    handleRefreshOrders();
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'orders' ? '#ffffff' : 'transparent',
                    color: activeTab === 'orders' ? company.primaryColor : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'orders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <ClipboardList size={14} /> Seu Orçamento
                </button>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                style={{
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <ShoppingCart size={16} />
                <span>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                {cartCount > 0 && (
                  <span style={{
                    backgroundColor: '#ffffff',
                    color: company.primaryColor,
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '10px',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Support chat */}
              <button
                onClick={() => setIsChatOpen(true)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff'
                }}
              >
                <span style={{ fontSize: '18px' }}>💬</span>
              </button>

              {/* Sair Button */}
              <button
                onClick={handleLogout}
                style={{
                  padding: '0 16px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  height: '40px'
                }}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </header>


      {/* 3. Main content */}
      <main className="container" style={{ flex: 1, padding: isMobile ? '16px' : '24px 16px' }}>
        {/* iOS/PWA Notification Permission Banner */}
        {('Notification' in window) && notificationPermission === 'default' && (
          <div style={{
            backgroundColor: `${company.primaryColor}15`,
            border: `1px solid ${company.primaryColor}30`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Receber Alertas de Orçamentos
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Ative as notificações para receber avisos de novos orçamentos e alterações de status.
                </p>
              </div>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="btn btn-primary"
              style={{
                backgroundColor: company.primaryColor,
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
        
        {/* CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div>
            {/* Category selection */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-none py-2 w-full whitespace-nowrap scroll-smooth select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
                {categories.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`rounded-full py-2 px-4 whitespace-nowrap font-bold text-xs cursor-pointer border transition-all flex items-center gap-1.5
                        ${isActive ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                      style={{ backgroundColor: isActive ? company.primaryColor : undefined }}
                    >
                      {cat === 'Todos' ? '🏷️ Todos' : `${getCategoryEmoji(cat)} ${cat}`}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Search Box - Premium like reference site */}
            <div style={{ position: 'relative', marginBottom: '24px', width: '100%' }}>
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="O que você está procurando hoje?"
                className="form-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '44px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  height: '48px',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  width: '100%',
                  outline: 'none'
                }}
              />
              <Search 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
            </div>

            {/* Products grid */}
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, textAlign: 'left', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {activeCategory === 'Todos' ? 'Ofertas Recomendadas' : activeCategory} {search && `• Busca: "${search}"`}
              </h2>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                  <p className="text-sm font-semibold text-gray-500">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
                  {filteredProducts.slice(0, visibleCount).map(p => {
                    return (
                      <ProductCard 
                        key={p.id} 
                        p={p} 
                        company={company} 
                        addToCart={addToCart} 
                        updateCartQty={updateCartQty} 
                        cart={cart} 
                        isMobile={isMobile} 
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TRACKING VIEW */}
        {activeTab === 'orders' && (
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Seu Orçamento
            </h2>

            {clientOrders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', backgroundColor: '#ffffff' }}>
                Nenhum orçamento solicitado ainda. Adicione itens e finalize para enviar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clientOrders.map(ord => (
                  <div key={ord.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '14px' }}>Código: {ord.id}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} /> {new Date(ord.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {new Date(ord.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(ord.status)}`} style={{ fontSize: '10px' }}>
                        {getStatusTranslation(ord.status)}
                      </span>
                    </div>

                    {/* Items detail list */}
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            • {item.description} ({item.qty} un)
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            R$ {(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {ord.notes && (
                      <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}>
                        <strong>Observação:</strong> {ord.notes}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '6px' }}>
                      
                      <strong style={{ fontSize: '15px', color: company.primaryColor }}>
                        Total: R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating total footer */}
      {activeTab === 'catalog' && cartCount > 0 && (
        <div 
          className="fixed left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[998] animate-slide-up"
          style={{ bottom: isMobile ? '80px' : '16px' }}
        >
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full text-white py-4 px-6 rounded-2xl flex items-center justify-between shadow-lg active:scale-95 transition-all font-bold cursor-pointer border-none"
            style={{ backgroundColor: company.primaryColor }}
          >
            <span className="flex items-center gap-2">
              <span>🛒 Ver Carrinho</span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-black">{cartCount}</span>
            </span>
            <span>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} →</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateCartQty}
        removeProduct={removeProductFromCart}
        merchant={merchant}
      />

      {/* Support Chat Drawer */}
      {isChatOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)'
        }}>
          {/* Backdrop Click */}
          <div 
            onClick={() => setIsChatOpen(false)} 
            style={{ flex: 1 }} 
          />
          
          {/* Drawer Panel */}
          <div style={{
            width: isMobile ? '100%' : '420px',
            backgroundColor: '#ffffff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            animation: 'slide-left 0.3s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: company.primaryColor,
              color: '#ffffff'
            }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Atendimento Facilitadora</h3>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Fale com nosso vendedor pelo app</span>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontWeight: 900
                }}
              >
                ✕
              </button>
            </div>

            {/* Message History */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f8fafc'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-secondary)',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '32px' }}>💬</span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Olá! Como podemos te ajudar hoje?</p>
                  <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, textAlign: 'center', padding: '0 20px' }}>
                    Envie uma mensagem abaixo e nosso time comercial responderá direto no seu app.
                  </p>
                </div>
              ) : (
                messages.map(m => {
                  const isMe = m.sender === 'cliente';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        borderTopRightRadius: isMe ? '4px' : '16px',
                        borderTopLeftRadius: !isMe ? '4px' : '16px',
                        backgroundColor: isMe ? company.primaryColor : '#ffffff',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
                if (!clientNewMessage.trim()) return;

                const newMsg = {
                  id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  companyId: merchant.companyId,
                  clientCode: merchant.code,
                  clientName: merchant.name,
                  sender: 'cliente',
                  senderName: merchant.name,
                  text: clientNewMessage.trim(),
                  timestamp: new Date().toISOString()
                };

                const nextMessages = [...messages, newMsg];
                saveMessages(nextMessages);
                setMessages(nextMessages);
                setClientNewMessage('');
              }}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '10px',
                backgroundColor: '#ffffff'
              }}
            >
              <input
                type="text"
                placeholder="Escreva sua mensagem..."
                className="form-input"
                value={clientNewMessage}
                onChange={(e) => setClientNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  borderRadius: '12px',
                  height: '42px',
                  fontSize: '13px'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  backgroundColor: company.primaryColor,
                  border: 'none',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0 20px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Enviar
              </button>
            </form>
          </div>
          
          <style>{`
            @keyframes slide-left {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 999,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.04)'
        }}>
          {/* Tab: Catalog */}
          <button
            onClick={() => {
              setActiveTab('catalog');
              localStorage.setItem('coqueiro_client_active_tab', 'catalog');
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: activeTab === 'catalog' ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            <ShoppingBag size={20} style={{ color: activeTab === 'catalog' ? company.primaryColor : '#94a3b8' }} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'catalog' ? 700 : 500 }}>Catálogo</span>
          </button>

          {/* Tab: Orders (Seu Orçamento) */}
          <button
            onClick={() => {
              setActiveTab('orders');
              localStorage.setItem('coqueiro_client_active_tab', 'orders');
              handleRefreshOrders();
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: activeTab === 'orders' ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            <ClipboardList size={20} style={{ color: activeTab === 'orders' ? company.primaryColor : '#94a3b8' }} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'orders' ? 700 : 500 }}>Seu Orçamento</span>
          </button>

          {/* Tab: Support Chat */}
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: isChatOpen ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              flex: 1,
              height: '100%'
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1, filter: isChatOpen ? 'none' : 'grayscale(100%)' }}>💬</span>
            <span style={{ fontSize: '10px', fontWeight: isChatOpen ? 700 : 500 }}>Chat</span>
          </button>
        </div>
      )}

    </div>
  );
}
