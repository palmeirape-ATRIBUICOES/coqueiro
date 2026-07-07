import React, { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '12px 20px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span>{message}</span>
    </div>
  );
}
