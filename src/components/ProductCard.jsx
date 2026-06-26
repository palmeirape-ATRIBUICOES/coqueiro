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
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      textAlign: 'left',
      boxShadow: 'none',
      position: 'relative',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Discount Tag */}
      {hasAtacado && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          backgroundColor: '#10b981',
          color: 'white',
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          zIndex: 2
        }}>
          Atacado
        </div>
      )}

      <div style={{ padding: isMobile ? '8px' : '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{
          height: isMobile ? '100px' : '150px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: isMobile ? '8px' : '12px',
          width: '100%'
        }}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.description} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Sem Foto</span>
          )}
        </div>

        {/* Brand */}
        <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
          {p.brand}
        </span>
        
        {/* Description */}
        <h4 style={{
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 600,
          color: '#0f172a',
          lineHeight: '1.3',
          marginTop: '0',
          marginBottom: '2px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          flex: 1
        }}>
          {p.description}
        </h4>
        
        {/* Variant Tabs */}
        {hasAtacado ? (
          <div style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            padding: '2px',
            marginBottom: isMobile ? '8px' : '12px',
            marginTop: isMobile ? '4px' : '8px'
          }}>
            <button
              onClick={() => setVariant('atacado')}
              style={{
                flex: 1,
                border: 'none',
                padding: isMobile ? '3px 6px' : '4px 8px',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: variant === 'atacado' ? '#ffffff' : 'transparent',
                color: variant === 'atacado' ? '#0f172a' : '#64748b',
                boxShadow: variant === 'atacado' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Caixa
            </button>
            <button
              onClick={() => setVariant('unit')}
              style={{
                flex: 1,
                border: 'none',
                padding: isMobile ? '3px 6px' : '4px 8px',
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: variant === 'unit' ? '#ffffff' : 'transparent',
                color: variant === 'unit' ? '#0f172a' : '#64748b',
                boxShadow: variant === 'unit' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Unid
            </button>
          </div>
        ) : (
          <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#64748b', marginBottom: isMobile ? '8px' : '12px', fontWeight: 500, marginTop: isMobile ? '4px' : '8px' }}>
            {currentUnit}
          </div>
        )}

        {/* Pricing details */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
          {variant === 'atacado' ? (
            <>
              <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8' }}>
                R$ {Number(p.price || 0).toFixed(2)}/un
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: isMobile ? '15px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                  R$ {Number(currentPrice || 0).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <>
              <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#94a3b8' }}>Preço final</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: isMobile ? '15px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                  R$ {Number(currentPrice || 0).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full width Cart Actions attached to bottom */}
      <div style={{ width: '100%', borderTop: '1px solid #e2e8f0' }}>
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            style={{
              width: '100%',
              padding: isMobile ? '8px' : '10px',
              fontSize: isMobile ? '12px' : '13px',
              fontWeight: 700,
              color: company.primaryColor,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f8fafc'}
          >
            Adicionar {variant === 'atacado' ? 'Caixa' : 'Unidade'}
          </button>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: company.primaryColor,
            color: 'white',
            height: '38px',
            width: '100%'
          }}>
            <button 
              onClick={() => handleUpdate(-1)}
              style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '16px' }}
            >-</button>
            <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>{qty}</span>
            <button 
              onClick={() => handleUpdate(1)}
              style={{ border: 'none', background: 'none', flex: 1, height: '100%', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: '16px' }}
            >+</button>
          </div>
        )}
      </div>
    </div>
  );
}
