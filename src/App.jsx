import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { WhitelabelProvider } from './WhitelabelContext';
import Login from './components/Login';
import Storefront from './components/Storefront';
import Checkout from './components/Checkout';
import Admin from './components/Admin';

function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  
  return (
    <ThemeProvider>
      <Router basename={basename}>
        <WhitelabelProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Storefront />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WhitelabelProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
