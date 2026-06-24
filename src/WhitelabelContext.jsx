import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWhitelabels, getActiveWhitelabelId, setActiveWhitelabelId, saveWhitelabels } from './mockDb';

const WhitelabelContext = createContext();

export const WhitelabelProvider = ({ children }) => {
  const [activeId, setActiveId] = useState(getActiveWhitelabelId());
  const [allThemes, setAllThemes] = useState(getWhitelabels());
  const [currentTheme, setCurrentTheme] = useState(allThemes[activeId] || allThemes['clubbi']);

  useEffect(() => {
    // Save to local storage and update states
    setActiveWhitelabelId(activeId);
    const theme = allThemes[activeId] || allThemes['clubbi'];
    setCurrentTheme(theme);

    // Apply colors dynamically to document root
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);

    // Update document title
    document.title = theme.title || "Loja";
  }, [activeId, allThemes]);

  const switchTheme = (id) => {
    if (allThemes[id]) {
      setActiveId(id);
    }
  };

  const reloadThemes = () => {
    const updated = getWhitelabels();
    setAllThemes(updated);
    if (updated[activeId]) {
      setCurrentTheme(updated[activeId]);
    }
  };

  return (
    <WhitelabelContext.Provider value={{ 
      theme: currentTheme, 
      activeId, 
      allThemes, 
      switchTheme, 
      reloadThemes 
    }}>
      {/* Brand Switcher Header Bar for SaaS demo purposes */}
      <div className="skin-switcher-bar">
        <div className="skin-switcher-title">
          <span>🚀</span>
          <strong>SaaS DEMO:</strong>
          <span>Customize ou altere marcas instantaneamente</span>
        </div>
        <div className="skin-btn-group">
          {Object.keys(allThemes).map(id => (
            <button 
              key={id}
              onClick={() => switchTheme(id)}
              className={`skin-btn ${activeId === id ? 'active' : ''}`}
              style={{
                borderLeft: `4px solid ${allThemes[id].primaryColor}`
              }}
            >
              {allThemes[id].name}
            </button>
          ))}
          <a 
            href="/admin" 
            className="skin-btn"
            style={{ backgroundColor: '#0f172a', borderLeft: '4px solid #f59e0b', color: '#fbbf24' }}
          >
            ⚙️ Painel Admin
          </a>
        </div>
      </div>
      {children}
    </WhitelabelContext.Provider>
  );
};

export const useWhitelabel = () => {
  const context = useContext(WhitelabelContext);
  if (!context) {
    throw new Error('useWhitelabel must be used within a WhitelabelProvider');
  }
  return context;
};
