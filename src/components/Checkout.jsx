import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, saveOrders } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { ArrowLeft, CheckCircle, FileText, Calendar, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { company } = useWhitelabel();

  const [client, setClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // 1. Check Authentication
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
    setClient(user);

    // Load saved notes
    const savedNotes = localStorage.getItem(`cart_notes_${user.code}`) || '';
    setNotes(savedNotes);

    // 2. Load Cart
    const storedCart = localStorage.getItem(`cart_${user.code}`);
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!client) return;

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newOrderId,
      companyId: client.companyId,
      clientCode: client.code,
      clientName: client.name,
      date: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id,
        description: item.description,
        qty: item.qty,
        price: item.price,
        unit: item.unit
      })),
      total: parseFloat(subtotal.toFixed(2)),
      notes: notes,
      status: 'Recebido'
    };

    // Save order to mock database
    const allOrders = getOrders();
    saveOrders([newOrder, ...allOrders]);

    // Clear cart and notes for this client
    localStorage.setItem(`cart_${client.code}`, '[]');
    localStorage.removeItem(`cart_notes_${client.code}`);

    setOrderId(newOrderId);
    setIsSuccess(true);
  };

  if (!client || cart.length === 0) return null;

  if (isSuccess) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: 'var(--bg-color)',
        padding: '24px'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          padding: '48px 32px',
          boxShadow: 'var(--shadow-lg)',
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--card-bg)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${company.primaryColor}15`,
            color: company.primaryColor,
            marginBottom: '24px'
          }}>
            <CheckCircle size={48} />
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '30px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Pedido Enviado!
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Seu pedido <strong>{orderId}</strong> foi encaminhado com sucesso para <strong>{company.name}</strong>.
          </p>

          <div style={{
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '32px'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Resumo da Solicitação
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <FileText size={16} style={{ color: company.primaryColor, flexShrink: 0 }} />
                <span>Tipo: <strong>Pedido Comercial B2B</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle size={16} style={{ color: company.primaryColor, flexShrink: 0 }} />
                <span>Próximo Passo: <strong>Nosso time entrará em contato para alinhar a liberação.</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              borderRadius: '10px',
              backgroundColor: company.primaryColor,
              border: 'none',
              color: 'white',
              fontWeight: 700
            }}
          >
            Voltar para o Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '40px 16px', color: 'var(--text-primary)' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="btn btn-outline"
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            fontSize: '13px',
            borderRadius: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <ArrowLeft size={16} /> Voltar para o Catálogo
        </button>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '32px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          Finalizar Pedido
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Form Side */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Note about direct payment */}
            <div className="card" style={{ padding: '24px', textAlign: 'left', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
                <FileText size={20} style={{ color: company.primaryColor }} />
                Condição de Faturamento & Pagamento
              </h3>
              
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Nenhum pagamento é processado online. Toda a negociação comercial, prazos de faturamento e 
                recebimento de valores serão definidos diretamente pela nossa equipe comercial após a conclusão do pedido.
              </p>
            </div>

            {/* Confirm order button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '16px',
                fontSize: '16px',
                borderRadius: '12px',
                fontWeight: 700,
                backgroundColor: company.primaryColor,
                border: 'none',
                color: 'white'
              }}
            >
              Confirmar Pedido
            </button>
          </form>

          {/* Order Summary Side */}
          <div className="card" style={{ padding: '24px', textAlign: 'left', position: 'sticky', top: '110px', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
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
                <div key={item.cartItemId || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '13px' }}>
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.description}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.qty} un • R$ {Number(item.price || 0).toFixed(2)} / {item.unit}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    R$ {(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations block */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                marginTop: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                <span>Total Estimado</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: company.primaryColor }}>
                  R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {notes && (
              <div style={{
                marginTop: '16px',
                backgroundColor: 'var(--bg-color)',
                border: '1.5px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <strong>Observações:</strong> {notes}
              </div>
            )}

            <div style={{
              marginTop: '20px',
              backgroundColor: `${company.primaryColor}10`,
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              display: 'flex',
              gap: '8px'
            }}>
              <Calendar size={16} style={{ flexShrink: 0, color: company.primaryColor }} />
              <span>O pedido será analisado e processado em horário comercial.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
