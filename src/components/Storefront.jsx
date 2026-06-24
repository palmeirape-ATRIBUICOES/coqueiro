import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getOrders } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import CartDrawer from './CartDrawer';
import { Search, ShoppingCart, LogOut, ClipboardList, ShoppingBag, Calendar, Clock } from 'lucide-react';

const categoryEmojiMap = {
  'Todos': '🛍️',
  'Biscoitos': '🍪',
  'Derivados de Leite': '🥛',
  'Preparo de Sobremesas': '🍮',
  'Massas Secas': '🍝',
  'Mercearia': '🥫',
  'Bebidas': '🥤',
  'Hortifruti': '🍎'
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
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'orders'
  const [clientOrders, setClientOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
    const storedUser = localStorage.getItem('clubbi_active_merchant');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(storedUser);
    if (user.role !== 'cliente') {
      navigate('/admin');
      return;
    }
    setMerchant(user);

    // 2. Load products filtered strictly by the client's linked company
    const storeProducts = getProducts(user.companyId);
    setProducts(storeProducts);

    // 3. Load past orders placed by this specific client
    const allOrders = getOrders(user.companyId);
    const filteredOrders = allOrders.filter(o => o.clientCode === user.code);
    setClientOrders(filteredOrders);

    // 4. Load active cart
    const storedCart = localStorage.getItem(`cart_${user.code}`);
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [navigate]);

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
    localStorage.removeItem('clubbi_active_merchant');
    navigate('/login');
  };

  const handleRefreshOrders = () => {
    if (merchant) {
      const allOrders = getOrders(merchant.companyId);
      setClientOrders(allOrders.filter(o => o.clientCode === merchant.code));
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const removeProductFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
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
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        color: '#0f172a'
      }}>
        {isMobile ? (
          /* Mobile Header */
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {/* Logo / Company Name */}
              <div 
                onClick={() => { setSearch(''); setActiveCategory('Todos'); setActiveTab('catalog'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: company.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '14px'
                }}>
                  {(company.logoText || company.name).substring(0, 2).toUpperCase()}
                </div>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  {company.logoText || company.name}
                </span>
              </div>

              {/* Delivery Address Condensed */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                borderRadius: '12px',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 600,
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={merchant.address}
              >
                <span>📍</span>
                <span>{merchant.address ? merchant.address.split(',')[1]?.trim() || merchant.address : 'Entrega'}</span>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {activeTab === 'catalog' && (
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar produtos..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: '38px',
                    borderRadius: '999px',
                    border: '1px solid var(--border-color)',
                    height: '38px',
                    fontSize: '13px',
                    backgroundColor: '#f8fafc',
                    width: '100%'
                  }}
                />
                <Search 
                  size={14} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          /* Desktop Header */
          <div className="container" style={{
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* Logo */}
            <div 
              onClick={() => { setSearch(''); setActiveCategory('Todos'); setActiveTab('catalog'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: company.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '18px'
              }}>
                {(company.logoText || company.name).substring(0, 2).toUpperCase()}
              </div>
              <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {company.logoText || company.name}
              </span>
            </div>

            {/* Delivery address badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: company.secondaryColor || '#ece6fc',
              color: company.primaryColor || '#3e34d3',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              maxWidth: '380px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={merchant.address || 'Entrega'}
            >
              <span>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Entregar em: {merchant.address || 'Endereço não cadastrado'}
              </span>
            </div>

            {/* Search Box (Only on catalog tab) */}
            {activeTab === 'catalog' ? (
              <div style={{ flex: 1, maxWidth: '340px', position: 'relative' }}>
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar produtos ou marcas..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    paddingLeft: '40px',
                    borderRadius: '999px',
                    border: '1.5px solid var(--border-color)',
                    height: '40px',
                    fontSize: '13px'
                  }}
                />
                <Search 
                  size={16} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-light)'
                  }}
                />
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              
              {/* Tab Toggles */}
              <div style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '4px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <button
                  onClick={() => setActiveTab('catalog')}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'catalog' ? '#ffffff' : 'transparent',
                    color: activeTab === 'catalog' ? company.primaryColor : '#64748b',
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
                  onClick={() => { setActiveTab('orders'); handleRefreshOrders(); }}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === 'orders' ? '#ffffff' : 'transparent',
                    color: activeTab === 'orders' ? company.primaryColor : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: activeTab === 'orders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <ClipboardList size={14} /> Meus Pedidos
                </button>
              </div>

              {/* Cart Trigger */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="btn btn-outline"
                style={{
                  borderRadius: '20px',
                  height: '40px',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  borderColor: company.primaryColor,
                  color: company.primaryColor,
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <ShoppingCart size={16} />
                <span>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                {cartCount > 0 && (
                  <span style={{
                    backgroundColor: company.accentColor,
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Exit */}
              <button 
                onClick={handleLogout}
                className="btn btn-outline"
                title="Sair"
                style={{
                  borderRadius: '50%',
                  height: '40px',
                  width: '40px',
                  padding: 0,
                  color: 'var(--danger)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Banner Slider (Only on catalog and when no filters active) */}
      {activeTab === 'catalog' && search === '' && activeCategory === 'Todos' && company.banners && company.banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: isMobile ? '130px' : '200px', overflow: 'hidden', backgroundColor: 'var(--border-color)' }}>
          {company.banners.map((url, idx) => (
            <div 
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.7) 30%, transparent 80%), url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: idx === activeBanner ? 1 : 0,
                transition: 'opacity 0.8s ease',
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '0 16px' : '0 48px'
              }}
            >
              <div className="container" style={{ width: '100%', textAlign: 'left', color: 'white' }}>
                <div style={{ maxWidth: '440px' }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: isMobile ? '18px' : '26px',
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: '1.2'
                  }}>
                    Abasteça seu comércio com a Clubbi
                  </h2>
                  <p style={{ fontSize: isMobile ? '11px' : '13px', color: '#cbd5e1', marginTop: '4px' }}>
                    Preços direto da distribuidora e entrega rápida. Reponha seu estoque em 1-click!
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Main content */}
      <main className="container" style={{ flex: 1, padding: isMobile ? '16px' : '24px 16px' }}>
        
        {/* CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div>
            {/* Category selection */}
            <div style={{ marginBottom: '24px' }}>
              {isMobile ? (
                /* Mobile categories: circular scrollable list */
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  overflowX: 'auto',
                  paddingBottom: '12px',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}>
                  {categories.map(cat => {
                    const isActive = activeCategory === cat;
                    return (
                      <div
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          minWidth: '70px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? company.primaryColor : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                          border: isActive ? `2px solid ${company.primaryColor}` : '1px solid #e2e8f0',
                          transition: 'transform 0.15s ease'
                        }}>
                          {getCategoryEmoji(cat)}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? company.primaryColor : '#475569',
                          whiteSpace: 'nowrap',
                          maxWidth: '75px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {cat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Desktop categories: pills */
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px'
                }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                      style={{
                        borderRadius: '999px',
                        padding: '8px 16px',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        fontSize: '12px',
                        backgroundColor: activeCategory === cat ? company.primaryColor : '#ffffff',
                        color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                        borderColor: activeCategory === cat ? company.primaryColor : 'var(--border-color)'
                      }}
                    >
                      <span style={{ marginRight: '6px' }}>{getCategoryEmoji(cat)}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products grid */}
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, textAlign: 'left', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {activeCategory === 'Todos' ? 'Ofertas Recomendadas' : activeCategory} {search && `• Busca: "${search}"`}
              </h2>

              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: isMobile ? '12px' : '20px'
                }}>
                  {filteredProducts.map(p => {
                    const qty = getProductCartQty(p.id);
                    return (
                      <div key={p.id} className="card" style={{
                        padding: isMobile ? '12px' : '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#ffffff',
                        textAlign: 'left',
                        boxShadow: 'none',
                        position: 'relative'
                      }}>
                        {/* Discount Tag */}
                        {p.packageItems && p.packageItems > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            zIndex: 2
                          }}>
                            Atacado
                          </div>
                        )}

                        <div>
                          {/* Image */}
                          <div style={{
                            height: isMobile ? '100px' : '130px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                            padding: '4px',
                            border: '1px solid #f1f5f9'
                          }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.description} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Sem Foto</span>
                            )}
                          </div>

                          {/* Brand */}
                          <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                            {p.brand}
                          </span>
                          
                          {/* Description */}
                          <h4 style={{
                            fontSize: isMobile ? '12px' : '13px',
                            fontWeight: 600,
                            color: '#0f172a',
                            lineHeight: '1.4',
                            marginTop: '2px',
                            height: '36px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {p.description}
                          </h4>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          {/* Packaging info */}
                          <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '6px', fontWeight: 500 }}>
                            {p.unit ? p.unit : 'Unidade'}
                          </div>

                          {/* Pricing details */}
                          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Preço unitário:</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <span style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 800, color: '#0f172a' }}>
                                R$ {p.price.toFixed(2)}
                              </span>
                            </div>
                            {p.packagePrice && p.packageItems && p.packageItems > 1 && (
                              <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                                Caixa: R$ {p.packagePrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Cart Add Button */}
                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(p)}
                              className="btn btn-outline"
                              style={{
                                width: '100%',
                                padding: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                color: company.primaryColor,
                                borderColor: company.primaryColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer'
                              }}
                            >
                              <span>+</span> Adicionar
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: `2px solid ${company.primaryColor}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              height: '30px'
                            }}>
                              <button 
                                onClick={() => updateCartQty(p.id, -1)}
                                style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: company.primaryColor, fontWeight: 700 }}
                              >-</button>
                              <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                              <button 
                                onClick={() => updateCartQty(p.id, 1)}
                                style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: company.primaryColor, fontWeight: 700 }}
                              >+</button>
                            </div>
                          )}
                        </div>
                      </div>
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
              Acompanhamento de Orçamentos
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
                      <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                        Retirada presencial na loja: <strong>{company.address}</strong>
                      </span>
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

      {/* Floating total footer (Only on desktop catalog) */}
      {!isMobile && activeTab === 'catalog' && cartCount > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '999px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          zIndex: 999,
          cursor: 'pointer'
        }}
        onClick={() => setIsCartOpen(true)}
        >
          <span style={{ fontSize: '13px', fontWeight: 500 }}>
            {cartCount} {cartCount === 1 ? 'item' : 'itens'} no carrinho • <strong>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </span>
          <span style={{
            backgroundColor: company.primaryColor,
            color: 'white',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            Ver Orçamento
          </span>
        </div>
      )}

      {/* 4. Mobile Bottom Navigation Bar */}
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
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          {/* Catalogo Button */}
          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: activeTab === 'catalog' ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <ShoppingBag size={20} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'catalog' ? 700 : 500 }}>Início</span>
          </button>

          {/* Buscar Button */}
          <button
            onClick={handleMobileSearchClick}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#94a3b8',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <Search size={20} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Buscar</span>
          </button>

          {/* Carrinho Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: cartCount > 0 ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              position: 'relative',
              flex: 1
            }}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '20px',
                backgroundColor: company.accentColor,
                color: 'white',
                borderRadius: '50%',
                minWidth: '16px',
                height: '16px',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
            <span style={{ fontSize: '10px', fontWeight: cartCount > 0 ? 700 : 500 }}>Carrinho</span>
          </button>

          {/* Pedidos Button */}
          <button
            onClick={() => { setActiveTab('orders'); handleRefreshOrders(); }}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: activeTab === 'orders' ? company.primaryColor : '#94a3b8',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <ClipboardList size={20} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === 'orders' ? 700 : 500 }}>Pedidos</span>
          </button>

          {/* Sair Button */}
          <button
            onClick={handleLogout}
            style={{
              border: 'none',
              background: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#ef4444',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <LogOut size={20} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Sair</span>
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

    </div>
  );
}
