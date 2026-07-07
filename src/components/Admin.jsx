import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCompanies, saveCompanies, 
  getUsers, saveUsers, 
  getProducts, saveProducts, 
  getOrders, saveOrders,
  syncFromCloud
} from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { 
  Settings, Users, ShoppingBag, ClipboardList, Plus, Trash2, Edit2, ArrowLeft, 
  Save, AlertCircle, Printer, Shield, BarChart3, Store 
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { company, reloadBranding } = useWhitelabel();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Global DB states
  const [companies, setCompanies] = useState({});
  const [users, setUsers] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Admin Master specific form states
  const [newCompany, setNewCompany] = useState({
    id: '', name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
    primaryColor: '#059669', secondaryColor: '#eab308', accentColor: '#ef4444',
    address: '', phone: '', whatsapp: '', hours: '08:00 às 18:00'
  });
  const [newGlobalUser, setNewGlobalUser] = useState({
    code: '', name: '', role: 'store-admin', status: 'Active', companyId: ''
  });

  // Store Admin / Staff specific CRUD states
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: ''
  });

  const [newClient, setNewClient] = useState({
    name: '', phone: '', code: ''
  });

  const [editingStaff, setEditingStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    code: '', name: '', role: 'vendedor', status: 'Active',
    permissions: {
      financeiro: false, produtos: false, precos: false, clientes: true,
      funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
      estoque: false, usuarios: false
    }
  });

  const [storeConfig, setStoreConfig] = useState({
    name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
    primaryColor: '#000000', secondaryColor: '#000000', accentColor: '#000000',
    address: '', phone: '', whatsapp: '', hours: ''
  });

  const [firebaseUrl, setFirebaseUrl] = useState(localStorage.getItem("firebase_db_url") || '');

  // Print Order data state
  const [activePrintOrder, setActivePrintOrder] = useState(null);

  // Load database
  const loadDbData = () => {
    setCompanies(getCompanies());
    setUsers(getUsers());
    setProducts(getProducts());
    setOrders(getOrders());
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'facilitadora_orders') {
        setOrders(getOrders());
      }
      if (e.key === 'facilitadora_products') {
        setProducts(getProducts());
      }
      if (e.key === 'facilitadora_users') {
        setUsers(getUsers());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // 1. Authenticate user
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
    if (!user || user.role === 'cliente') {
      navigate('/');
      return;
    }
    setCurrentUser(user);

    // 2. Load DB values (offline cache first)
    const allCompanies = getCompanies();
    setCompanies(allCompanies);
    setUsers(getUsers());
    setProducts(getProducts());
    setOrders(getOrders());

    // 2.1. Sync from Firebase in background and reload state
    syncFromCloud().then(() => {
      const freshCompanies = getCompanies();
      setCompanies(freshCompanies);
      setUsers(getUsers());
      setProducts(getProducts());
      setOrders(getOrders());
      if (user.companyId && freshCompanies[user.companyId]) {
        setStoreConfig({ ...freshCompanies[user.companyId] });
      }
    });

    // 3. Set default configs if user has a store
    if (user.companyId && allCompanies[user.companyId]) {
      setStoreConfig({ ...allCompanies[user.companyId] });
      setNewGlobalUser(prev => ({ ...prev, companyId: user.companyId }));
    }

    // 4. Resolve default active tab based on role & permissions
    if (user.role === 'admin-master') {
      setActiveTab('dashboard-master');
    } else {
      // Determine what tabs are available
      const tabs = [];
      const hasDashboard = user.role === 'store-admin' || user.permissions?.financeiro || user.permissions?.relatorios;
      const hasProducts = user.role === 'store-admin' || user.permissions?.produtos;
      const hasClients = user.role === 'store-admin' || user.permissions?.clientes;
      const hasStaff = user.role === 'store-admin' || user.permissions?.funcionarios;
      const hasSettings = user.role === 'store-admin' || user.permissions?.visualConfig;

      if (hasDashboard) tabs.push('dashboard');
      tabs.push('orders'); // Orders is always open as base backoffice workflow
      if (hasProducts) tabs.push('products');
      if (hasClients) tabs.push('clients');
      if (hasStaff) tabs.push('staff');
      if (hasSettings) tabs.push('settings');

      if (tabs.length > 0) {
        setActiveTab(tabs[0]);
      }
    }
  }, [navigate]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('coqueiro_active_merchant');
    navigate('/login');
  };

  // Check custom permission for actions
  const checkPermission = (actionType) => {
    if (!currentUser) return false;
    if (currentUser.role === 'store-admin' || currentUser.role === 'admin-master') return true;
    return !!currentUser.permissions?.[actionType];
  };

  // --- ACTIONS: ADMIN MASTER ---
  const handleCreateCompany = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'admin-master') return;

    const companyId = newCompany.id.trim().toLowerCase().replace(/\s+/g, '-');
    if (!companyId) {
      showError('Identificador da empresa inválido.');
      return;
    }

    if (companies[companyId]) {
      showError('Já existe uma empresa cadastrada com este identificador.');
      return;
    }

    const updatedCompanies = {
      ...companies,
      [companyId]: {
        ...newCompany,
        id: companyId
      }
    };

    saveCompanies(updatedCompanies);
    setCompanies(updatedCompanies);
    showSuccess(`Empresa "${newCompany.name}" cadastrada com sucesso!`);
    
    // Reset
    setNewCompany({
      id: '', name: '', tradeName: '', logoUrl: '', logoType: 'text', logoText: '',
      primaryColor: '#059669', secondaryColor: '#eab308', accentColor: '#ef4444',
      address: '', phone: '', whatsapp: '', hours: '08:00 às 18:00'
    });
  };

  const handleCreateGlobalUser = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'admin-master') return;

    const code = newGlobalUser.code.trim().toUpperCase();
    if (code.length !== 5) {
      showError('O código deve conter exatamente 5 caracteres.');
      return;
    }

    if (users[code]) {
      showError('Código de acesso já está em uso.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        ...newGlobalUser,
        code,
        companyId: newGlobalUser.role === 'admin-master' ? null : newGlobalUser.companyId,
        permissions: newGlobalUser.role === 'store-admin' ? null : {
          financeiro: true, produtos: true, precos: true, clientes: true,
          funcionarios: true, relatorios: true, impressao: true, visualConfig: true,
          estoque: true, usuarios: true
        }
      }
    };

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(`Usuário ${newGlobalUser.name} cadastrado com código "${code}"`);
    
    setNewGlobalUser({
      code: '', name: '', role: 'store-admin', status: 'Active', companyId: ''
    });
  };

  const handleDeleteUser = (code) => {
    if (code === currentUser.code) {
      showError('Você não pode excluir sua própria conta.');
      return;
    }
    if (confirm(`Deseja realmente remover o usuário "${code}"?`)) {
      const updated = { ...users };
      delete updated[code];
      saveUsers(updated);
      setUsers(updated);
      showSuccess('Usuário removido.');
    }
  };

  // --- ACTIONS: STORE ADMIN & STAFF ---

  // Order status update
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    saveOrders(updated);
    setOrders(updated);
    showSuccess(`Orçamento ${orderId} atualizado para "${newStatus}".`);
  };

  // Print Order Action
  const triggerPrintOrder = (ord) => {
    if (!checkPermission('impressao')) {
      showError('Você não tem permissão para imprimir pedidos.');
      return;
    }
    setActivePrintOrder(ord);
    // Give react time to render print container before opening print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Product actions
  const handleAddOrEditProduct = (e) => {
    e.preventDefault();
    if (!checkPermission('produtos')) {
      showError('Você não possui permissão para cadastrar/editar produtos.');
      return;
    }

    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock);

    if (isNaN(priceNum) || priceNum <= 0) {
      showError('Preço unitário inválido.');
      return;
    }

    // Permission checks for values
    const finalPrice = checkPermission('precos') ? priceNum : (editingProduct ? editingProduct.price : 0);
    const finalStock = checkPermission('estoque') ? stockNum : (editingProduct ? editingProduct.stock : 0);

    let updatedProducts = [...products];

    if (editingProduct) {
      updatedProducts = updatedProducts.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            code: newProduct.code,
            description: newProduct.description,
            category: newProduct.category,
            brand: newProduct.brand,
            unit: newProduct.unit,
            price: finalPrice,
            stock: finalStock,
            imageUrl: newProduct.imageUrl
          };
        }
        return p;
      });
      showSuccess('Produto atualizado!');
    } else {
      const pId = `prod-${Date.now()}`;
      const productToAdd = {
        id: pId,
        code: newProduct.code || `PROD-${Math.floor(100 + Math.random() * 900)}`,
        description: newProduct.description,
        category: newProduct.category,
        brand: newProduct.brand || 'Marca Própria',
        unit: newProduct.unit,
        price: finalPrice,
        stock: finalStock || 100,
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
        companyId: currentUser.companyId
      };
      updatedProducts = [productToAdd, ...updatedProducts];
      showSuccess('Produto adicionado ao catálogo!');
    }

    saveProducts(updatedProducts);
    setProducts(updatedProducts);
    
    // Clear Form
    setNewProduct({
      code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: ''
    });
    setEditingProduct(null);
  };

  const handleStartEditProduct = (p) => {
    setEditingProduct(p);
    setNewProduct({
      code: p.code,
      description: p.description,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl
    });
  };

  const handleDeleteProduct = (id) => {
    if (!checkPermission('produtos')) {
      showError('Você não tem permissão para deletar produtos.');
      return;
    }
    if (confirm('Deseja realmente remover este produto?')) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
      showSuccess('Produto removido do catálogo.');
    }
  };

  const handleInlineProductChange = (productId, field, value) => {
    if (!checkPermission('produtos')) {
      showError('Você não tem permissão para editar produtos.');
      return;
    }
    const updated = products.map(p => {
      if (p.id === productId) {
        const updatedItem = { ...p, [field]: value };
        if (field === 'price' && p.packageItems) {
          updatedItem.packagePrice = parseFloat((value * p.packageItems * 0.95).toFixed(2));
        }
        return updatedItem;
      }
      return p;
    });
    saveProducts(updated);
    setProducts(updated);
  };

  // Client Actions
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!checkPermission('clientes')) {
      showError('Você não possui permissão para cadastrar clientes.');
      return;
    }

    const code = newClient.code.trim();
    if (!/^\d{6}$/.test(code)) {
      showError('O código de acesso do cliente deve conter exatamente 6 dígitos numéricos.');
      return;
    }

    if (users[code]) {
      showError('Código de acesso já está cadastrado.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        code,
        name: newClient.name,
        role: 'cliente',
        status: 'Active',
        companyId: currentUser.companyId,
        phone: newClient.phone
      }
    };

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(`Cliente "${newClient.name}" cadastrado! Código: ${code}`);

    setNewClient({ name: '', phone: '', code: '' });
  };

  const generateRandomClientCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (users[code]) {
      generateRandomClientCode();
    } else {
      setNewClient(prev => ({ ...prev, code }));
    }
  };

  // Staff & Permissions Actions
  const handleAddOrEditStaff = (e) => {
    e.preventDefault();
    if (!checkPermission('funcionarios')) {
      showError('Você não possui permissão para gerenciar funcionários.');
      return;
    }

    const code = newStaff.code.trim().toUpperCase();
    if (code.length !== 5) {
      showError('Código deve ter exatamente 5 caracteres.');
      return;
    }

    if (!editingStaff && users[code]) {
      showError('Este código de acesso já está em uso.');
      return;
    }

    const updatedUsers = {
      ...users,
      [code]: {
        code,
        name: newStaff.name,
        role: newStaff.role,
        status: newStaff.status,
        companyId: currentUser.companyId,
        permissions: newStaff.permissions
      }
    };

    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showSuccess(editingStaff ? 'Funcionário atualizado!' : 'Funcionário registrado com sucesso!');

    setNewStaff({
      code: '', name: '', role: 'vendedor', status: 'Active',
      permissions: {
        financeiro: false, produtos: false, precos: false, clientes: true,
        funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
        estoque: false, usuarios: false
      }
    });
    setEditingStaff(null);
  };

  const handleStartEditStaff = (st) => {
    setEditingStaff(st);
    setNewStaff({
      code: st.code,
      name: st.name,
      role: st.role,
      status: st.status,
      permissions: st.permissions || {
        financeiro: false, produtos: false, precos: false, clientes: false,
        funcionarios: false, relatorios: false, impressao: false, visualConfig: false,
        estoque: false, usuarios: false
      }
    });
  };

  const handleStaffPermissionToggle = (key) => {
    setNewStaff(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  // Store Config Actions
  const handleSaveStoreConfig = (e) => {
    e.preventDefault();
    if (!checkPermission('visualConfig')) {
      showError('Sem permissão para alterar visual da loja.');
      return;
    }

    const updatedCompanies = {
      ...companies,
      [currentUser.companyId]: {
        ...storeConfig
      }
    };

    saveCompanies(updatedCompanies);
    setCompanies(updatedCompanies);
    reloadBranding();
    showSuccess('Configuração visual e dados da loja salvos com sucesso!');
  };

  const handleSaveFirebaseUrl = (e) => {
    e.preventDefault();
    localStorage.setItem("firebase_db_url", firebaseUrl.trim());
    showSuccess('URL do Firebase salva com sucesso! Sincronizando dados...');
    if (firebaseUrl.trim()) {
      syncFromCloud().then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  if (!currentUser) return null;

  // Filter lists by tenant
  const isMaster = currentUser.role === 'admin-master';
  
  const tenantProducts = products.filter(p => isMaster ? true : p.companyId === currentUser.companyId);
  const tenantOrders = orders.filter(o => isMaster ? true : o.companyId === currentUser.companyId);
  const tenantClients = Object.values(users).filter(u => u.role === 'cliente' && (isMaster ? true : u.companyId === currentUser.companyId));
  const tenantStaff = Object.values(users).filter(u => (u.role === 'gestor' || u.role === 'vendedor') && (isMaster ? true : u.companyId === currentUser.companyId));
  const storeRevenue = tenantOrders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0);

  // Render variables
  const lowStockProducts = tenantProducts.filter(p => p.stock < 20);

  return (
    <div className="admin-container">
      {/* Admin header */}
      <div className="admin-header print-hide">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outline"
            style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <ArrowLeft size={16} /> Voltar ao Catálogo
          </button>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>
              Painel Administrativo
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              {isMaster ? 'Visão Geral Mercado Online Facilitadora (Master)' : `Abastecimento • ${company.name}`}
            </p>
          </div>
        </div>

        {/* Action Info / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Cargo: <strong style={{ color: 'var(--primary-color)' }}>{currentUser.role.toUpperCase()}</strong> • Código: {currentUser.code}
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--border-color)' }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Message banners */}
      {successMsg && (
        <div className="print-hide" style={{
          backgroundColor: '#ecfdf5', borderBottom: '1px solid #d1fae5', color: '#065f46',
          padding: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
        }}>
          <span>✅</span> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="print-hide" style={{
          backgroundColor: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#991b1b',
          padding: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
        }}>
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Main layout */}
      <div className="admin-layout">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="admin-sidebar print-hide">
          {/* Master Tabs */}
          {isMaster ? (
            <>
              <button 
                onClick={() => setActiveTab('dashboard-master')}
                className={`admin-tab-btn ${activeTab === 'dashboard-master' ? 'active' : ''}`}
              >
                <BarChart3 size={18} /> Painel Global
              </button>
              <button 
                onClick={() => setActiveTab('companies')}
                className={`admin-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
              >
                <Store size={18} /> Gestão de Lojas
              </button>
              <button 
                onClick={() => setActiveTab('global-users')}
                className={`admin-tab-btn ${activeTab === 'global-users' ? 'active' : ''}`}
              >
                <Shield size={18} /> Usuários Globais
              </button>
            </>
          ) : (
            <>
              {/* Store specific tabs */}
              {(currentUser.role === 'store-admin' || currentUser.permissions?.financeiro || currentUser.permissions?.relatorios) && (
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <BarChart3 size={18} /> Indicadores Gerais
                </button>
              )}
              
              <button 
                onClick={() => setActiveTab('orders')}
                className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <ClipboardList size={18} /> Gestão de Orçamentos
              </button>

              {(currentUser.role === 'store-admin' || currentUser.permissions?.produtos) && (
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                >
                  <ShoppingBag size={18} /> Catálogo de Produtos
                </button>
              )}

              {(currentUser.role === 'store-admin' || currentUser.permissions?.clientes) && (
                <button 
                  onClick={() => setActiveTab('clients')}
                  className={`admin-tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
                >
                  <Users size={18} /> Clientes Cadastrados
                </button>
              )}

              {(currentUser.role === 'store-admin' || currentUser.permissions?.funcionarios) && (
                <button 
                  onClick={() => setActiveTab('staff')}
                  className={`admin-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                >
                  <Shield size={18} /> Equipe & Permissões
                </button>
              )}

              {(currentUser.role === 'store-admin' || currentUser.permissions?.visualConfig) && (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                >
                  <Settings size={18} /> Configuração Visual
                </button>
              )}
            </>
          )}
        </aside>

        {/* RIGHT PANEL CONTENT */}
        <main className="admin-content" style={{ textAlign: 'left' }}>
          
          {/* ========================================= */}
          {/* TAB: GLOBAL DASHBOARD (MASTER) */}
          {activeTab === 'dashboard-master' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Painel Administrativo Master
              </h2>

              {/* Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Lojas Registradas</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {Object.keys(companies).length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faturamento Acumulado</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    R$ {orders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + o.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Orçamentos Solicitados</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {orders.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Usuários Ativos</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-color)' }}>
                    {Object.values(users).filter(u => u.status === 'Active').length}
                  </div>
                </div>
              </div>

              {/* General list */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Orçamentos Recentes das Filiais</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cód Pedido</th>
                        <th>Loja</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 700 }}>{ord.id}</td>
                          <td style={{ fontWeight: 600 }}>{companies[ord.companyId]?.name || ord.companyId}</td>
                          <td>{ord.clientName}</td>
                          <td>R$ {ord.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${ord.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: COMPANIE MANAGMENT (MASTER) */}
          {activeTab === 'companies' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gerenciar Lojas e Clientes Administrativos
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Identificador</th>
                        <th>Nome Fantasia</th>
                        <th>Contato</th>
                        <th>Endereço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(companies).map(comp => (
                        <tr key={comp.id}>
                          <td style={{ fontWeight: 700 }}>{comp.id}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                backgroundColor: comp.primaryColor
                              }} />
                              <strong>{comp.name}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{comp.tradeName}</div>
                          </td>
                          <td>
                            <div>Phone: {comp.phone}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Whats: {comp.whatsapp}</div>
                          </td>
                          <td style={{ fontSize: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {comp.address}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create Company Form */}
                <form onSubmit={handleCreateCompany} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Nova Empresa
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código/Slug Único (Minúsculo)</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: padaria-central"
                      value={newCompany.id} 
                      onChange={(e) => setNewCompany({ ...newCompany, id: e.target.value.toLowerCase() })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Fantasia</label>
                    <input 
                      type="text" className="form-input" placeholder="Padaria Central"
                      value={newCompany.name} 
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Razão Social</label>
                    <input 
                      type="text" className="form-input" placeholder="Padaria Central Ltda"
                      value={newCompany.tradeName} 
                      onChange={(e) => setNewCompany({ ...newCompany, tradeName: e.target.value })}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Primária</label>
                      <input 
                        type="color" value={newCompany.primaryColor}
                        onChange={(e) => setNewCompany({ ...newCompany, primaryColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Secundária</label>
                      <input 
                        type="color" value={newCompany.secondaryColor}
                        onChange={(e) => setNewCompany({ ...newCompany, secondaryColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Destaque</label>
                      <input 
                        type="color" value={newCompany.accentColor}
                        onChange={(e) => setNewCompany({ ...newCompany, accentColor: e.target.value })}
                        style={{ border: 'none', cursor: 'pointer', width: '100%', height: '36px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Telefone de Contato</label>
                    <input 
                      type="text" className="form-input" placeholder="(11) 2233-4455"
                      value={newCompany.phone} 
                      onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Endereço Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="Av. Principal, 100"
                      value={newCompany.address} 
                      onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Registrar Filial
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: GLOBAL USERS MANAGMENT (MASTER) */}
          {activeTab === 'global-users' && isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Controle Global de Usuários
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Loja</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(users).map(u => (
                        <tr key={u.code}>
                          <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{u.code}</td>
                          <td>
                            <strong>{u.name}</strong>
                            {u.phone && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Tel: {u.phone}</div>}
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>{u.role}</td>
                          <td>{companies[u.companyId]?.name || 'Global (Master)'}</td>
                          <td>
                            <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                              {u.status === 'Active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            <button 
                              onClick={() => handleDeleteUser(u.code)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form users */}
                <form onSubmit={handleCreateGlobalUser} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Novo Usuário Administrativo
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código de Acesso (5 Caracteres)</label>
                    <input 
                      type="text" className="form-input" maxLength={5} placeholder="EXADM"
                      value={newGlobalUser.code} 
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, code: e.target.value.toUpperCase() })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="João da Silva"
                      value={newGlobalUser.name} 
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, name: e.target.value })}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cargo / Role</label>
                    <select 
                      className="form-input" 
                      value={newGlobalUser.role}
                      onChange={(e) => setNewGlobalUser({ ...newGlobalUser, role: e.target.value })}
                    >
                      <option value="admin-master">Admin Master (Global)</option>
                      <option value="store-admin">Administrador de Loja</option>
                      <option value="gestor">Gestor Comercial</option>
                      <option value="vendedor">Vendedor</option>
                    </select>
                  </div>

                  {newGlobalUser.role !== 'admin-master' && (
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Vincular à Loja</label>
                      <select 
                        className="form-input" 
                        value={newGlobalUser.companyId}
                        onChange={(e) => setNewGlobalUser({ ...newGlobalUser, companyId: e.target.value })}
                        required
                      >
                        <option value="">Selecione uma loja...</option>
                        {Object.values(companies).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Registrar Acesso
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: STORE GENERAL DASHBOARD INDICATORS */}
          {activeTab === 'dashboard' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Indicadores Gerais da Loja
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faturamento Estimado</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    R$ {storeRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Solicitações Recebidas</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    {tenantOrders.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Clientes Comerciais</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: company.primaryColor }}>
                    {tenantClients.length}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Estoque Crítico (&lt;20)</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', color: lowStockProducts.length > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {lowStockProducts.length}
                  </div>
                </div>
              </div>

              {/* Stock Warning Box */}
              {lowStockProducts.length > 0 && (
                <div className="card" style={{ borderLeft: '5px solid var(--danger)', marginBottom: '32px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                    <span style={{ fontWeight: 600 }}>Alerta de Abastecimento: Existem {lowStockProducts.length} produtos com nível de estoque baixo.</span>
                  </div>
                </div>
              )}

              {/* Quick info list */}
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Fluxo Recente de Orçamentos</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Data da Solicitação</th>
                        <th>Total</th>
                        <th>Status Atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantOrders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700 }}>{o.id}</td>
                          <td>{o.clientName}</td>
                          <td>{new Date(o.date).toLocaleDateString('pt-BR')} às {new Date(o.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ fontWeight: 600 }}>R$ {o.total.toFixed(2)}</td>
                          <td>
                            <span className={`badge badge-${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: ORDERS & INVOICES PRINT PANEL */}
          {activeTab === 'orders' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gestão e Separação de Orçamentos
              </h2>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {tenantOrders.length === 0 ? (
                  <div style={{ padding: '40px', color: 'var(--text-light)', textAlign: 'center' }}>
                    Nenhum orçamento solicitado para a loja.
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cód Orçamento</th>
                        <th>Cliente</th>
                        <th>Lista de Produtos</th>
                        <th>Valor Total</th>
                        <th>Status do Pedido</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantOrders.map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 800 }}>{ord.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ord.clientName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Acesso: {ord.clientCode}</div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {ord.items.map((item, idx) => (
                                <div key={idx} style={{ color: 'var(--text-secondary)' }}>
                                  • {item.description} ({item.qty} un)
                                </div>
                              ))}
                            </div>
                            {ord.notes && (
                              <div style={{
                                marginTop: '6px', fontSize: '11px', color: 'var(--text-light)', 
                                fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '4px 8px', borderRadius: '4px'
                              }}>
                                Obs: {ord.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '15px', color: company.primaryColor }}>
                            R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid var(--border-color)',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Recebido">Recebido</option>
                              <option value="Em Separação">Em Separação</option>
                              <option value="Separado">Separado (Pronto)</option>
                              <option value="Aguardando Retirada">Aguardando Retirada</option>
                              <option value="Retirado">Retirado / Entregue</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          </td>
                          <td>
                            <button
                              onClick={() => triggerPrintOrder(ord)}
                              className="btn btn-outline"
                              title="Imprimir Folha A4 para Separação"
                              style={{ padding: '6px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={14} /> Separar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: PRODUCTS CATALOG CRUD */}
          {activeTab === 'products' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Catálogo da Loja
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço Unitário</th>
                        <th>Estoque Atual</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantProducts.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={p.imageUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.description}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Cód: {p.code} • Marca: {p.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                               <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>R$</span>
                               <input 
                                 type="number"
                                 step="0.01"
                                 value={p.price || 0}
                                 onChange={e => handleInlineProductChange(p.id, 'price', parseFloat(e.target.value) || 0)}
                                 style={{
                                   width: '75px',
                                   padding: '4px 6px',
                                   borderRadius: '6px',
                                   border: '1px solid var(--border-color)',
                                   fontSize: '13px',
                                   fontWeight: 700,
                                   backgroundColor: 'var(--card-bg)',
                                   color: 'var(--text-primary)',
                                   outline: 'none'
                                 }}
                               />
                             </div>
                           </td>
                           <td>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                               <input 
                                 type="number"
                                 value={p.stock}
                                 onChange={e => handleInlineProductChange(p.id, 'stock', parseInt(e.target.value) || 0)}
                                 style={{
                                   width: '65px',
                                   padding: '4px 6px',
                                   borderRadius: '6px',
                                   border: '1px solid var(--border-color)',
                                   fontSize: '13px',
                                   fontWeight: 600,
                                   backgroundColor: 'var(--card-bg)',
                                   color: p.stock < 20 ? 'var(--danger)' : 'var(--text-primary)',
                                   outline: 'none'
                                 }}
                               />
                               <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>un</span>
                             </div>
                           </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleStartEditProduct(p)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
                              >
                                <Edit2 size={15} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form CRUD */}
                <form onSubmit={handleAddOrEditProduct} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {editingProduct ? 'Editar Produto' : 'Cadastrar Produto'}
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Descrição</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: Melancia Inteira Kg"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código Interno</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: COQ-302"
                      value={newProduct.code}
                      onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Marca</label>
                      <input 
                        type="text" className="form-input" placeholder="ex: Nestlé"
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Unidade</label>
                      <input 
                        type="text" className="form-input" placeholder="ex: Kg, Un, Cx"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Categoria</label>
                    <select 
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      <option value="Bebidas">Bebidas</option>
                      <option value="Hortifruti">Hortifruti</option>
                      <option value="Mercearia">Mercearia</option>
                      <option value="Biscoitos">Biscoitos</option>
                      <option value="Laticínios">Laticínios</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Higiene">Higiene</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Preço Comercial (R$)</label>
                      <input 
                        type="number" step="0.01" className="form-input"
                        placeholder="R$ 10,00"
                        value={newProduct.price}
                        disabled={!checkPermission('precos')}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Estoque Inicial</label>
                      <input 
                        type="number" className="form-input"
                        placeholder="ex: 150"
                        value={newProduct.stock}
                        disabled={!checkPermission('estoque')}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">URL da Foto</label>
                    <input 
                      type="text" className="form-input" placeholder="https://..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingProduct ? 'Salvar Edição' : 'Cadastrar'}
                    </button>
                    {editingProduct && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingProduct(null);
                          setNewProduct({ code: '', description: '', category: 'Hortifruti', brand: '', unit: 'Un', price: '', stock: '', imageUrl: '' });
                        }}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: CLIENTS DIRECTORY */}
          {activeTab === 'clients' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Gestão de Clientes B2B
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código Único</th>
                        <th>Nome Comercial</th>
                        <th>Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantClients.map(cli => (
                        <tr key={cli.code}>
                          <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{cli.code}</td>
                          <td style={{ fontWeight: 600 }}>{cli.name}</td>
                          <td>{cli.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Register client form */}
                <form onSubmit={handleAddClient} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Novo Cliente
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Comercial / Empresa</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: Supermercado Popular"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">WhatsApp / Telefone</label>
                    <input 
                      type="text" className="form-input" placeholder="ex: (11) 98888-7777"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código de Acesso Único (6 Dígitos Numéricos)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" className="form-input" maxLength={6} placeholder="ex: 123456"
                        value={newClient.code}
                        onChange={(e) => setNewClient({ ...newClient, code: e.target.value.replace(/\D/g, '') })}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={generateRandomClientCode}
                        className="btn btn-outline"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        Gerar
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Registrar Cliente
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: STAFF MEMBERS & TOGGLE PERMISSIONS */}
          {activeTab === 'staff' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Equipe e Permissões de Acesso
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px' }}>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Acesso</th>
                        <th>Funcionário</th>
                        <th>Cargo</th>
                        <th>Permissões Ativas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantStaff.map(st => (
                        <tr key={st.code} style={{ cursor: 'pointer' }} onClick={() => handleStartEditStaff(st)}>
                          <td style={{ fontWeight: 800 }}>{st.code}</td>
                          <td>
                            <strong>{st.name}</strong>
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                            {st.role}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {Object.keys(st.permissions || {}).filter(k => st.permissions[k]).map(k => (
                                <span key={k} style={{
                                  fontSize: '9px', backgroundColor: `${company.primaryColor}15`, 
                                  color: company.primaryColor, padding: '2px 6px', borderRadius: '4px', fontWeight: 600
                                }}>
                                  {k}
                                </span>
                              ))}
                              {(!st.permissions || Object.values(st.permissions).every(v => !v)) && (
                                <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>Nenhuma</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form Staff */}
                <form onSubmit={handleAddOrEditStaff} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                    {editingStaff ? `Editar: ${newStaff.name}` : 'Registrar Funcionário'}
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Completo</label>
                    <input 
                      type="text" className="form-input" placeholder="Fernanda Lima"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Código de Acesso</label>
                      <input 
                        type="text" className="form-input" maxLength={5} placeholder="GES02"
                        value={newStaff.code}
                        disabled={!!editingStaff}
                        onChange={(e) => setNewStaff({ ...newStaff, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cargo</label>
                      <select 
                        className="form-input"
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                      >
                        <option value="gestor">Gestor</option>
                        <option value="vendedor">Vendedor</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle permissions switches */}
                  <div style={{
                    border: '1px solid var(--border-color)', borderRadius: '12px',
                    padding: '16px', backgroundColor: 'var(--bg-color)', marginTop: '8px'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>Permissões Comerciais (Toggles)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { key: 'financeiro', label: 'Financeiro / Faturamento' },
                        { key: 'produtos', label: 'Cadastro de Produtos' },
                        { key: 'precos', label: 'Alteração de Preços' },
                        { key: 'clientes', label: 'Cadastro de Clientes' },
                        { key: 'funcionarios', label: 'Gerenciar Funcionários' },
                        { key: 'relatorios', label: 'Visualizar Relatórios' },
                        { key: 'impressao', label: 'Impressão de Pedidos' },
                        { key: 'visualConfig', label: 'Alterar Cores / Logos' },
                        { key: 'estoque', label: 'Gestão de Estoque' }
                      ].map(perm => (
                        <div key={perm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{perm.label}</span>
                          <label className="switch">
                            <input 
                              type="checkbox"
                              checked={!!newStaff.permissions[perm.key]}
                              onChange={() => handleStaffPermissionToggle(perm.key)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      {editingStaff ? 'Salvar' : 'Cadastrar'}
                    </button>
                    {editingStaff && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingStaff(null);
                          setNewStaff({
                            code: '', name: '', role: 'vendedor', status: 'Active',
                            permissions: {
                              financeiro: false, produtos: false, precos: false, clientes: true,
                              funcionarios: false, relatorios: false, impressao: true, visualConfig: false,
                              estoque: false, usuarios: false
                            }
                          });
                        }}
                        className="btn btn-outline"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB: VISUAL CONFIG & BRANDING (STORE ADMIN) */}
          {activeTab === 'settings' && !isMaster && (
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Configuração da Marca Dinâmica
              </h2>

              <form onSubmit={handleSaveStoreConfig} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  Identidade Visual e Contato do Estabelecimento
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome da Loja</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.name}
                      onChange={(e) => setStoreConfig({ ...storeConfig, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Razão Social / Nome Fantasia Completo</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.tradeName}
                      onChange={(e) => setStoreConfig({ ...storeConfig, tradeName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tipo do Logotipo</label>
                    <select 
                      className="form-input"
                      value={storeConfig.logoType}
                      onChange={(e) => setStoreConfig({ ...storeConfig, logoType: e.target.value })}
                    >
                      <option value="text">Texto</option>
                      <option value="image">Imagem (URL)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{storeConfig.logoType === 'text' ? 'Texto do Logo' : 'URL do Logotipo'}</label>
                    <input 
                      type="text" className="form-input" 
                      placeholder={storeConfig.logoType === 'text' ? 'MinhaLoja' : 'https://...'}
                      value={storeConfig.logoType === 'text' ? storeConfig.logoText : storeConfig.logoUrl}
                      onChange={(e) => {
                        if (storeConfig.logoType === 'text') {
                          setStoreConfig({ ...storeConfig, logoText: e.target.value, logoUrl: '' });
                        } else {
                          setStoreConfig({ ...storeConfig, logoUrl: e.target.value, logoText: '' });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Colors block */}
                <div style={{
                  border: '1px solid var(--border-color)', borderRadius: '12px',
                  padding: '16px', backgroundColor: 'var(--bg-color)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>Cores de Identidade da Loja</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Primária</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.primaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, primaryColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.primaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, primaryColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor Secundária</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.secondaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, secondaryColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.secondaryColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, secondaryColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cor de Destaque</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="color" value={storeConfig.accentColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, accentColor: e.target.value })}
                          style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                        />
                        <input 
                          type="text" className="form-input" value={storeConfig.accentColor}
                          onChange={(e) => setStoreConfig({ ...storeConfig, accentColor: e.target.value })}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Telefone Comercial</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.phone}
                      onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">WhatsApp Oficial</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.whatsapp}
                      onChange={(e) => setStoreConfig({ ...storeConfig, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Horário de Funcionamento</label>
                    <input 
                      type="text" className="form-input" 
                      value={storeConfig.hours}
                      onChange={(e) => setStoreConfig({ ...storeConfig, hours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Endereço Comercial Físico</label>
                  <input 
                    type="text" className="form-input" 
                    value={storeConfig.address}
                    onChange={(e) => setStoreConfig({ ...storeConfig, address: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
                  <Save size={16} /> Salvar Alterações
                </button>
              </form>

              {/* Firebase Cloud Sync Configuration Section */}
              <form onSubmit={handleSaveFirebaseUrl} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  ☁️ Integração Cloud Database (Firebase)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Conecte o sistema a um banco de dados online para sincronizar pedidos, clientes e produtos entre diferentes abas (normais e anônimas) e diferentes aparelhos (computador e celular) em tempo real.
                </p>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Firebase Realtime Database URL</label>
                  <input 
                    type="url" className="form-input" 
                    placeholder="https://seu-projeto-default-rtdb.firebaseio.com"
                    value={firebaseUrl}
                    onChange={(e) => setFirebaseUrl(e.target.value)}
                  />
                  <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px', fontSize: '11px' }}>
                    * Deixe em branco para usar o modo de simulação LocalStorage (apenas offline).
                  </small>
                </div>
                <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignSelf: 'flex-start', backgroundColor: '#eab308', color: '#1e293b' }}>
                  <Save size={16} /> Conectar e Sincronizar Firebase
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* HIDDEN PRINT LAYOUT: DESIGNED FOR PAPER A4 PRINTS */}
      {activePrintOrder && (
        <div className="print-invoice-sheet" style={{ color: 'black', backgroundColor: 'white', padding: '20px' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>{company.name}</h1>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>{company.tradeName || ''}</p>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>{company.address}</p>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>Tel: {company.phone} | WhatsApp: {company.whatsapp}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '11pt' }}>
            <div>
              <p><strong>CÓD ORÇAMENTO:</strong> {activePrintOrder.id}</p>
              <p><strong>DATA DE CRIAÇÃO:</strong> {new Date(activePrintOrder.date).toLocaleString('pt-BR')}</p>
              <p><strong>TIPO DO DOCUMENTO:</strong> Orçamento de Separação B2B</p>
            </div>
            <div>
              <p><strong>CLIENTE:</strong> {activePrintOrder.clientName}</p>
              <p><strong>CÓD ACESSO:</strong> {activePrintOrder.clientCode}</p>
              <p><strong>ENTREGA / RETIRADA:</strong> {activePrintOrder.deliveryAddress || 'Retirada presencial na loja'}</p>
            </div>
          </div>

          {activePrintOrder.notes && (
            <div style={{ border: '1px solid black', padding: '8px', marginBottom: '20px', fontSize: '10pt' }}>
              <strong>INSTRUÇÕES DO CLIENTE:</strong> {activePrintOrder.notes}
            </div>
          )}

          <table className="print-invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>Item Cód</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'left' }}>Descrição do Produto</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>Qtd</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>Unidade</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>Preço Unitário</th>
                <th style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {activePrintOrder.items.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid black', padding: '6px' }}>{item.id}</td>
                  <td style={{ border: '1px solid black', padding: '6px' }}>{item.description}</td>
                  <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</td>
                  <td style={{ border: '1px solid black', padding: '6px', textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>R$ {Number(item.price || 0).toFixed(2)}</td>
                  <td style={{ border: '1px solid black', padding: '6px', textAlign: 'right' }}>R$ {Number((item.price * item.qty) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid black', paddingTop: '10px' }}>
            <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>
              VALOR TOTAL ESTIMADO: R$ {activePrintOrder.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
            <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
              Separado por (Almoxarifado)
            </div>
            <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
              Assinatura do Cliente
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
