import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, saveOrders } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { ArrowLeft, CheckCircle, FileText, Calendar, ShoppingBag, MessageCircle } from 'lucide-react';
import Toast from './Toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { company } = useWhitelabel();

  const [client, setClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [toasts, setToasts] = useState([]);
  
  const addToast = (msg) => {
    setToasts(prev => [...prev, { id: Date.now(), message: msg }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const prevOrdersRef = useRef([]);

  // Fields from missoes-da-loja layout
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 1. Check Authentication
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
    setClient(user);
    setDeliveryAddress(user.address || '');

    // Load saved notes
    const savedNotes = localStorage.getItem(`cart_notes_${user.code}`) || '';
    setNotes(savedNotes);

    // 2. Load Cart
    const storedCart = localStorage.getItem(`cart_${user.code}`);
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart);
        if (!Array.isArray(items) || items.length === 0) {
          navigate('/');
        } else {
          setCart(items);
        }
      } catch (e) {
        setCart([]);
        navigate('/');
      }
    } else {
      navigate('/');
    }
    // Initialize previous orders ref to monitor status updates
    const initialOrders = getOrders();
    prevOrdersRef.current = initialOrders;
  }, [navigate]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'facilitadora_orders') {
        const nextOrders = getOrders();
        nextOrders.forEach(nextOrd => {
          // Find corresponding order in previous orders list
          const prevOrd = prevOrdersRef.current.find(o => o.id === nextOrd.id);
          if (prevOrd && prevOrd.status !== nextOrd.status && nextOrd.clientCode === client?.code) {
            addToast(`O status do orçamento ${nextOrd.id} mudou de "${prevOrd.status}" para "${nextOrd.status}"!`);
          }
        });
        prevOrdersRef.current = nextOrders;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [client]);

  const availableSlots = React.useMemo(() => {
    const fixedHours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    const slots = [];
    const now = new Date();

    const toLocalDateStr = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = toLocalDateStr(now);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toLocalDateStr(tomorrow);

    fixedHours.forEach(time => {
      const [h, m] = time.split(':').map(Number);
      const slotTimeMs = new Date().setHours(h, m, 0, 0);
      const minDeliveryTimeMs = Date.now() + 30 * 60 * 1000;

      if (slotTimeMs >= minDeliveryTimeMs) {
        slots.push({
          id: `today_${time}`,
          date: todayStr,
          time: time,
          isToday: true
        });
      }
    });

    fixedHours.forEach(time => {
      slots.push({
        id: `tomorrow_${time}`,
        date: tomorrowStr,
        time: time,
        isToday: false
      });
    });

    return slots;
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 0)), 0);

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
      deliveryAddress: deliveryAddress,
      deliverySlot: selectedSlot ? `${selectedSlot.isToday ? 'Hoje' : 'Amanhã'} às ${selectedSlot.time}` : 'Não selecionado',
      paymentMethod: paymentMethod,
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

  // Periodically pull orders from the cloud to update state and trigger status notifications
  useEffect(() => {
    if (!client) return;
    
    const interval = setInterval(() => {
      // Fetch latest from Firebase database and load to localStorage
      import('../mockDb').then(({ syncFromCloud, getOrders }) => {
        syncFromCloud().then(() => {
          const nextOrders = getOrders();
          nextOrders.forEach(nextOrd => {
            const prevOrd = prevOrdersRef.current.find(o => o.id === nextOrd.id);
            if (prevOrd && prevOrd.status !== nextOrd.status && nextOrd.clientCode === client?.code) {
              addToast(`O status do orçamento ${nextOrd.id} mudou de "${prevOrd.status}" para "${nextOrd.status}"!`);
            }
          });
          prevOrdersRef.current = nextOrders;
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [client]);

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
            onClick={() => {
              const itemsText = cart.map(i => `• ${i.description} (${i.qty}x) - R$ ${(i.price * i.qty).toFixed(2)}`).join('\n');
              const text = `*Novo Orçamento #${orderId} - Casa Coqueiro*\n\n` +
                `*Cliente:* ${client.name}\n` +
                `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n` +
                `*Itens:*\n${itemsText}\n\n` +
                `*Total:* R$ ${Number(subtotal || 0).toFixed(2)}\n\n` +
                `*Forma de Pagamento:* ${paymentMethod.toUpperCase()}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="btn"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              borderRadius: '10px',
              backgroundColor: '#25D366',
              border: 'none',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '10px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MessageCircle size={18} /> Enviar Orçamento pelo WhatsApp
          </button>

          <button
            onClick={() => {
              localStorage.setItem('coqueiro_client_active_tab', 'orders');
              navigate('/');
            }}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              borderRadius: '10px',
              backgroundColor: company.primaryColor,
              border: 'none',
              color: 'white',
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: '10px',
              width: '100%'
            }}
          >
            Acompanhar seu Orçamento
          </button>
          
          <button
            onClick={() => {
              localStorage.setItem('coqueiro_client_active_tab', 'catalog');
              navigate('/');
            }}
            className="btn btn-outline"
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              borderRadius: '10px',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', padding: '40px 16px', color: 'var(--text-primary)' }}>
      {/* Toasts List */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} onClose={() => removeToast(t.id)} />
        ))}
      </div>
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
          gridTemplateColumns: isMobile ? '1fr' : '1fr 380px',
          gap: isMobile ? '16px' : '32px',
          alignItems: 'start'
        }}>
          {/* Form Side */}
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Observations / notes */}
            <div className="card" style={{ padding: '24px', textAlign: 'left', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '18px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                📝 Observações ou Notas do Orçamento
              </h3>
              <textarea
                value={notes}
                onChange={e => {
                  setNotes(e.target.value);
                  localStorage.setItem(`cart_notes_${client.code}`, e.target.value);
                }}
                placeholder="Ex: Gostaria de alinhar condições de desconto para pagamento à vista..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Confirm order button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: '16px',
                fontSize: '16px',
                borderRadius: '16px',
                fontWeight: 800,
                backgroundColor: company.primaryColor,
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${company.primaryColor}30`,
                transition: 'all 0.15s'
              }}
            >
              🚀 Confirmar e Gerar Orçamento
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
