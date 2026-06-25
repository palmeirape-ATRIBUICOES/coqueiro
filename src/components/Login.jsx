import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, syncFromCloud } from '../mockDb';
import { ShoppingCart } from 'lucide-react';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [activeCodes, setActiveCodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const u = getUsers();
      if (u) {
        setActiveCodes(Object.keys(u));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect them
    const storedUser = localStorage.getItem('clubbi_active_merchant');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role) {
          if (user.role === 'cliente') {
            navigate('/');
          } else {
            navigate('/admin');
          }
        }
      } catch (e) {
        localStorage.removeItem('clubbi_active_merchant');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length === 0) {
      setError('Informe o código de acesso.');
      return;
    }

    try {
      await syncFromCloud();
    } catch (err) {
      console.error("Firebase sync error:", err);
    }

    const users = getUsers();
    const user = users[cleanCode];

    if (user) {
      if (user.status === 'Inactive') {
        setError('Este acesso está inativo. Entre em contato com a gerência.');
        return;
      }

      // Store authenticated user session
      localStorage.setItem('clubbi_active_merchant', JSON.stringify(user));
      
      // Redirect based on role
      if (user.role === 'cliente') {
        navigate('/');
      } else {
        navigate('/admin');
      }
    } else {
      setError('Código de acesso incorreto. Verifique com a loja.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      padding: '24px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        padding: '48px 36px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Platform Logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          color: '#0284c7',
          marginBottom: '24px'
        }}>
          <ShoppingCart size={32} />
        </div>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '26px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          lineHeight: '1.2'
        }}>
          Mercado Online Facilitadora
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '36px'
        }}>
          Área de acesso comercial. Insira seu código para prosseguir.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Código de Acesso</label>
            <input
              type="text"
              className="form-input"
              placeholder="•••••"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                textAlign: 'center',
                fontSize: '24px',
                letterSpacing: '8px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '14px',
                fontFamily: 'monospace'
              }}
              required
              autoFocus
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              color: 'var(--danger)',
              fontSize: '13px',
              fontWeight: 500,
              textAlign: 'left',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: 'white'
            }}
          >
            Entrar no Sistema
          </button>

          {/* Debug active access codes list */}
          <div style={{ marginTop: '24px', borderTop: '1px dashed #e2e8f0', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                gap: '4px'
              }}
            >
              ⚙️ {showDebug ? 'Ocultar Códigos Ativos' : 'Mostrar Códigos Ativos (Debug)'}
            </button>
            
            {showDebug && (
              <div style={{
                marginTop: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11px',
                color: '#475569',
                textAlign: 'left',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                  Códigos salvos nesta máquina (clique p/ usar):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeCodes.map(c => (
                    <span 
                      key={c} 
                      onClick={() => setCode(c)}
                      style={{
                        backgroundColor: '#e2e8f0',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
