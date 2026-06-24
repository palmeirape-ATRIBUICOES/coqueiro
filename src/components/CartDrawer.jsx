import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Clipboard } from 'lucide-react';
import { useWhitelabel } from '../WhitelabelContext';

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeProduct, merchant }) {
  const navigate = useNavigate();
  const { company } = useWhitelabel();
  const [notes, setNotes] = useState('');

  // Load saved notes on mount/open
  useEffect(() => {
    if (isOpen && merchant) {
      const savedNotes = localStorage.getItem(`cart_notes_${merchant.code}`) || '';
      setNotes(savedNotes);
    }
  }, [isOpen, merchant]);

  // Sync notes to localStorage
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    if (merchant) {
      localStorage.setItem(`cart_notes_${merchant.code}`, e.target.value);
    }
  };

  if (!isOpen) return null;

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckoutClick = () => {
    if (cart.length > 0) {
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
        backgroundColor: 'var(--card-bg)',
        borderLeft: '1px solid var(--border-color)',
        boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clipboard size={22} style={{ color: company.primaryColor }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Seu Orçamento
            </h3>
            <span style={{
              backgroundColor: `${company.primaryColor}15`,
              color: company.primaryColor,
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)} {cart.reduce((sum, item) => sum + item.qty, 0) === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-light)'
            }}>
              <Clipboard size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', fontWeight: 500 }}>Seu orçamento está vazio</p>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>Adicione produtos da nossa lista.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  {/* Product Image */}
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.description}
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        padding: '4px',
                        backgroundColor: 'white'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-light)',
                      fontSize: '11px',
                      fontWeight: 600
                    }}>
                      Sem Foto
                    </div>
                  )}

                  {/* Product Info */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: '1.3',
                      marginBottom: '4px'
                    }}>
                      {item.description}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Marca: {item.brand} • Preço: R$ {item.price.toFixed(2)} / {item.unit}
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
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '32px'
                      }}>
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          style={{
                            border: 'none',
                            background: 'var(--bg-color)',
                            width: '28px',
                            height: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}
                        >-</button>
                        <span style={{
                          padding: '0 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          minWidth: '28px',
                          textAlign: 'center',
                          color: 'var(--text-primary)'
                        }}>{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          style={{
                            border: 'none',
                            background: 'var(--bg-color)',
                            width: '28px',
                            height: '100%',
                            cursor: 'pointer',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }}
                        >+</button>
                      </div>

                      {/* Line Price */}
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--text-primary)'
                        }}>
                          R$ {(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                      color: 'var(--text-light)',
                      padding: '4px',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Observations & Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Notes Field */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '13px', fontWeight: 600 }}>Observações / Instruções do Pedido</label>
              <textarea 
                className="form-input"
                placeholder="Ex: bananas maduras, tomates bem vermelhos, etc..."
                rows={2}
                value={notes}
                onChange={handleNotesChange}
                style={{ resize: 'none', fontSize: '13px', border: '1.5px solid var(--border-color)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Total Estimado
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                borderRadius: '10px',
                backgroundColor: company.primaryColor,
                color: 'white',
                border: 'none'
              }}
            >
              Fechar Orçamento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
