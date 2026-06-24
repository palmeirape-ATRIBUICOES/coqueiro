import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useWhitelabel } from '../WhitelabelContext';

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeProduct, merchant }) {
  const navigate = useNavigate();
  const { theme } = useWhitelabel();

  if (!isOpen) return null;

  const minOrder = merchant?.minOrder || 300;
  
  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.packagePrice * item.qty), 0);
  const progressPercent = Math.min(100, (subtotal / minOrder) * 100);
  const remaining = Math.max(0, minOrder - subtotal);
  const isMinMet = subtotal >= minOrder;

  const handleCheckoutClick = () => {
    if (isMinMet) {
      onClose();
      navigate('/checkout');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)'
        }}
      />

      {/* Drawer Body */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        backgroundColor: 'white',
        boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} style={{ color: theme.primaryColor }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Seu Carrinho
            </h3>
            <span style={{
              backgroundColor: `${theme.primaryColor}15`,
              color: theme.primaryColor,
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)} {cart.reduce((sum, item) => sum + item.qty, 0) === 1 ? 'caixa' : 'caixas'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '50%'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Minimum Order Limit Message */}
        <div style={{
          padding: '20px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
            <span style={{ color: isMinMet ? theme.secondaryColor : '#d97706' }}>
              {isMinMet ? '🎉 Pedido mínimo atingido!' : `Faltam R$ ${remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para o pedido mínimo`}
            </span>
            <span style={{ color: '#0f172a' }}>
              R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {minOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: isMinMet ? theme.secondaryColor : theme.primaryColor,
              borderRadius: '999px',
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
          
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', lineHeight: '1.4' }}>
            * Como esta é uma compra no atacado para {merchant?.name}, o distribuidor exige o valor mínimo de R$ {minOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.
          </p>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: '#94a3b8'
            }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', fontWeight: 500 }}>Seu carrinho está vazio</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Adicione caixas de produtos da nossa loja.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  {/* Product Image */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.description}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      padding: '4px',
                      backgroundColor: 'white'
                    }}
                  />

                  {/* Product Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0f172a',
                      lineHeight: '1.3',
                      marginBottom: '4px'
                    }}>
                      {item.description}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      Cxs com {item.packageQtd} un • R$ {item.packagePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/cx
                    </span>

                    {/* Quantity Controls & Price */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      {/* Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '32px'
                      }}>
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          style={{
                            border: 'none',
                            background: '#f8fafc',
                            width: '28px',
                            height: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: '#475569'
                          }}
                        >-</button>
                        <span style={{
                          padding: '0 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          minWidth: '28px',
                          textAlign: 'center',
                          color: '#0f172a'
                        }}>{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          style={{
                            border: 'none',
                            background: '#f8fafc',
                            width: '28px',
                            height: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: '#475569'
                          }}
                        >+</button>
                      </div>

                      {/* Line Price */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: '#0f172a'
                        }}>
                          R$ {(item.packagePrice * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeProduct(item.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: '4px',
                      alignSelf: 'flex-start'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>
                Total Geral
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={!isMinMet}
              className={`btn btn-primary`}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isMinMet ? theme.primaryColor : '#cbd5e1',
                color: isMinMet ? 'white' : '#94a3b8',
                borderColor: 'transparent'
              }}
            >
              Ir para o Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
