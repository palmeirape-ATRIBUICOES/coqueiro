import React, { useState } from 'react';

export default function ProductCard({ p, company, addToCart, updateCartQty, cart, isMobile }) {
  // If product has a wholesale option, default to it, otherwise unit
  const hasAtacado = p.packagePrice && p.packageItems && p.packageItems > 1;
  const [variant, setVariant] = useState(hasAtacado ? 'atacado' : 'unit');

  // Find this specific variant in cart
  const cartItemId = `${p.id}-${variant}`;
  const cartItem = cart.find(item => item.cartItemId === cartItemId);
  const qty = cartItem ? cartItem.qty : 0;

  const currentPrice = variant === 'atacado' ? p.packagePrice : p.price;
  const currentUnit = variant === 'atacado' ? `Cx c/ ${p.packageItems}` : (p.unit || 'Unidade');

  const handleAdd = () => {
    addToCart(p, variant, currentPrice, currentUnit);
  };

  const handleUpdate = (delta) => {
    updateCartQty(cartItemId, delta);
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1px solid #f1f5f9',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      borderRadius: isMobile ? '24px' : '16px',
      padding: isMobile ? '12px' : '16px'
    }}>
      {/* Discount Tag */}
      {hasAtacado && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: '#10b981',
          color: 'white',
          fontSize: '9px',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '9999px',
          zIndex: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Atacado
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{
          height: isMobile ? '110px' : '150px',
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '10px' : '12px',
          width: '100%',
          padding: '8px',
          overflow: 'hidden'
        }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.description} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Sem Foto</span>
          )}
        </div>

        {/* Description / Title */}
        <h4 style={{
          fontSize: isMobile ? '13px' : '14px',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: '1.3',
          marginTop: '0',
          marginBottom: '2px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          textTransform: 'uppercase'
        }}>
          {p.description}
        </h4>

        {/* Brand/Subtext */}
        <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8', fontWeight: 500, display: 'block', marginBottom: '2px' }}>
          {p.brand || 'Sem descrição'}
        </span>

        {/* Stock Badge */}
        <span style={{
          display: 'inline-block',
          fontSize: '9px',
          fontWeight: 900,
          padding: '2px 6px',
          borderRadius: '6px',
          marginTop: '4px',
          backgroundColor: p.stock > 0 ? '#ecfdf5' : '#fef2f2',
          color: p.stock > 0 ? '#047857' : '#b91c1c',
          width: 'fit-content'
        }}>
          {p.stock > 0 ? `Estoque: ${p.stock} un` : 'Esgotado'}
        </span>
        
        {/* Variant Tabs */}
        {hasAtacado ? (
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '9999px',
            padding: '2px',
            marginBottom: isMobile ? '10px' : '12px',
            marginTop: isMobile ? '8px' : '10px',
            width: '100%'
          }}>
            <button
              onClick={() => setVariant('atacado')}
              style={{
                flex: 1,
                border: 'none',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '9999px',
                cursor: 'pointer',
                backgroundColor: variant === 'atacado' ? '#ffffff' : 'transparent',
                color: variant === 'atacado' ? '#0f172a' : '#64748b',
                boxShadow: variant === 'atacado' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.1s'
              }}
            >
              Caixa
            </button>
            <button
              onClick={() => setVariant('unit')}
              style={{
                flex: 1,
                border: 'none',
                padding: '4px 8px',
                fontSize: '10px',
                fontWeight: 700,
                borderRadius: '9999px',
                cursor: 'pointer',
                backgroundColor: variant === 'unit' ? '#ffffff' : 'transparent',
                color: variant === 'unit' ? '#0f172a' : '#64748b',
                boxShadow: variant === 'unit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.1s'
              }}
            >
              Unid
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, marginTop: '8px' }}>
            {currentUnit}
          </div>
        )}

        {/* Pricing details and actions Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '8px',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {variant === 'atacado' && (
              <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>
                R$ {Number(p.price || 0).toFixed(2)}/un
              </span>
            )}
            <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: company.primaryColor }}>
              R$ {Number(currentPrice || 0).toFixed(2)}
            </span>
          </div>

          {/* Cart actions */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              disabled={p.stock <= 0}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: p.stock > 0 ? company.primaryColor : '#cbd5e1',
                color: 'white',
                border: 'none',
                fontSize: '18px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: p.stock > 0 ? 'pointer' : 'not-allowed',
                boxShadow: p.stock > 0 ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                transition: 'transform 0.1s active'
              }}
            >
              +
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '2px',
              height: '36px'
            }}>
              <button 
                onClick={() => handleUpdate(-1)}
                style={{
                  border: 'none',
                  background: 'none',
                  width: '24px',
                  height: '100%',
                  cursor: 'pointer',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >-</button>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', minWidth: '18px', textAlign: 'center' }}>{qty}</span>
              <button 
                onClick={() => handleUpdate(1)}
                style={{
                  border: 'none',
                  background: 'none',
                  width: '24px',
                  height: '100%',
                  cursor: 'pointer',
                  color: '#475569',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
