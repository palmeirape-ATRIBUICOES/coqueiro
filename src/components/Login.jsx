import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMerchants } from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { ShoppingBag, HelpCircle } from 'lucide-react';

export default function Login() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [merchants, setMerchants] = useState({});
  const navigate = useNavigate();
  const { theme } = useWhitelabel();

  useEffect(() => {
    // Load available merchants on mount
    setMerchants(getMerchants());
    
    // If merchant already logged in, redirect to home
    if (localStorage.getItem('clubbi_active_merchant')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 5) {
      setError('O código de acesso deve conter exatamente 5 caracteres.');
      return;
    }

    if (merchants[cleanCode]) {
      // Store active merchant in localStorage
      localStorage.setItem('clubbi_active_merchant', JSON.stringify(merchants[cleanCode]));
      navigate('/');
    } else {
      setError('Código não encontrado. Dica: Use o código "WDPHP" ou "TEST1".');
    }
  };

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
        maxWidth: '440px',
        textAlign: 'center',
        padding: '40px 32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Whitelabel Logo */}
        {theme.logoType === 'image' && theme.logoUrl ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70px',
            marginBottom: '24px'
          }}>
            <img 
              src={theme.logoUrl} 
              alt={theme.logoText} 
              style={{ height: '100%', maxWidth: '240px', objectFit: 'contain' }} 
            />
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'rgba(var(--primary-color), 0.1)',
            color: theme.primaryColor,
            marginBottom: '24px',
            boxShadow: `0 8px 16px -4px ${theme.primaryColor}25`
          }}>
            <ShoppingBag size={32} style={{ color: theme.primaryColor }} />
          </div>
        )}

        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '8px',
          lineHeight: '1.2'
        }}>
          {theme.title}
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          marginBottom: '32px'
        }}>
          Insira seu código de acesso de 5 dígitos para entrar na loja e fazer pedidos.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Código de Acesso</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: WDPHP"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                textAlign: 'center',
                fontSize: '24px',
                letterSpacing: '8px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '14px'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              padding: '12px',
              color: '#b91c1c',
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
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '12px'
            }}
          >
            Entrar na Loja
          </button>
        </form>

        <div style={{
          marginTop: '32px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '24px',
          textAlign: 'left'
        }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#475569',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <HelpCircle size={16} style={{ color: theme.primaryColor }} />
            Precisa de ajuda para testar?
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            Você pode digitar o código de acesso aprovado <strong>WDPHP</strong> ou o código alternativo <strong>TEST1</strong>.
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginTop: '6px' }}>
            Para criar novos códigos, gerenciar produtos ou alterar o esquema de cores das marcas, acesse o <a href="/admin" style={{ color: theme.primaryColor, fontWeight: 600, textDecoration: 'underline' }}>Painel Admin</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
