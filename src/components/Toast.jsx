import React, { useEffect } from 'react';

export default function Toast({ message, onClose, type }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isGreen = type === 'success-green';

  return (
    <div style={{
      backgroundColor: isGreen ? '#10b981' : 'var(--card-bg, #ffffff)',
      color: isGreen ? '#ffffff' : 'var(--text-primary, #0f172a)',
      border: isGreen ? '1px solid #059669' : '1px solid var(--border-color, #e2e8f0)',
      borderRadius: '12px',
      padding: '14px 24px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '280px',
      fontWeight: 600,
      fontSize: '13px'
    }}>
      <span>{message}</span>
    </div>
  );
}
