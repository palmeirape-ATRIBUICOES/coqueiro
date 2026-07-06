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
    const storedUser = localStorage.getItem('coqueiro_active_merchant');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.companyId && companies[user.companyId]) {
          // If the user belongs to a specific company, override the branding to match that company
          setCurrentCompany(companies[user.companyId]);
          setActiveCompanyId(user.companyId);
          applyBranding(companies[user.companyId]);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored user session:", e);
        localStorage.removeItem('coqueiro_active_merchant');
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
