import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getWhitelabels, saveWhitelabels, 
  getMerchants, saveMerchants, 
  getProducts, saveProducts, 
  getOrders, saveOrders,
  getActiveWhitelabelId, setActiveWhitelabelId 
} from '../mockDb';
import { useWhitelabel } from '../WhitelabelContext';
import { Settings, Users, ShoppingBag, ClipboardList, Plus, Trash2, Edit2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { reloadThemes } = useWhitelabel();

  const [activeTab, setActiveTab] = useState('whitelabel');
  const [successMsg, setSuccessMsg] = useState('');

  // Whitelabel States
  const [whitelabels, setWhitelabels] = useState({});
  const [selectedWhitelabelId, setSelectedWhitelabelId] = useState('');
  const [editTheme, setEditTheme] = useState({
    name: '', title: '', logoText: '', primaryColor: '', secondaryColor: '', accentColor: '', banners: []
  });

  // Merchants States
  const [merchants, setMerchants] = useState({});
  const [newMerchant, setNewMerchant] = useState({
    code: '', name: '', email: '', phone: '', address: '', minOrder: 300, creditLimit: 2000, paymentTerms: 'Pix à Vista, Boleto 7 dias'
  });

  // Products States
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    id: '', description: '', category: 'Biscoitos', price: 0, packageQtd: 12, packagePrice: 0, supplierName: 'Distribuidora Fenix', imageUrl: ''
  });

  // Orders States
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Load all DB instances
    setWhitelabels(getWhitelabels());
    setSelectedWhitelabelId(getActiveWhitelabelId());
    setMerchants(getMerchants());
    setProducts(getProducts());
    setOrders(getOrders());
  }, []);

  // Sync editTheme state when whitelabel selection changes
  useEffect(() => {
    if (whitelabels[selectedWhitelabelId]) {
      setEditTheme({ ...whitelabels[selectedWhitelabelId] });
    }
  }, [selectedWhitelabelId, whitelabels]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // WHitelabel Handlers
  const handleSaveWhitelabel = (e) => {
    e.preventDefault();
    const updated = { ...whitelabels, [selectedWhitelabelId]: editTheme };
    setWhitelabels(updated);
    saveWhitelabels(updated);
    setActiveWhitelabelId(selectedWhitelabelId);
    reloadThemes();
    showSuccess('Configuração da marca Whitelabel atualizada com sucesso!');
  };

  // Merchant Handlers
  const handleAddMerchant = (e) => {
    e.preventDefault();
    const code = newMerchant.code.trim().toUpperCase();
    if (code.length !== 5) {
      alert('O código de acesso deve ter exatamente 5 caracteres.');
      return;
    }

    const updated = {
      ...merchants,
      [code]: {
        code,
        name: newMerchant.name,
        email: newMerchant.email,
        phone: newMerchant.phone,
        address: newMerchant.address,
        minOrder: Number(newMerchant.minOrder),
        creditLimit: Number(newMerchant.creditLimit),
        paymentTerms: newMerchant.paymentTerms.split(',').map(s => s.trim()).filter(Boolean)
      }
    };

    setMerchants(updated);
    saveMerchants(updated);
    setNewMerchant({
      code: '', name: '', email: '', phone: '', address: '', minOrder: 300, creditLimit: 2000, paymentTerms: 'Pix à Vista, Boleto 7 dias'
    });
    showSuccess(`Código comercial "${code}" cadastrado com sucesso!`);
  };

  const handleDeleteMerchant = (code) => {
    if (confirm(`Deseja realmente excluir o lojista "${code}"?`)) {
      const updated = { ...merchants };
      delete updated[code];
      setMerchants(updated);
      saveMerchants(updated);
      showSuccess(`Lojista "${code}" removido.`);
    }
  };

  // Product Handlers
  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Calculate package price if not supplied
    const unitPrice = parseFloat(newProduct.price);
    const qty = parseInt(newProduct.packageQtd);
    const calculatedPackPrice = newProduct.packagePrice ? parseFloat(newProduct.packagePrice) : (unitPrice * qty);

    const productToAdd = {
      id: newProduct.id || String(Date.now()),
      ean: String(Math.floor(7890000000000 + Math.random() * 9999999999)),
      description: newProduct.description,
      category: newProduct.category,
      categorySlug: newProduct.category.toLowerCase().replace(/\s+/g, '-'),
      price: unitPrice,
      packagePrice: parseFloat(calculatedPackPrice.toFixed(2)),
      packageQtd: qty,
      supplierName: newProduct.supplierName,
      imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&auto=format&fit=crop&q=80',
      stock: 300
    };

    const updated = [productToAdd, ...products];
    setProducts(updated);
    saveProducts(updated);
    
    // Reset form
    setNewProduct({
      id: '', description: '', category: 'Biscoitos', price: 0, packageQtd: 12, packagePrice: 0, supplierName: 'Distribuidora Fenix', imageUrl: ''
    });
    showSuccess('Produto adicionado ao catálogo!');
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Deseja realmente remover este produto?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      saveProducts(updated);
      showSuccess('Produto removido.');
    }
  };

  // Order Handlers
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });
    setOrders(updated);
    saveOrders(updated);
    showSuccess(`Status do pedido ${orderId} atualizado para "${newStatus}".`);
  };

  return (
    <div className="admin-container">
      {/* Admin Title Banner */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outline"
            style={{ padding: '8px 12px', borderRadius: '8px' }}
          >
            <ArrowLeft size={16} /> Voltar à Loja
          </button>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Painel de Controle SaaS
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Gerenciamento Whitelabel, lojistas, produtos e faturamento.
            </p>
          </div>
        </div>

        {/* Global Success Notification banner */}
        {successMsg && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'scaleUp 0.2s ease-out'
          }}>
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <div className="admin-layout">
        
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <button 
            onClick={() => setActiveTab('whitelabel')}
            className={`admin-tab-btn ${activeTab === 'whitelabel' ? 'active' : ''}`}
          >
            <Settings size={18} /> Configuração Whitelabel
          </button>
          
          <button 
            onClick={() => setActiveTab('merchants')}
            className={`admin-tab-btn ${activeTab === 'merchants' ? 'active' : ''}`}
          >
            <Users size={18} /> Clientes & Códigos
          </button>

          <button 
            onClick={() => setActiveTab('products')}
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          >
            <ShoppingBag size={18} /> Catálogo de Produtos
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          >
            <ClipboardList size={18} /> Painel de Pedidos
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="admin-content">
          
          {/* TAB 1: WHITELABEL SETUP */}
          {activeTab === 'whitelabel' && (
            <div style={{ textAlign: 'left', maxWidth: '800px' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>
                Gerenciar Identidade e Marcas
              </h2>

              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Selecionar Marca Ativa para Editar/Visualizar</label>
                  <select 
                    className="form-input" 
                    value={selectedWhitelabelId}
                    onChange={(e) => setSelectedWhitelabelId(e.target.value)}
                    style={{ fontWeight: 600, height: '46px' }}
                  >
                    {Object.keys(whitelabels).map(id => (
                      <option key={id} value={id}>{whitelabels[id].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editTheme && (
                <form onSubmit={handleSaveWhitelabel} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    Propriedades visuais do Tenant
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Nome Fantasia (Whitelabel)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editTheme.name}
                        onChange={(e) => setEditTheme({ ...editTheme, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Título da Guia do Navegador</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editTheme.title}
                        onChange={(e) => setEditTheme({ ...editTheme, title: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Texto da Logo</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editTheme.logoText}
                        onChange={(e) => setEditTheme({ ...editTheme, logoText: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Exibir B2B Pix Cashback?</label>
                      <select 
                        className="form-input" 
                        value={editTheme.showInstaPay ? 'yes' : 'no'}
                        onChange={(e) => setEditTheme({ ...editTheme, showInstaPay: e.target.value === 'yes' })}
                      >
                        <option value="yes">Sim</option>
                        <option value="no">Não</option>
                      </select>
                    </div>
                  </div>

                  {/* Colors picking inputs */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '14px' }}>
                      Paleta de Cores Dinâmicas (CSS Custom Variables)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Cor Primária</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={editTheme.primaryColor}
                            onChange={(e) => setEditTheme({ ...editTheme, primaryColor: e.target.value })}
                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editTheme.primaryColor} 
                            onChange={(e) => setEditTheme({ ...editTheme, primaryColor: e.target.value })}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Cor Secundária</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={editTheme.secondaryColor}
                            onChange={(e) => setEditTheme({ ...editTheme, secondaryColor: e.target.value })}
                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editTheme.secondaryColor} 
                            onChange={(e) => setEditTheme({ ...editTheme, secondaryColor: e.target.value })}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Cor de Destaque</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={editTheme.accentColor}
                            onChange={(e) => setEditTheme({ ...editTheme, accentColor: e.target.value })}
                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer', background: 'none' }}
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editTheme.accentColor} 
                            onChange={(e) => setEditTheme({ ...editTheme, accentColor: e.target.value })}
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px', padding: '12px 24px' }}
                  >
                    <Save size={16} /> Salvar Alterações
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: MERCHANTS & ACCESS CODES */}
          {activeTab === 'merchants' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>
                Gerenciar Lojistas e Códigos de Acesso
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
                {/* List of merchants */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nome Comercial</th>
                        <th>Contato / Telefone</th>
                        <th>Mínimo (R$)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(merchants).map(code => {
                        const m = merchants[code];
                        return (
                          <tr key={code}>
                            <td style={{ fontWeight: 800, color: '#0f172a' }}>{code}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{m.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{m.address}</div>
                            </td>
                            <td>
                              <div>{m.email}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{m.phone}</div>
                            </td>
                            <td>R$ {m.minOrder}</td>
                            <td>
                              <button 
                                onClick={() => handleDeleteMerchant(code)}
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Form to create a merchant */}
                <form onSubmit={handleAddMerchant} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <Plus size={18} /> Novo Código de Acesso
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Código de Acesso (5 Letras)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      maxLength={5}
                      placeholder="Ex: TIA77"
                      value={newMerchant.code}
                      onChange={(e) => setNewMerchant({ ...newMerchant, code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome Comercial</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Mercadinho Esquina"
                      value={newMerchant.name}
                      onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="financeiro@loja.com"
                      value={newMerchant.email}
                      onChange={(e) => setNewMerchant({ ...newMerchant, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Telefone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="(11) 99999-8888"
                      value={newMerchant.phone}
                      onChange={(e) => setNewMerchant({ ...newMerchant, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Endereço de Entrega</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      value={newMerchant.address}
                      onChange={(e) => setNewMerchant({ ...newMerchant, address: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Min Pedido (R$)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newMerchant.minOrder}
                        onChange={(e) => setNewMerchant({ ...newMerchant, minOrder: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Limite Crédito</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newMerchant.creditLimit}
                        onChange={(e) => setNewMerchant({ ...newMerchant, creditLimit: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Termos Pgto (separados por vírgula)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newMerchant.paymentTerms}
                      onChange={(e) => setNewMerchant({ ...newMerchant, paymentTerms: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Criar Lojista
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT CATALOG */}
          {activeTab === 'products' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>
                Catálogo de Produtos de Abastecimento
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
                {/* List */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço Un (R$)</th>
                        <th>Embalagem Caixa</th>
                        <th>Preço Caixa (R$)</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={p.imageUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                              <div>
                                <div style={{ fontWeight: 600 }}>{p.description}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>ID: {p.id} • {p.supplierName}</div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td>R$ {p.price.toFixed(2)}</td>
                          <td>{p.packageQtd} un</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>R$ {p.packagePrice.toFixed(2)}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Form */}
                <form onSubmit={handleAddProduct} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <Plus size={18} /> Novo Produto
                  </h3>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Descrição / Nome do Produto</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Biscoito Piraquê Chocolate 160g"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Categoria</label>
                    <select 
                      className="form-input"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      <option value="Biscoitos">Biscoitos</option>
                      <option value="Bebidas">Bebidas</option>
                      <option value="Higiene">Higiene</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Mercearia">Mercearia</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Preço Unitário</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-input" 
                        placeholder="2.50"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Qtd na Caixa</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        placeholder="30"
                        value={newProduct.packageQtd || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, packageQtd: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Preço Caixa (Opcional, calcula automático se zero)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="form-input" 
                      placeholder="Deixe em branco para calcular"
                      value={newProduct.packagePrice || ''}
                      onChange={(e) => setNewProduct({ ...newProduct, packagePrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nome do Distribuidor / Fornecedor</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newProduct.supplierName}
                      onChange={(e) => setNewProduct({ ...newProduct, supplierName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">URL da Imagem</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="https://..."
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                    Adicionar Produto
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS HISTORY & STATUS UPDATE */}
          {activeTab === 'orders' && (
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>
                Gerenciar Pedidos e Faturamento
              </h2>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {orders.length === 0 ? (
                  <div style={{ padding: '40px', textLight: '#94a3b8', textAlign: 'center' }}>
                    Nenhum pedido realizado ainda.
                  </div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pedido ID</th>
                        <th>Lojista / Cliente</th>
                        <th>Itens Pedidos</th>
                        <th>Total Geral</th>
                        <th>Pgto / Data</th>
                        <th>Status do Envio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(ord => (
                        <tr key={ord.id}>
                          <td style={{ fontWeight: 800, color: '#0f172a' }}>{ord.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ord.merchantName}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Cod: {ord.merchantCode}</div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontSize: '12px' }}>
                              {ord.items.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '4px', borderBottom: idx < ord.items.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: '2px' }}>
                                  • {item.description} (x{item.qty} cxs)
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px' }}>
                            R$ {ord.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <div>{ord.paymentTerm}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {new Date(ord.date).toLocaleDateString('pt-BR')} às {new Date(ord.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '12px',
                                fontWeight: 700,
                                backgroundColor: ord.status === 'Pending' ? '#fffbeb' :
                                                 ord.status === 'Approved' ? '#ecfdf5' :
                                                 ord.status === 'Shipping' ? '#eff6ff' : '#f5f3ff',
                                color: ord.status === 'Pending' ? '#d97706' :
                                       ord.status === 'Approved' ? '#059669' :
                                       ord.status === 'Shipping' ? '#2563eb' : '#4f46e5',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Pending">Pendente</option>
                              <option value="Approved">Aprovado</option>
                              <option value="Shipping">Em Transporte</option>
                              <option value="Delivered">Entregue</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
