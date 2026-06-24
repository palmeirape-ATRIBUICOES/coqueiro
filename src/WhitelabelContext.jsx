import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCompanies } from './mockDb';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

const WhitelabelContext = createContext();

export const WhitelabelProvider = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [companies, setCompanies] = useState(getCompanies());
  const [activeCompanyId, setActiveCompanyId] = useState('coqueiro'); // Default demo company
  const [currentCompany, setCurrentCompany] = useState(companies['coqueiro']);

  // Dynamic branding resolution
  useEffect(() => {
    // Check if there is an authenticated user session
    const storedUser = localStorage.getItem('clubbi_active_merchant');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.companyId && companies[user.companyId]) {
        // If the user belongs to a specific company, override the branding to match that company
        setCurrentCompany(companies[user.companyId]);
        setActiveCompanyId(user.companyId);
        applyBranding(companies[user.companyId]);
        return;
      }
    }

    // Default or demo switcher fallback
    const company = companies[activeCompanyId] || companies['coqueiro'];
    setCurrentCompany(company);
    applyBranding(company);
  }, [activeCompanyId, companies]);

  // Method to apply CSS variables and Browser Tab Title
  const applyBranding = (company) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', company.primaryColor || '#0284c7');
    root.style.setProperty('--secondary-color', company.secondaryColor || '#f59e0b');
    root.style.setProperty('--accent-color', company.accentColor || '#ef4444');
    document.title = company.title || company.name || "Mercado Online Facilitadora";
  };

  const switchCompany = (id) => {
    if (companies[id]) {
      setActiveCompanyId(id);
    }
  };

  const reloadBranding = () => {
    const freshCompanies = getCompanies();
    setCompanies(freshCompanies);
    if (freshCompanies[activeCompanyId]) {
      setCurrentCompany(freshCompanies[activeCompanyId]);
    }
  };

  return (
    <WhitelabelContext.Provider value={{
      company: currentCompany,
      activeCompanyId,
      allCompanies: companies,
      switchCompany,
      reloadBranding
    }}>
      {/* SaaS Demo Header Bar (Only visible when printing is not active) */}
      <div className="skin-switcher-bar print-hide">
        <div className="skin-switcher-title">
          <span>🚀</span>
          <strong>Mercado Online Facilitadora</strong>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
            (Multi-Tenant B2B SaaS Demo)
          </span>
        </div>
        <div className="skin-btn-group">
          {Object.keys(companies).map(id => (
            <button 
              key={id}
              onClick={() => switchCompany(id)}
              className={`skin-btn ${activeCompanyId === id ? 'active' : ''}`}
              style={{
                borderLeft: `4px solid ${companies[id].primaryColor}`
              }}
            >
              {companies[id].name}
            </button>
          ))}

          {/* Light/Dark Mode toggle */}
          <button 
            onClick={toggleTheme} 
            className="skin-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#334155', border: 'none' }}
          >
            {isDarkMode ? <Sun size={14} style={{ color: '#fbbf24' }} /> : <Moon size={14} style={{ color: '#cbd5e1' }} />}
            <span style={{ fontSize: '11px' }}>{isDarkMode ? 'Claro' : 'Escuro'}</span>
          </button>
          
          <a 
            href="/admin" 
            className="skin-btn"
            style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', color: 'white' }}
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
