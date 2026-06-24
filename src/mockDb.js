// Multi-tenant database simulation using localStorage for Mercado Online Facilitadora

const INITIAL_COMPANIES = {
  "coqueiro": {
    id: "coqueiro",
    name: "Casa Coqueiro",
    tradeName: "Casa Coqueiro Supermercados",
    logoUrl: "https://casacoqueiro.com.br/wp-content/uploads/2023/11/dddd-1.png",
    logoType: "image",
    primaryColor: "#059669", // Green
    secondaryColor: "#eab308", // Yellow
    accentColor: "#ef4444", // Red
    address: "Av. Copacabana, 500 - Copacabana, Rio de Janeiro - RJ",
    phone: "(21) 2233-4455",
    whatsapp: "(21) 98888-9999",
    hours: "08:00 às 20:00"
  },
  "horti-verde": {
    id: "horti-verde",
    name: "Hortifruti Verde Vale",
    tradeName: "Verde Vale Hortifruti & Cia",
    logoUrl: "",
    logoType: "text",
    logoText: "VerdeVale",
    primaryColor: "#16a34a",
    secondaryColor: "#166534",
    accentColor: "#ea580c",
    address: "Rua das Laranjeiras, 120 - Laranjeiras, Rio de Janeiro - RJ",
    phone: "(21) 3344-5566",
    whatsapp: "(21) 97777-8888",
    hours: "07:00 às 19:00"
  }
};

const INITIAL_USERS = {
  // Global Admin Master
  "WDPHP": {
    code: "WDPHP",
    name: "Admin Master",
    role: "admin-master", // admin-master, store-admin, gestor, vendedor, cliente
    status: "Active",
    companyId: null
  },
  // Store Admin - Casa Coqueiro
  "ADM01": {
    code: "ADM01",
    name: "Roberto Coqueiro (Admin)",
    role: "store-admin",
    status: "Active",
    companyId: "coqueiro"
  },
  // Gestor - Casa Coqueiro
  "GES01": {
    code: "GES01",
    name: "Fernanda Lima (Gestor)",
    role: "gestor",
    status: "Active",
    companyId: "coqueiro",
    // Toggle-based permission states
    permissions: {
      financeiro: true,
      produtos: true,
      precos: true,
      clientes: true,
      funcionarios: true,
      relatorios: true,
      impressao: true,
      visualConfig: true,
      estoque: true,
      usuarios: true
    }
  },
  // Vendedor - Casa Coqueiro
  "VEN01": {
    code: "VEN01",
    name: "Carlos Silva (Vendedor)",
    role: "vendedor",
    status: "Active",
    companyId: "coqueiro",
    permissions: {
      financeiro: false,
      produtos: false,
      precos: false,
      clientes: true,
      funcionarios: false,
      relatorios: false,
      impressao: true,
      visualConfig: false,
      estoque: false,
      usuarios: false
    }
  },
  // Clients
  "CLI01": {
    code: "CLI01",
    name: "Restaurante Tempero Bom (Cliente)",
    role: "cliente",
    status: "Active",
    companyId: "coqueiro",
    phone: "(21) 98765-4321"
  },
  "CLI02": {
    code: "CLI02",
    name: "Padaria Copacabana (Cliente)",
    role: "cliente",
    status: "Active",
    companyId: "coqueiro",
    phone: "(21) 95555-4444"
  },
  "CLI03": {
    code: "CLI03",
    name: "Lanchonete Verde Vale (Cliente)",
    role: "cliente",
    status: "Active",
    companyId: "horti-verde",
    phone: "(21) 91111-2222"
  }
};

const INITIAL_PRODUCTS = [
  // Casa Coqueiro Catalog
  {
    id: "coq-1",
    code: "COQ-101",
    description: "Biscoito Recheado Chocolate Piraquê Pacote 160g",
    category: "Mercearia",
    brand: "Piraquê",
    unit: "Un",
    price: 2.96,
    stock: 150,
    imageUrl: "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024760357",
    companyId: "coqueiro"
  },
  {
    id: "coq-2",
    code: "COQ-102",
    description: "Isotônico Gatorade Pet Laranja 500ml",
    category: "Bebidas",
    brand: "Gatorade",
    unit: "Un",
    price: 4.85,
    stock: 80,
    imageUrl: "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7892840808020",
    companyId: "coqueiro"
  },
  {
    id: "coq-3",
    code: "COQ-103",
    description: "Banana Prata de Hortifruti Clássica Kg",
    category: "Hortifruti",
    brand: "Produtor Rio",
    unit: "Kg",
    price: 6.90,
    stock: 200,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=80",
    companyId: "coqueiro"
  },
  {
    id: "coq-4",
    code: "COQ-104",
    description: "Cereal Matinal Sucrilhos Kellogg's Original 110g",
    category: "Mercearia",
    brand: "Kellogg's",
    unit: "Un",
    price: 4.23,
    stock: 120,
    imageUrl: "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896004007632",
    companyId: "coqueiro"
  },
  {
    id: "coq-5",
    code: "COQ-105",
    description: "Macarrão Instantâneo Galinha Nissin Miojo 85g",
    category: "Mercearia",
    brand: "Nissin",
    unit: "Un",
    price: 2.24,
    stock: 300,
    imageUrl: "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891079000229",
    companyId: "coqueiro"
  },
  {
    id: "coq-6",
    code: "COQ-106",
    description: "Leite de Coco Menina Garrafa 200ml",
    category: "Mercearia",
    brand: "Menina",
    unit: "Un",
    price: 3.10,
    stock: 90,
    imageUrl: "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896028014494",
    companyId: "coqueiro"
  },

  // Hortifruti Verde Vale Catalog
  {
    id: "hv-1",
    code: "HVV-201",
    description: "Alface Crespa Hidropônica Unidade",
    category: "Hortifruti",
    brand: "Verde Vale",
    unit: "Un",
    price: 3.50,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1622484211148-716598e04141?w=200&auto=format&fit=crop&q=80",
    companyId: "horti-verde"
  },
  {
    id: "hv-2",
    code: "HVV-202",
    description: "Tomate Italiano maduro Selecionado Kg",
    category: "Hortifruti",
    brand: "Fazenda Orgânica",
    unit: "Kg",
    price: 8.90,
    stock: 140,
    imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=80",
    companyId: "horti-verde"
  },
  {
    id: "hv-3",
    code: "HVV-203",
    description: "Suco de Uva Integral Aliança 1L",
    category: "Bebidas",
    brand: "Aliança",
    unit: "Un",
    price: 14.90,
    stock: 50,
    imageUrl: "",
    companyId: "horti-verde"
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-5192",
    companyId: "coqueiro",
    clientCode: "CLI01",
    clientName: "Restaurante Tempero Bom",
    date: "2026-06-23T15:20:00Z",
    items: [
      { id: "coq-3", description: "Banana Prata de Hortifruti Clássica Kg", qty: 20, price: 6.90, unit: "Kg" },
      { id: "coq-1", description: "Biscoito Recheado Chocolate Piraquê Pacote 160g", qty: 5, price: 2.96, unit: "Un" }
    ],
    total: 152.80,
    notes: "Entregar bananas no ponto de amadurecimento médio.",
    status: "Recebido" // Recebido, Em Separação, Separado, Aguardando Retirada, Retirado, Cancelado
  }
];

export const initDb = () => {
  if (!localStorage.getItem("facilitadora_companies")) {
    localStorage.setItem("facilitadora_companies", JSON.stringify(INITIAL_COMPANIES));
  }
  if (!localStorage.getItem("facilitadora_users")) {
    localStorage.setItem("facilitadora_users", JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem("facilitadora_products")) {
    localStorage.setItem("facilitadora_products", JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem("facilitadora_orders")) {
    localStorage.setItem("facilitadora_orders", JSON.stringify(INITIAL_ORDERS));
  }
};

// Companies Methods
export const getCompanies = () => {
  initDb();
  return JSON.parse(localStorage.getItem("facilitadora_companies"));
};

export const saveCompanies = (companies) => {
  localStorage.setItem("facilitadora_companies", JSON.stringify(companies));
};

// Users Methods
export const getUsers = () => {
  initDb();
  return JSON.parse(localStorage.getItem("facilitadora_users"));
};

export const saveUsers = (users) => {
  localStorage.setItem("facilitadora_users", JSON.stringify(users));
};

// Products Methods
export const getProducts = (companyId = null) => {
  initDb();
  const all = JSON.parse(localStorage.getItem("facilitadora_products"));
  if (!companyId) return all;
  return all.filter(p => p.companyId === companyId);
};

export const saveProducts = (products) => {
  localStorage.setItem("facilitadora_products", JSON.stringify(products));
};

// Orders Methods
export const getOrders = (companyId = null) => {
  initDb();
  const all = JSON.parse(localStorage.getItem("facilitadora_orders"));
  if (!companyId) return all;
  return all.filter(o => o.companyId === companyId);
};

export const saveOrders = (orders) => {
  localStorage.setItem("facilitadora_orders", JSON.stringify(orders));
};
