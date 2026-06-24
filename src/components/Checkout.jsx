import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, saveOrders } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Truck, Calendar } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { theme } = useWhitelabel();

  const [merchant, setMerchant] = useState(null);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // 1. Check Authentication
    const storedMerchant = localStorage.getItem('clubbi_active_merchant');
    if (!storedMerchant) {
      navigate('/login');
      return;
    }
    const m = JSON.parse(storedMerchant);
    setMerchant(m);
    setAddress(m.address);
    setSelectedTerm(m.paymentTerms?.[0] || 'Pix à Vista');

    // 2. Load Cart
    const storedCart = localStorage.getItem(`cart_${m.code}`);
    if (storedCart) {
      const items = JSON.parse(storedCart);
      if (items.length === 0) {
        navigate('/');
      } else {
        setCart(items);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const subtotal = cart.reduce((sum, item) => sum + (item.packagePrice * item.qty), 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!merchant) return;

    // Validate min order limit again
    if (subtotal < merchant.minOrder) {
      alert(`Erro: O valor mínimo do pedido (R$ ${merchant.minOrder}) não foi atingido.`);
      return;
    }

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newOrderId,
      merchantCode: merchant.code,
      merchantName: merchant.name,
      date: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id,
        description: item.description,
        qty: item.qty,
        price: item.price,
        packageQtd: item.packageQtd,
        packagePrice: item.packagePrice
      })),
      total: parseFloat(subtotal.toFixed(2)),
      paymentTerm: selectedTerm,
      deliveryAddress: address,
      status: 'Pending'
    };

    // Save order to mock database
    const allOrders = getOrders();
    saveOrders([newOrder, ...allOrders]);

    // Clear cart for this merchant
    localStorage.setItem(`cart_${merchant.code}`, '[]');

    setOrderId(newOrderId);
    setIsSuccess(true);
  };

  if (!merchant || cart.length === 0) return null;

  if (isSuccess) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 40px)',
        backgroundColor: '#f8fafc',
        padding: '24px'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          padding: '48px 32px',
          animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${theme.secondaryColor}15`,
            color: theme.secondaryColor,
            marginBottom: '24px'
          }}>
            <CheckCircle size={48} />
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '32px',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '8px'
          }}>
            Pedido Realizado!
          </h1>

          <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
            Seu pedido <strong>{orderId}</strong> foi encaminhado com sucesso para a distribuidora.
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>
              Resumo do Envio
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <MapPin size={16} style={{ color: theme.primaryColor, flexShrink: 0 }} />
                <span>{address}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CreditCard size={16} style={{ color: theme.primaryColor, flexShrink: 0 }} />
                <span>Termo de Pagamento: <strong>{selectedTerm}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Truck size={16} style={{ color: theme.primaryColor, flexShrink: 0 }} />
                <span>Prazo de entrega: <strong>Dentro de 24 horas úteis</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              borderRadius: '10px'
            }}
          >
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline"
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            fontSize: '13px',
            borderRadius: '8px'
          }}
        >
          <ArrowLeft size={16} /> Voltar para a Loja
        </button>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '32px',
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          Finalizar Compra
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Form Side */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery address card */}
            <div className="card" style={{ padding: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <MapPin size={20} style={{ color: theme.primaryColor }} />
                Endereço de Entrega
              </h3>
              
              <div className="form-group">
                <label className="form-label">Endereço Comercial</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ resize: 'none', height: '80px', fontFamily: 'inherit', paddingTop: '10px' }}
                  required
                />
              </div>
            </div>

            {/* Payment term card */}
            <div className="card" style={{ padding: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <CreditCard size={20} style={{ color: theme.primaryColor }} />
                Prazo & Pagamento (Faturamento B2B)
              </h3>
              
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: '1.4' }}>
                Selecione a condição de faturamento permitida para o seu cadastro comercial.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {merchant.paymentTerms?.map(term => (
                  <label 
                    key={term}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: `1.5px solid ${selectedTerm === term ? theme.primaryColor : '#e2e8f0'}`,
                      backgroundColor: selectedTerm === term ? `${theme.primaryColor}05` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentTerm"
                      value={term}
                      checked={selectedTerm === term}
                      onChange={() => setSelectedTerm(term)}
                      style={{
                        accentColor: theme.primaryColor,
                        width: '16px',
                        height: '16px'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{term}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {term.includes('Boleto') ? 'Faturamento via boleto bancário após entrega' : 'Pagamento imediato na entrega ou por código Pix'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Confirm order button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '16px',
                fontSize: '16px',
                borderRadius: '12px',
                fontWeight: 700
              }}
            >
              Confirmar e Enviar Pedido
            </button>
          </form>

          {/* Order Summary Side */}
          <div className="card" style={{ padding: '24px', textAlign: 'left', position: 'sticky', top: '110px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              Resumo do Pedido
            </h3>

            {/* Items scroll list */}
            <div style={{
              maxHeight: '220px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              marginBottom: '20px',
              paddingRight: '4px'
            }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.description}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.qty} cx • {item.packageQtd} un/cx
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    R$ {(item.packagePrice * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations block */}
            <div style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Subtotal</span>
                <span>R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Frete (Entrega Expressa)</span>
                <span style={{ color: theme.secondaryColor, fontWeight: 600 }}>Grátis</span>
              </div>
              
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '14px',
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 700,
                color: '#0f172a'
              }}>
                <span>Total a Pagar</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: theme.primaryColor }}>
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#065f46',
              display: 'flex',
              gap: '8px'
            }}>
              <Calendar size={16} style={{ flexShrink: 0 }} />
              <span>Pedido com entrega programada para o próximo dia útil.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
