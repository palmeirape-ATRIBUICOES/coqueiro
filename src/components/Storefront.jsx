import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import CartDrawer from './CartDrawer';
import { Search, ShoppingCart, LogOut, ChevronRight, User, Tag, HelpCircle } from 'lucide-react';

export default function Storefront() {
  const navigate = useNavigate();
  const { theme } = useWhitelabel();
  
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    // 1. Authenticate Merchant
    const storedMerchant = localStorage.getItem('clubbi_active_merchant');
    if (!storedMerchant) {
      navigate('/login');
      return;
    }
    const m = JSON.parse(storedMerchant);
    setMerchant(m);

    // 2. Load Products Catalog
    setProducts(getProducts());

    // 3. Load Cart from session (to preserve states if navigated back)
    const storedCart = localStorage.getItem(`cart_${m.code}`);
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [navigate]);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (merchant) {
      localStorage.setItem(`cart_${merchant.code}`, JSON.stringify(cart));
    }
  }, [cart, merchant]);

  // Carousel timer
  useEffect(() => {
    if (theme.banners && theme.banners.length > 1) {
      const timer = setInterval(() => {
        setActiveBanner(prev => (prev + 1) % theme.banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [theme.banners]);

  const handleLogout = () => {
    localStorage.removeItem('clubbi_active_merchant');
    navigate('/login');
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

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.description.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  // Group products into lists for homepage layout when no search is active
  const previouslyOrdered = products.slice(0, 6);
  const bestSellers = products.slice(6, 12);
  const restOfProducts = products.slice(12);

  const cartTotal = cart.reduce((sum, item) => sum + (item.packagePrice * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (!merchant) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      
      {/* 1. Store Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div className="container" style={{
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          {/* Logo */}
          <div 
            onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            {theme.logoType === 'image' && theme.logoUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', height: '48px', padding: '4px 0' }}>
                <img 
                  src={theme.logoUrl} 
                  alt={theme.logoText} 
                  style={{ height: '100%', maxWidth: '180px', objectFit: 'contain' }} 
                />
              </div>
            ) : (
              <>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: theme.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '20px',
                  boxShadow: `0 4px 10px ${theme.primaryColor}30`
                }}>
                  {theme.logoText.substring(0, 2).toUpperCase()}
                </div>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.5px'
                }}>
                  {theme.logoText}
                </span>
              </>
            )}
          </div>

          {/* Search Box */}
          <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
            <input 
              type="text"
              placeholder="Buscar por produtos, marcas ou categorias..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: '44px',
                borderRadius: '999px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                height: '44px'
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

          {/* Actions & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Merchant info block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              borderRadius: '999px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              maxWidth: '220px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: `${theme.primaryColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.primaryColor
              }}>
                <User size={14} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {merchant.name}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Cod: {merchant.code}
                </span>
              </div>
            </div>

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn btn-outline"
              style={{
                position: 'relative',
                borderRadius: '999px',
                height: '44px',
                width: '44px',
                padding: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: theme.accentColor,
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  padding: '2px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
              title="Sair da Loja"
              style={{
                borderRadius: '999px',
                height: '44px',
                width: '44px',
                padding: 0,
                color: '#ef4444'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Banner Slider (Only if no active search or category filter) */}
      {search === '' && activeCategory === 'Todos' && theme.banners && theme.banners.length > 0 && (
        <div style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
          {theme.banners.map((url, idx) => (
            <div 
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.6) 20%, transparent 60%), url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: idx === activeBanner ? 1 : 0,
                transform: idx === activeBanner ? 'scale(1)' : 'scale(1.03)',
                transition: 'opacity 0.8s ease, transform 0.8s ease',
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                padding: '0 64px'
              }}
            >
              <div className="container" style={{ width: '100%', textAlign: 'left' }}>
                <div style={{ maxWidth: '480px' }}>
                  <span style={{
                    backgroundColor: theme.secondaryColor,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Melhor Preço Garantido
                  </span>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '38px',
                    fontWeight: 800,
                    color: 'white',
                    marginTop: '12px',
                    lineHeight: '1.2'
                  }}>
                    Abasteça seu comércio direto da distribuidora
                  </h2>
                  <p style={{ fontSize: '15px', color: '#e2e8f0', marginTop: '8px', lineHeight: '1.5' }}>
                    Entregas rápidas em 24h, prazos especiais e pagamento facilitado no boleto. Faça seu pedido em 1-clique!
                  </p>
                  <button 
                    onClick={() => {
                      // Scroll to products
                      document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary"
                    style={{ marginTop: '20px', padding: '12px 24px', fontSize: '15px' }}
                  >
                    Ver Ofertas <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          {theme.banners.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '8px'
            }}>
              {theme.banners.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveBanner(idx)}
                  style={{
                    width: idx === activeBanner ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: idx === activeBanner ? theme.primaryColor : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Grid Area */}
      <main className="container" id="catalog" style={{ flex: 1, padding: '32px 16px' }}>
        
        {/* 3. Horizontal Categories Bar */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', marginBottom: '14px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} style={{ color: theme.primaryColor }} />
            Filtrar por Categoria
          </h3>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollSnapType: 'x mandatory'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  borderRadius: '999px',
                  padding: '10px 20px',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  fontSize: '13px',
                  backgroundColor: activeCategory === cat ? theme.primaryColor : 'white',
                  color: activeCategory === cat ? 'white' : '#475569',
                  borderColor: activeCategory === cat ? theme.primaryColor : '#cbd5e1'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Products Rendering logic */}
        {search !== '' || activeCategory !== 'Todos' ? (
          // FILTERED GRID
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, textAlign: 'left', marginBottom: '20px', color: '#0f172a' }}>
              Resultados da busca ({filteredProducts.length})
            </h2>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#64748b' }}>Nenhum produto encontrado</p>
                <button 
                  onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
                  className="btn btn-text"
                  style={{ marginTop: '12px' }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '24px'
              }}>
                {filteredProducts.map(p => renderProductCard(p))}
              </div>
            )}
          </div>
        ) : (
          // HOMEPAGE SECTIONS
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            {/* Section 1: Pedidos por você */}
            {previouslyOrdered.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#0f172a', textAlign: 'left' }}>
                    Produtos já pedidos por você
                  </h2>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: theme.primaryColor, cursor: 'pointer' }}>
                    Ver histórico
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px'
                }}>
                  {previouslyOrdered.map(p => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section 2: Mais vendidos */}
            {bestSellers.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#0f172a', textAlign: 'left', marginBottom: '20px' }}>
                  Mais Vendidos do Abastecimento
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px'
                }}>
                  {bestSellers.map(p => renderProductCard(p))}
                </div>
              </div>
            )}

            {/* Section 3: Catálogo Completo */}
            {restOfProducts.length > 0 && (
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#0f172a', textAlign: 'left', marginBottom: '20px' }}>
                  Catálogo Completo
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px'
                }}>
                  {restOfProducts.map(p => renderProductCard(p))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating footer for Minimum checkout status indicator */}
      {cartCount > 0 && (
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
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {cartCount} cxs no carrinho • <strong>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </span>
          <span style={{
            backgroundColor: cartTotal >= merchant.minOrder ? theme.secondaryColor : theme.primaryColor,
            color: 'white',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {cartTotal >= merchant.minOrder ? 'Finalizar Pedido' : 'Ver Carrinho'}
          </span>
        </div>
      )}

      {/* 5. Cart Drawer Integration */}
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

  // Card rendering helper
  function renderProductCard(product) {
    const qtyInCart = getProductCartQty(product.id);
    
    return (
      <div key={product.id} className="card" style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        <div>
          {/* Image Container */}
          <div style={{
            position: 'relative',
            height: '160px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            padding: '8px'
          }}>
            <img 
              src={product.imageUrl} 
              alt={product.description}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Supplier badge */}
          <div style={{
            display: 'inline-block',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '2px 6px',
            borderRadius: '4px',
            marginBottom: '8px',
            textAlign: 'left'
          }}>
            {product.supplierName}
          </div>

          {/* Description */}
          <h4 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e293b',
            lineHeight: '1.4',
            marginBottom: '8px',
            textAlign: 'left',
            height: '40px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.description}
          </h4>
        </div>

        {/* Pricing & Cart controls */}
        <div style={{ marginTop: '12px' }}>
          {/* Packaging details */}
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'left',
            marginBottom: '6px'
          }}>
            Cx com {product.packageQtd} un • R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/un
          </div>

          {/* Price of box */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Preço Caixa:</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              R$ {product.packagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Cart Control Toggle */}
          {qtyInCart === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="btn btn-outline"
              style={{
                width: '100%',
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                padding: '8px'
              }}
            >
              Comprar Caixa
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: `2px solid ${theme.primaryColor}`,
              borderRadius: '8px',
              overflow: 'hidden',
              height: '38px',
              backgroundColor: 'white'
            }}>
              <button 
                onClick={() => updateCartQty(product.id, -1)}
                style={{
                  border: 'none',
                  background: 'none',
                  flex: 1,
                  height: '100%',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: theme.primaryColor
                }}
              >-</button>
              <span style={{
                padding: '0 12px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#0f172a',
                textAlign: 'center',
                minWidth: '32px'
              }}>{qtyInCart}</span>
              <button 
                onClick={() => updateCartQty(product.id, 1)}
                style={{
                  border: 'none',
                  background: 'none',
                  flex: 1,
                  height: '100%',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: theme.primaryColor
                }}
              >+</button>
            </div>
          )}
        </div>
      </div>
    );
  }
}
