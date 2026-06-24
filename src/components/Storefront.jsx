import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, getOrders } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import CartDrawer from './CartDrawer';
import { Search, ShoppingCart, LogOut, ChevronRight, User, Tag, ClipboardList, ShoppingBag, MapPin, Calendar, Clock } from 'lucide-react';

export default function Storefront() {
  const navigate = useNavigate();
  const { company } = useWhitelabel();
  
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'orders'
  const [clientOrders, setClientOrders] = useState([]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      
      {/* 1. Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* Logo container */}
          <div 
            onClick={() => { setSearch(''); setActiveCategory('Todos'); setActiveTab('catalog'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            {company.logoType === 'image' && company.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', height: '44px' }}>
                <img 
                  src={company.logoUrl} 
                  alt={company.name} 
                  style={{ height: '100%', maxWidth: '180px', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <>
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
                  color: 'var(--text-primary)'
                }}>
                  {company.logoText || company.name}
                </span>
              </>
            )}
          </div>

          {/* Search Box (Only on catalog tab) */}
          {activeTab === 'catalog' ? (
            <div style={{ flex: 1, maxWidth: '440px', position: 'relative' }}>
              <input 
                type="text"
                placeholder="Buscar produtos ou marcas..."
                className="form-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: '44px',
                  borderRadius: '999px',
                  border: '1.5px solid var(--border-color)',
                  height: '42px'
                }}
              />
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }}
              />
            </div>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {/* User info & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Tab Toggles */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-color)',
              padding: '4px',
              borderRadius: '8px',
              border: '1.5px solid var(--border-color)'
            }}>
              <button
                onClick={() => setActiveTab('catalog')}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTab === 'catalog' ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === 'catalog' ? company.primaryColor : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
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
                  background: activeTab === 'orders' ? 'var(--card-bg)' : 'transparent',
                  color: activeTab === 'orders' ? company.primaryColor : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ClipboardList size={14} /> Meus Pedidos
              </button>
            </div>

            {/* Profile */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-color)',
              border: '1.5px solid var(--border-color)',
              maxWidth: '180px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'left' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {merchant.name}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                  Acesso: {merchant.code}
                </span>
              </div>
            </div>

            {/* Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn btn-outline"
              style={{
                position: 'relative',
                borderRadius: '50%',
                height: '42px',
                width: '42px',
                padding: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: company.accentColor,
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
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
                height: '42px',
                width: '42px',
                padding: 0,
                color: 'var(--danger)',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Banner Slider (Only on catalog and when no filters active) */}
      {activeTab === 'catalog' && search === '' && activeCategory === 'Todos' && company.banners && company.banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', backgroundColor: 'var(--border-color)' }}>
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
                padding: '0 48px'
              }}
            >
              <div className="container" style={{ width: '100%', textAlign: 'left', color: 'white' }}>
                <div style={{ maxWidth: '440px' }}>
                  <span style={{
                    backgroundColor: company.secondaryColor,
                    color: '#0f172a',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Catálogo Digital de Orçamentos
                  </span>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '32px',
                    fontWeight: 800,
                    marginTop: '8px',
                    color: 'white'
                  }}>
                    Faça seus pedidos e retire na loja
                  </h2>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
                    Adicione os produtos ao carrinho e envie o orçamento direto para nossos vendedores. Rápido e prático!
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Main content */}
      <main className="container" style={{ flex: 1, padding: '24px 16px' }}>
        
        {/* CATALOG VIEW */}
        {activeTab === 'catalog' && (
          <div>
            {/* Category selection */}
            <div style={{ marginBottom: '24px' }}>
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
                      backgroundColor: activeCategory === cat ? company.primaryColor : 'var(--card-bg)',
                      color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                      borderColor: activeCategory === cat ? company.primaryColor : 'var(--border-color)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products grid */}
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, textAlign: 'left', marginBottom: '20px', color: 'var(--text-primary)' }}>
                {activeCategory === 'Todos' ? 'Nossos Produtos' : activeCategory} {search && `• Busca: "${search}"`}
              </h2>

              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nenhum produto cadastrado nesta seção.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredProducts.map(p => {
                    const qty = getProductCartQty(p.id);
                    return (
                      <div key={p.id} className="card" style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: '12px',
                        borderColor: 'var(--border-color)',
                        backgroundColor: 'var(--card-bg)',
                        textAlign: 'left'
                      }}>
                        <div>
                          {/* Image */}
                          <div style={{
                            height: '130px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px',
                            padding: '6px',
                            border: '1px solid var(--border-color)'
                          }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.description} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Sem Foto</span>
                            )}
                          </div>

                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                            {p.brand}
                          </span>
                          
                          <h4 style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            lineHeight: '1.4',
                            marginTop: '4px',
                            height: '36px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {p.description}
                          </h4>
                        </div>

                        <div style={{ marginTop: '12px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Código: {p.code} • {p.unit}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Preço unitário:</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                              R$ {p.price.toFixed(2)}
                            </span>
                          </div>

                          {/* Cart Add Button */}
                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(p)}
                              className="btn btn-outline"
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                borderRadius: '8px',
                                color: company.primaryColor,
                                borderColor: company.primaryColor
                              }}
                            >
                              Adicionar
                            </button>
                          ) : (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              border: `2px solid ${company.primaryColor}`,
                              borderRadius: '8px',
                              overflow: 'hidden',
                              height: '34px'
                            }}>
                              <button 
                                onClick={() => updateCartQty(p.id, -1)}
                                style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: company.primaryColor, fontWeight: 700 }}
                              >-</button>
                              <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{qty}</span>
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
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>
              Acompanhamento de Orçamentos
            </h2>

            {clientOrders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Nenhum orçamento solicitado ainda. Adicione itens e finalize para enviar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {clientOrders.map(ord => (
                  <div key={ord.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                      <div>
                        <strong style={{ fontSize: '15px' }}>Código do Pedido: {ord.id}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {new Date(ord.date).toLocaleDateString('pt-BR')}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {new Date(ord.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadgeClass(ord.status)}`}>
                        {getStatusTranslation(ord.status)}
                      </span>
                    </div>

                    {/* Items detail list */}
                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                        backgroundColor: 'var(--bg-color)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        border: '1.5px solid var(--border-color)',
                        color: 'var(--text-secondary)'
                      }}>
                        <strong>Observação:</strong> {ord.notes}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        Retirada presencial na loja: <strong>{company.address}</strong>
                      </span>
                      <strong style={{ fontSize: '16px', color: company.primaryColor }}>
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
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            Ver Orçamento
          </span>
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
