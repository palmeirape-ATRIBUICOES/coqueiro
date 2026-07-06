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
  }};

const INITIAL_USERS = {
  // Global Admin Master
  "MASTER": {
    code: "MASTER",
    name: "Admin Master",
    role: "admin-master", // admin-master, store-admin, gestor, vendedor, cliente
    status: "Active",
    companyId: null
  },
  // Master Admin (WDPHP)
  "WDPHP": {
    code: "WDPHP",
    name: "Thiago (Admin Master)",
    role: "admin-master",
    status: "Active",
    companyId: null,
    phone: "21964422488"
  },
  // Client Test for Clubbi
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
  {
    "id": "coq-real-1",
    "code": "COQ-REAL-101",
    "description": "Refrigerante Coca-Cola PET 2L",
    "category": "Bebidas",
    "brand": "Coca-Cola",
    "unit": "Cx c/ 6",
    "price": 9.5,
    "stock": 206,
    "imageUrl": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 54.15
  },
  {
    "id": "coq-real-2",
    "code": "COQ-REAL-102",
    "description": "Cerveja Heineken Long Neck 330ml",
    "category": "Bebidas",
    "brand": "Heineken",
    "unit": "Cx c/ 24",
    "price": 6.5,
    "stock": 246,
    "imageUrl": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 148.2
  },
  {
    "id": "coq-real-3",
    "code": "COQ-REAL-103",
    "description": "Guaraná Antarctica PET 2L",
    "category": "Bebidas",
    "brand": "Antarctica",
    "unit": "Cx c/ 6",
    "price": 7.9,
    "stock": 51,
    "imageUrl": "https://images.unsplash.com/photo-1598615367916-24e0f111f17e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 45.03
  },
  {
    "id": "coq-real-4",
    "code": "COQ-REAL-104",
    "description": "Água Mineral Sem Gás Crystal 500ml",
    "category": "Bebidas",
    "brand": "Crystal",
    "unit": "Cx c/ 12",
    "price": 1.5,
    "stock": 122,
    "imageUrl": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 17.1
  },
  {
    "id": "coq-real-5",
    "code": "COQ-REAL-105",
    "description": "Energético Red Bull Can 250ml",
    "category": "Bebidas",
    "brand": "Red Bull",
    "unit": "Cx c/ 24",
    "price": 8.5,
    "stock": 234,
    "imageUrl": "https://images.unsplash.com/photo-1622543953490-0b70039a2be1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 193.8
  },
  {
    "id": "coq-real-6",
    "code": "COQ-REAL-106",
    "description": "Suco Integral de Uva Del Valle 1L",
    "category": "Bebidas",
    "brand": "Del Valle",
    "unit": "Cx c/ 6",
    "price": 12.9,
    "stock": 160,
    "imageUrl": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 73.53
  },
  {
    "id": "coq-real-7",
    "code": "COQ-REAL-107",
    "description": "Isotônico Gatorade Laranja 500ml",
    "category": "Bebidas",
    "brand": "Gatorade",
    "unit": "Cx c/ 6",
    "price": 5.5,
    "stock": 176,
    "imageUrl": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 31.35
  },
  {
    "id": "coq-real-8",
    "code": "COQ-REAL-108",
    "description": "Refrigerante Sprite PET 2L",
    "category": "Bebidas",
    "brand": "Sprite",
    "unit": "Cx c/ 6",
    "price": 8.9,
    "stock": 206,
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 50.73
  },
  {
    "id": "coq-real-9",
    "code": "COQ-REAL-109",
    "description": "Refrigerante Fanta Laranja PET 2L",
    "category": "Bebidas",
    "brand": "Fanta",
    "unit": "Cx c/ 6",
    "price": 8.9,
    "stock": 128,
    "imageUrl": "https://images.unsplash.com/photo-1525385133772-25b729f40a6b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 50.73
  },
  {
    "id": "coq-real-10",
    "code": "COQ-REAL-110",
    "description": "Refrigerante Coca-Cola Lata 350ml",
    "category": "Bebidas",
    "brand": "Coca-Cola",
    "unit": "Cx c/ 12",
    "price": 4,
    "stock": 61,
    "imageUrl": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 45.6
  },
  {
    "id": "coq-real-11",
    "code": "COQ-REAL-111",
    "description": "Cerveja Pilsen Skol Lata 350ml",
    "category": "Bebidas",
    "brand": "Skol",
    "unit": "Cx c/ 12",
    "price": 3.2,
    "stock": 154,
    "imageUrl": "https://images.unsplash.com/photo-1534080391025-a7db5e17f40e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 36.48
  },
  {
    "id": "coq-real-12",
    "code": "COQ-REAL-112",
    "description": "Cerveja Pilsen Brahma Lata 350ml",
    "category": "Bebidas",
    "brand": "Brahma",
    "unit": "Cx c/ 12",
    "price": 3.3,
    "stock": 173,
    "imageUrl": "https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 37.62
  },
  {
    "id": "coq-real-13",
    "code": "COQ-REAL-113",
    "description": "Cerveja Pilsen Amstel Lata 350ml",
    "category": "Bebidas",
    "brand": "Amstel",
    "unit": "Cx c/ 12",
    "price": 3.5,
    "stock": 130,
    "imageUrl": "https://images.unsplash.com/photo-1568644380903-a756f720acbc?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 39.9
  },
  {
    "id": "coq-real-14",
    "code": "COQ-REAL-114",
    "description": "Cerveja Puro Malte Stella Artois Long Neck 330ml",
    "category": "Bebidas",
    "brand": "Stella Artois",
    "unit": "Cx c/ 24",
    "price": 6.9,
    "stock": 122,
    "imageUrl": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 157.32
  },
  {
    "id": "coq-real-15",
    "code": "COQ-REAL-115",
    "description": "Cerveja Corona Extra Long Neck 330ml",
    "category": "Bebidas",
    "brand": "Corona",
    "unit": "Cx c/ 24",
    "price": 7.2,
    "stock": 57,
    "imageUrl": "https://images.unsplash.com/photo-1527960656-36b9012861ea?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 164.16
  },
  {
    "id": "coq-real-16",
    "code": "COQ-REAL-116",
    "description": "Água Tônica Antarctica Lata 350ml",
    "category": "Bebidas",
    "brand": "Antarctica",
    "unit": "Cx c/ 6",
    "price": 3.8,
    "stock": 241,
    "imageUrl": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 21.66
  },
  {
    "id": "coq-real-17",
    "code": "COQ-REAL-117",
    "description": "Água Mineral Com Gás Crystal 500ml",
    "category": "Bebidas",
    "brand": "Crystal",
    "unit": "Cx c/ 12",
    "price": 1.8,
    "stock": 139,
    "imageUrl": "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 20.52
  },
  {
    "id": "coq-real-18",
    "code": "COQ-REAL-118",
    "description": "Chá Gelado Leão Pêssego PET 1.5L",
    "category": "Bebidas",
    "brand": "Leão",
    "unit": "Cx c/ 6",
    "price": 7.9,
    "stock": 186,
    "imageUrl": "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 45.03
  },
  {
    "id": "coq-real-19",
    "code": "COQ-REAL-119",
    "description": "Energético Monster Green Can 473ml",
    "category": "Bebidas",
    "brand": "Monster",
    "unit": "Cx c/ 6",
    "price": 9.9,
    "stock": 166,
    "imageUrl": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 56.43
  },
  {
    "id": "coq-real-20",
    "code": "COQ-REAL-120",
    "description": "Suco Del Valle Pêssego Caixa 1L",
    "category": "Bebidas",
    "brand": "Del Valle",
    "unit": "Cx c/ 12",
    "price": 7.5,
    "stock": 155,
    "imageUrl": "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 85.5
  },
  {
    "id": "coq-real-21",
    "code": "COQ-REAL-121",
    "description": "Banana Prata Clássica Kg",
    "category": "Hortifruti",
    "brand": "Produtor Rio",
    "unit": "Kg",
    "price": 6.9,
    "stock": 198,
    "imageUrl": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.55
  },
  {
    "id": "coq-real-22",
    "code": "COQ-REAL-122",
    "description": "Tomate Italiano Maduro Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Orgânica",
    "unit": "Kg",
    "price": 8.9,
    "stock": 180,
    "imageUrl": "https://images.unsplash.com/photo-1595855759920-86582396756a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.46
  },
  {
    "id": "coq-real-23",
    "code": "COQ-REAL-123",
    "description": "Alface Crespa Hidropônica Unidade",
    "category": "Hortifruti",
    "brand": "Verde Vale",
    "unit": "Un",
    "price": 3.5,
    "stock": 109,
    "imageUrl": "https://images.unsplash.com/photo-1622484211148-716598e04141?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3.32
  },
  {
    "id": "coq-real-24",
    "code": "COQ-REAL-124",
    "description": "Batata Monalisa Especial Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 5.8,
    "stock": 105,
    "imageUrl": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.51
  },
  {
    "id": "coq-real-25",
    "code": "COQ-REAL-125",
    "description": "Cebola Nacional Selecionada Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 4.9,
    "stock": 130,
    "imageUrl": "https://images.unsplash.com/photo-1508747703725-719ae257c26a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.66
  },
  {
    "id": "coq-real-26",
    "code": "COQ-REAL-126",
    "description": "Cenoura Especial Lavada Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 5.5,
    "stock": 127,
    "imageUrl": "https://images.unsplash.com/photo-1598170845058-32b996a69f76?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.22
  },
  {
    "id": "coq-real-27",
    "code": "COQ-REAL-127",
    "description": "Alho Roxo Nacional Cabeça Unidade",
    "category": "Hortifruti",
    "brand": "Produtor Rio",
    "unit": "Un",
    "price": 1.5,
    "stock": 140,
    "imageUrl": "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 1.42
  },
  {
    "id": "coq-real-28",
    "code": "COQ-REAL-128",
    "description": "Brócolis Americano Unidade",
    "category": "Hortifruti",
    "brand": "Verde Vale",
    "unit": "Un",
    "price": 6.9,
    "stock": 77,
    "imageUrl": "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.55
  },
  {
    "id": "coq-real-29",
    "code": "COQ-REAL-129",
    "description": "Maçã Gala Importada Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Sul",
    "unit": "Kg",
    "price": 11.9,
    "stock": 234,
    "imageUrl": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 11.3
  },
  {
    "id": "coq-real-30",
    "code": "COQ-REAL-130",
    "description": "Laranja Pêra Doce Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 4.5,
    "stock": 234,
    "imageUrl": "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.27
  },
  {
    "id": "coq-real-31",
    "code": "COQ-REAL-131",
    "description": "Limão Taiti Selecionado Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 3.9,
    "stock": 127,
    "imageUrl": "https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3.7
  },
  {
    "id": "coq-real-32",
    "code": "COQ-REAL-132",
    "description": "Morango Especial Bandeja 250g",
    "category": "Hortifruti",
    "brand": "Verde Vale",
    "unit": "Un",
    "price": 9.9,
    "stock": 120,
    "imageUrl": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9.4
  },
  {
    "id": "coq-real-33",
    "code": "COQ-REAL-133",
    "description": "Uva Thompson Sem Semente Bandeja 500g",
    "category": "Hortifruti",
    "brand": "Fazenda Sul",
    "unit": "Un",
    "price": 12.9,
    "stock": 101,
    "imageUrl": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12.25
  },
  {
    "id": "coq-real-34",
    "code": "COQ-REAL-134",
    "description": "Melancia Inteira Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Laranjal",
    "unit": "Kg",
    "price": 2.9,
    "stock": 220,
    "imageUrl": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 2.75
  },
  {
    "id": "coq-real-35",
    "code": "COQ-REAL-135",
    "description": "Abacaxi Pérola Doce Unidade",
    "category": "Hortifruti",
    "brand": "Produtor Rio",
    "unit": "Un",
    "price": 7.9,
    "stock": 89,
    "imageUrl": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-real-36",
    "code": "COQ-REAL-136",
    "description": "Mamão Papaia Selecionado Unidade",
    "category": "Hortifruti",
    "brand": "Produtor Rio",
    "unit": "Un",
    "price": 5.9,
    "stock": 58,
    "imageUrl": "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.61
  },
  {
    "id": "coq-real-37",
    "code": "COQ-REAL-137",
    "description": "Manga Palmer Doce Kg",
    "category": "Hortifruti",
    "brand": "Produtor Rio",
    "unit": "Kg",
    "price": 7.9,
    "stock": 97,
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-real-38",
    "code": "COQ-REAL-138",
    "description": "Abacate Manteiga Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Orgânica",
    "unit": "Kg",
    "price": 6.9,
    "stock": 95,
    "imageUrl": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.55
  },
  {
    "id": "coq-real-39",
    "code": "COQ-REAL-139",
    "description": "Pepino Japonês Especial Kg",
    "category": "Hortifruti",
    "brand": "Verde Vale",
    "unit": "Kg",
    "price": 5.5,
    "stock": 199,
    "imageUrl": "https://images.unsplash.com/photo-1449339091482-441d9668d29b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.22
  },
  {
    "id": "coq-real-40",
    "code": "COQ-REAL-140",
    "description": "Abóbora Cabotiá Pedaço Kg",
    "category": "Hortifruti",
    "brand": "Fazenda Orgânica",
    "unit": "Kg",
    "price": 4.8,
    "stock": 108,
    "imageUrl": "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.56
  },
  {
    "id": "coq-real-41",
    "code": "COQ-REAL-141",
    "description": "Arroz Agulhinha Camil Tipo 1 5kg",
    "category": "Mercearia",
    "brand": "Camil",
    "unit": "Cx c/ 6",
    "price": 26.9,
    "stock": 96,
    "imageUrl": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 153.33
  },
  {
    "id": "coq-real-42",
    "code": "COQ-REAL-142",
    "description": "Feijão Carioca Kicaldo 1kg",
    "category": "Mercearia",
    "brand": "Kicaldo",
    "unit": "Cx c/ 10",
    "price": 7.5,
    "stock": 56,
    "imageUrl": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 71.25
  },
  {
    "id": "coq-real-43",
    "code": "COQ-REAL-143",
    "description": "Açúcar Refinado União 1kg",
    "category": "Mercearia",
    "brand": "União",
    "unit": "Cx c/ 10",
    "price": 4.2,
    "stock": 57,
    "imageUrl": "https://images.unsplash.com/photo-1600854483722-1d572718e24c?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 39.9
  },
  {
    "id": "coq-real-44",
    "code": "COQ-REAL-144",
    "description": "Sal Refinado Cisne 1kg",
    "category": "Mercearia",
    "brand": "Cisne",
    "unit": "Cx c/ 30",
    "price": 2.5,
    "stock": 166,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 71.25
  },
  {
    "id": "coq-real-45",
    "code": "COQ-REAL-145",
    "description": "Óleo de Soja Soya 900ml",
    "category": "Mercearia",
    "brand": "Soya",
    "unit": "Cx c/ 20",
    "price": 6.2,
    "stock": 185,
    "imageUrl": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 117.8
  },
  {
    "id": "coq-real-46",
    "code": "COQ-REAL-146",
    "description": "Azeite de Oliva Gallo Extra Virgem 500ml",
    "category": "Mercearia",
    "brand": "Gallo",
    "unit": "Cx c/ 6",
    "price": 32.9,
    "stock": 184,
    "imageUrl": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 187.53
  },
  {
    "id": "coq-real-47",
    "code": "COQ-REAL-147",
    "description": "Farinha de Trigo Dona Benta Tipo 1 1kg",
    "category": "Mercearia",
    "brand": "Denta Benta",
    "unit": "Cx c/ 10",
    "price": 5.8,
    "stock": 173,
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 55.1
  },
  {
    "id": "coq-real-48",
    "code": "COQ-REAL-148",
    "description": "Café Torrado e Moído Pilão Tradicional 500g",
    "category": "Mercearia",
    "brand": "Pilão",
    "unit": "Cx c/ 10",
    "price": 16.9,
    "stock": 127,
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 160.55
  },
  {
    "id": "coq-real-49",
    "code": "COQ-REAL-149",
    "description": "Molho de Tomate Pomarola Tradicional 340g",
    "category": "Mercearia",
    "brand": "Pomarola",
    "unit": "Cx c/ 24",
    "price": 2.1,
    "stock": 144,
    "imageUrl": "https://images.unsplash.com/photo-1607301408269-ac1702167d68?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 47.88
  },
  {
    "id": "coq-real-50",
    "code": "COQ-REAL-150",
    "description": "Ketchup Heinz Tradicional PET 397g",
    "category": "Mercearia",
    "brand": "Heinz",
    "unit": "Cx c/ 12",
    "price": 11.9,
    "stock": 152,
    "imageUrl": "https://images.unsplash.com/photo-1600006330811-9a744211f17e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 135.66
  },
  {
    "id": "coq-real-51",
    "code": "COQ-REAL-151",
    "description": "Maionese Hellmann's Tradicional Pote 500g",
    "category": "Mercearia",
    "brand": "Hellmann's",
    "unit": "Cx c/ 12",
    "price": 9.8,
    "stock": 146,
    "imageUrl": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 111.72
  },
  {
    "id": "coq-real-52",
    "code": "COQ-REAL-152",
    "description": "Milho Verde em Conserva Quero Lata 170g",
    "category": "Mercearia",
    "brand": "Quero",
    "unit": "Cx c/ 24",
    "price": 3.2,
    "stock": 131,
    "imageUrl": "https://images.unsplash.com/photo-1578271851222-4022766062a1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 72.96
  },
  {
    "id": "coq-real-53",
    "code": "COQ-REAL-153",
    "description": "Creme de Leite Leve Nestlé Caixinha 200g",
    "category": "Mercearia",
    "brand": "Nestlé",
    "unit": "Cx c/ 24",
    "price": 3.9,
    "stock": 115,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 88.92
  },
  {
    "id": "coq-real-54",
    "code": "COQ-REAL-154",
    "description": "Leite Condensado Moça Lata 395g",
    "category": "Mercearia",
    "brand": "Moça",
    "unit": "Cx c/ 24",
    "price": 6.5,
    "stock": 102,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 148.2
  },
  {
    "id": "coq-real-55",
    "code": "COQ-REAL-155",
    "description": "Macarrão Espaguete Adria Semola 500g",
    "category": "Mercearia",
    "brand": "Adria",
    "unit": "Cx c/ 20",
    "price": 4.5,
    "stock": 88,
    "imageUrl": "https://images.unsplash.com/photo-1621961401348-f099ce688b4a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 85.5
  },
  {
    "id": "coq-real-56",
    "code": "COQ-REAL-156",
    "description": "Extrato de Tomate Elefante Pote 340g",
    "category": "Mercearia",
    "brand": "Elefante",
    "unit": "Cx c/ 24",
    "price": 4.8,
    "stock": 89,
    "imageUrl": "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 109.44
  },
  {
    "id": "coq-real-57",
    "code": "COQ-REAL-157",
    "description": "Farofa Pronta Mandioca Yoki Tradicional 500g",
    "category": "Mercearia",
    "brand": "Yoki",
    "unit": "Cx c/ 10",
    "price": 5.9,
    "stock": 215,
    "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 56.05
  },
  {
    "id": "coq-real-58",
    "code": "COQ-REAL-158",
    "description": "Pipoca Microondas Yoki Manteiga 100g",
    "category": "Mercearia",
    "brand": "Yoki",
    "unit": "Cx c/ 20",
    "price": 2.9,
    "stock": 122,
    "imageUrl": "https://images.unsplash.com/photo-1610614819513-58e34989848b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 55.1
  },
  {
    "id": "coq-real-59",
    "code": "COQ-REAL-159",
    "description": "Sardinha Coqueiro em Óleo Lata 125g",
    "category": "Mercearia",
    "brand": "Coqueiro",
    "unit": "Cx c/ 50",
    "price": 4.5,
    "stock": 118,
    "imageUrl": "https://images.unsplash.com/photo-1578271851222-4022766062a1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 50,
    "packagePrice": 213.75
  },
  {
    "id": "coq-real-60",
    "code": "COQ-REAL-160",
    "description": "Atum Ralado Coqueiro em Óleo Lata 170g",
    "category": "Mercearia",
    "brand": "Coqueiro",
    "unit": "Cx c/ 24",
    "price": 7.9,
    "stock": 83,
    "imageUrl": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 180.12
  },
  {
    "id": "coq-real-61",
    "code": "COQ-REAL-161",
    "description": "Biscoito Oreo Recheado Original 90g",
    "category": "Biscoitos",
    "brand": "Oreo",
    "unit": "Cx c/ 30",
    "price": 3.5,
    "stock": 107,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 99.75
  },
  {
    "id": "coq-real-62",
    "code": "COQ-REAL-162",
    "description": "Biscoito Passatempo Recheado Chocolate 130g",
    "category": "Biscoitos",
    "brand": "Passatempo",
    "unit": "Cx c/ 30",
    "price": 2.8,
    "stock": 167,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 79.8
  },
  {
    "id": "coq-real-63",
    "code": "COQ-REAL-163",
    "description": "Biscoito Trakinas Recheado Chocolate 126g",
    "category": "Biscoitos",
    "brand": "Trakinas",
    "unit": "Cx c/ 30",
    "price": 2.7,
    "stock": 133,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 76.95
  },
  {
    "id": "coq-real-64",
    "code": "COQ-REAL-164",
    "description": "Biscoito Bono Recheado Doce de Leite 140g",
    "category": "Biscoitos",
    "brand": "Bono",
    "unit": "Cx c/ 30",
    "price": 2.9,
    "stock": 163,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 82.65
  },
  {
    "id": "coq-real-65",
    "code": "COQ-REAL-165",
    "description": "Biscoito Negresco Recheado Original 140g",
    "category": "Biscoitos",
    "brand": "Negresco",
    "unit": "Cx c/ 30",
    "price": 2.9,
    "stock": 57,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 82.65
  },
  {
    "id": "coq-real-66",
    "code": "COQ-REAL-166",
    "description": "Biscoito Club Social Salgado Original 141g",
    "category": "Biscoitos",
    "brand": "Club Social",
    "unit": "Cx c/ 24",
    "price": 4.2,
    "stock": 124,
    "imageUrl": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 95.76
  },
  {
    "id": "coq-real-67",
    "code": "COQ-REAL-167",
    "description": "Biscoito Pit Stop Salgado Original 162g",
    "category": "Biscoitos",
    "brand": "Pit Stop",
    "unit": "Cx c/ 20",
    "price": 3.8,
    "stock": 95,
    "imageUrl": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 72.2
  },
  {
    "id": "coq-real-68",
    "code": "COQ-REAL-168",
    "description": "Biscoito Recheado Chocolate Piraquê 160g",
    "category": "Biscoitos",
    "brand": "Piraquê",
    "unit": "Cx c/ 30",
    "price": 2.96,
    "stock": 151,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 84.36
  },
  {
    "id": "coq-real-69",
    "code": "COQ-REAL-169",
    "description": "Biscoito Recheado Limão Piraquê 160g",
    "category": "Biscoitos",
    "brand": "Piraquê",
    "unit": "Cx c/ 30",
    "price": 2.96,
    "stock": 113,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 84.36
  },
  {
    "id": "coq-real-70",
    "code": "COQ-REAL-170",
    "description": "Biscoito Recheado Morango Piraquê 160g",
    "category": "Biscoitos",
    "brand": "Piraquê",
    "unit": "Cx c/ 30",
    "price": 2.96,
    "stock": 53,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 84.36
  },
  {
    "id": "coq-real-71",
    "code": "COQ-REAL-171",
    "description": "Biscoito Maizena Piraquê Pacote 175g",
    "category": "Biscoitos",
    "brand": "Piraquê",
    "unit": "Cx c/ 48",
    "price": 2.96,
    "stock": 59,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 48,
    "packagePrice": 134.98
  },
  {
    "id": "coq-real-72",
    "code": "COQ-REAL-172",
    "description": "Biscoito Leite Maltado Original Piraquê 132g",
    "category": "Biscoitos",
    "brand": "Piraquê",
    "unit": "Cx c/ 50",
    "price": 2.8,
    "stock": 194,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 50,
    "packagePrice": 133
  },
  {
    "id": "coq-real-73",
    "code": "COQ-REAL-173",
    "description": "Wafer Bauducco Chocolate 140g",
    "category": "Biscoitos",
    "brand": "Bauducco",
    "unit": "Cx c/ 30",
    "price": 3.1,
    "stock": 105,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 88.35
  },
  {
    "id": "coq-real-74",
    "code": "COQ-REAL-174",
    "description": "Wafer Bauducco Morango 140g",
    "category": "Biscoitos",
    "brand": "Bauducco",
    "unit": "Cx c/ 30",
    "price": 3.1,
    "stock": 70,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 30,
    "packagePrice": 88.35
  },
  {
    "id": "coq-real-75",
    "code": "COQ-REAL-175",
    "description": "Cookies Chocolate Toddy Pacote 60g",
    "category": "Biscoitos",
    "brand": "Toddy",
    "unit": "Cx c/ 24",
    "price": 3.5,
    "stock": 214,
    "imageUrl": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 79.8
  },
  {
    "id": "coq-real-76",
    "code": "COQ-REAL-176",
    "description": "Torrada Bauducco Salgada Tradicional 160g",
    "category": "Biscoitos",
    "brand": "Bauducco",
    "unit": "Cx c/ 20",
    "price": 4.8,
    "stock": 72,
    "imageUrl": "https://images.unsplash.com/photo-1600431521340-491eca880813?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 91.2
  },
  {
    "id": "coq-real-77",
    "code": "COQ-REAL-177",
    "description": "Biscoito Salgado Água e Sal Marilan 350g",
    "category": "Biscoitos",
    "brand": "Marilan",
    "unit": "Cx c/ 20",
    "price": 5.5,
    "stock": 140,
    "imageUrl": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 104.5
  },
  {
    "id": "coq-real-78",
    "code": "COQ-REAL-178",
    "description": "Biscoito Cream Cracker Vitarella 350g",
    "category": "Biscoitos",
    "brand": "Vitarella",
    "unit": "Cx c/ 20",
    "price": 5.9,
    "stock": 77,
    "imageUrl": "https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 112.1
  },
  {
    "id": "coq-real-79",
    "code": "COQ-REAL-179",
    "description": "Biscoito de Polvilho Globo Salgado 100g",
    "category": "Biscoitos",
    "brand": "Globo",
    "unit": "Cx c/ 24",
    "price": 3.9,
    "stock": 175,
    "imageUrl": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 88.92
  },
  {
    "id": "coq-real-80",
    "code": "COQ-REAL-180",
    "description": "Bolinho de Chocolate Bauducco 40g",
    "category": "Biscoitos",
    "brand": "Bauducco",
    "unit": "Cx c/ 24",
    "price": 1.8,
    "stock": 74,
    "imageUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 41.04
  },
  {
    "id": "coq-real-81",
    "code": "COQ-REAL-181",
    "description": "Leite UHT Integral Piracanjuba 1L",
    "category": "Laticínios",
    "brand": "Piracanjuba",
    "unit": "Cx c/ 12",
    "price": 4.9,
    "stock": 226,
    "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 55.86
  },
  {
    "id": "coq-real-82",
    "code": "COQ-REAL-182",
    "description": "Leite UHT Desnatado Piracanjuba 1L",
    "category": "Laticínios",
    "brand": "Piracanjuba",
    "unit": "Cx c/ 12",
    "price": 4.95,
    "stock": 156,
    "imageUrl": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 56.43
  },
  {
    "id": "coq-real-83",
    "code": "COQ-REAL-183",
    "description": "Requeijão Cremoso Vigor Pote 200g",
    "category": "Laticínios",
    "brand": "Vigor",
    "unit": "Cx c/ 24",
    "price": 8.9,
    "stock": 176,
    "imageUrl": "https://images.unsplash.com/photo-1528750951167-a53b3f2ff112?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 202.92
  },
  {
    "id": "coq-real-84",
    "code": "COQ-REAL-184",
    "description": "Margarina Qualy com Sal Pote 500g",
    "category": "Laticínios",
    "brand": "Qualy",
    "unit": "Cx c/ 12",
    "price": 7.9,
    "stock": 148,
    "imageUrl": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 90.06
  },
  {
    "id": "coq-real-85",
    "code": "COQ-REAL-185",
    "description": "Manteiga com Sal Aviação Pote 200g",
    "category": "Laticínios",
    "brand": "Aviação",
    "unit": "Cx c/ 12",
    "price": 12.9,
    "stock": 69,
    "imageUrl": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 147.06
  },
  {
    "id": "coq-real-86",
    "code": "COQ-REAL-186",
    "description": "Queijo Parmesão Ralado Faixa Azul 50g",
    "category": "Laticínios",
    "brand": "Faixa Azul",
    "unit": "Cx c/ 20",
    "price": 5.5,
    "stock": 196,
    "imageUrl": "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 104.5
  },
  {
    "id": "coq-real-87",
    "code": "COQ-REAL-187",
    "description": "Iogurte Natural Integral Danone 170g",
    "category": "Laticínios",
    "brand": "Danone",
    "unit": "Cx c/ 12",
    "price": 2.8,
    "stock": 55,
    "imageUrl": "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 31.92
  },
  {
    "id": "coq-real-88",
    "code": "COQ-REAL-188",
    "description": "Iogurte Grego Tradicional Vigor 100g",
    "category": "Laticínios",
    "brand": "Vigor",
    "unit": "Cx c/ 12",
    "price": 3.5,
    "stock": 109,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 39.9
  },
  {
    "id": "coq-real-89",
    "code": "COQ-REAL-189",
    "description": "Leite Fermentado Yakult 6un 480g",
    "category": "Laticínios",
    "brand": "Yakult",
    "unit": "Cx c/ 6",
    "price": 9.8,
    "stock": 182,
    "imageUrl": "https://images.unsplash.com/photo-1571244856353-fb80df9fa3b4?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 55.86
  },
  {
    "id": "coq-real-90",
    "code": "COQ-REAL-190",
    "description": "Achocolatado Líquido Toddynho 200ml",
    "category": "Laticínios",
    "brand": "Toddynho",
    "unit": "Cx c/ 27",
    "price": 2.2,
    "stock": 119,
    "imageUrl": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 27,
    "packagePrice": 56.43
  },
  {
    "id": "coq-real-91",
    "code": "COQ-REAL-191",
    "description": "Queijo Mussarela Fatiado President 150g",
    "category": "Laticínios",
    "brand": "President",
    "unit": "Cx c/ 12",
    "price": 9.9,
    "stock": 119,
    "imageUrl": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 112.86
  },
  {
    "id": "coq-real-92",
    "code": "COQ-REAL-192",
    "description": "Queijo Prato Fatiado President 150g",
    "category": "Laticínios",
    "brand": "President",
    "unit": "Cx c/ 12",
    "price": 9.9,
    "stock": 195,
    "imageUrl": "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 112.86
  },
  {
    "id": "coq-real-93",
    "code": "COQ-REAL-193",
    "description": "Creme de Queijo Minas Vigor Pote 200g",
    "category": "Laticínios",
    "brand": "Vigor",
    "unit": "Cx c/ 12",
    "price": 7.9,
    "stock": 108,
    "imageUrl": "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 90.06
  },
  {
    "id": "coq-real-94",
    "code": "COQ-REAL-194",
    "description": "Danoninho Petit Suisse Morango 6un 360g",
    "category": "Laticínios",
    "brand": "Danoninho",
    "unit": "Cx c/ 12",
    "price": 7.5,
    "stock": 199,
    "imageUrl": "https://images.unsplash.com/photo-1528750951167-a53b3f2ff112?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 85.5
  },
  {
    "id": "coq-real-95",
    "code": "COQ-REAL-195",
    "description": "Cream Cheese Philadelphia Original 150g",
    "category": "Laticínios",
    "brand": "Philadelphia",
    "unit": "Cx c/ 12",
    "price": 8.9,
    "stock": 108,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 101.46
  },
  {
    "id": "coq-real-96",
    "code": "COQ-REAL-196",
    "description": "Leite Fermentado Chamyto 6un 480g",
    "category": "Laticínios",
    "brand": "Chamyto",
    "unit": "Cx c/ 6",
    "price": 7.2,
    "stock": 215,
    "imageUrl": "https://images.unsplash.com/photo-1528750951167-a53b3f2ff112?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 41.04
  },
  {
    "id": "coq-real-97",
    "code": "COQ-REAL-197",
    "description": "Iogurte Corpus Morango Pote 850g",
    "category": "Laticínios",
    "brand": "Corpus",
    "unit": "Cx c/ 6",
    "price": 11.5,
    "stock": 123,
    "imageUrl": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 65.55
  },
  {
    "id": "coq-real-98",
    "code": "COQ-REAL-198",
    "description": "Requeijão Cremoso Nestlé Copo 200g",
    "category": "Laticínios",
    "brand": "Nestlé",
    "unit": "Cx c/ 24",
    "price": 9.2,
    "stock": 177,
    "imageUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 209.76
  },
  {
    "id": "coq-real-99",
    "code": "COQ-REAL-199",
    "description": "Margarina Delícia com Sal Pote 500g",
    "category": "Laticínios",
    "brand": "Delícia",
    "unit": "Cx c/ 12",
    "price": 6.9,
    "stock": 187,
    "imageUrl": "https://images.unsplash.com/photo-1528750951167-a53b3f2ff112?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 78.66
  },
  {
    "id": "coq-real-100",
    "code": "COQ-REAL-200",
    "description": "Manteiga com Sal Itambé Pote 200g",
    "category": "Laticínios",
    "brand": "Itambé",
    "unit": "Cx c/ 12",
    "price": 11.9,
    "stock": 148,
    "imageUrl": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 135.66
  },
  {
    "id": "coq-real-101",
    "code": "COQ-REAL-201",
    "description": "Sabão em Pó Omo Lavagem Perfeita 800g",
    "category": "Limpeza",
    "brand": "Omo",
    "unit": "Cx c/ 12",
    "price": 14.9,
    "stock": 182,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 169.86
  },
  {
    "id": "coq-real-102",
    "code": "COQ-REAL-202",
    "description": "Detergente Líquido Neutro Ypê 500ml",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 24",
    "price": 2.3,
    "stock": 165,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 52.44
  },
  {
    "id": "coq-real-103",
    "code": "COQ-REAL-203",
    "description": "Detergente Líquido Coco Ypê 500ml",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 24",
    "price": 2.4,
    "stock": 103,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 54.72
  },
  {
    "id": "coq-real-104",
    "code": "COQ-REAL-204",
    "description": "Detergente Líquido Azul Clear Ypê 500ml",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 24",
    "price": 2.3,
    "stock": 247,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 52.44
  },
  {
    "id": "coq-real-105",
    "code": "COQ-REAL-205",
    "description": "Amaciante Concentrado Downy Brisa de Verão 500ml",
    "category": "Limpeza",
    "brand": "Downy",
    "unit": "Cx c/ 6",
    "price": 11.5,
    "stock": 165,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 65.55
  },
  {
    "id": "coq-real-106",
    "code": "COQ-REAL-206",
    "description": "Desinfetante Pinho Sol Original 500ml",
    "category": "Limpeza",
    "brand": "Pinho Sol",
    "unit": "Cx c/ 12",
    "price": 4.8,
    "stock": 147,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 54.72
  },
  {
    "id": "coq-real-107",
    "code": "COQ-REAL-207",
    "description": "Lustra Móveis Poliflor Lavanda 200ml",
    "category": "Limpeza",
    "brand": "Poliflor",
    "unit": "Cx c/ 12",
    "price": 7.2,
    "stock": 93,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 82.08
  },
  {
    "id": "coq-real-108",
    "code": "COQ-REAL-208",
    "description": "Esponja Dupla Face Scotch-Brite Leve 4 Pague 3",
    "category": "Limpeza",
    "brand": "Scotch-Brite",
    "unit": "Cx c/ 10",
    "price": 6.9,
    "stock": 62,
    "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 65.55
  },
  {
    "id": "coq-real-109",
    "code": "COQ-REAL-209",
    "description": "Esponja de Lã de Aço Bombril Pacote 8un",
    "category": "Limpeza",
    "brand": "Bom Bril",
    "unit": "Cx c/ 14",
    "price": 3.5,
    "stock": 81,
    "imageUrl": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 14,
    "packagePrice": 46.55
  },
  {
    "id": "coq-real-110",
    "code": "COQ-REAL-210",
    "description": "Sabão em Barra Glicerinado Ypê Neutro 5un 900g",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 10",
    "price": 9.8,
    "stock": 55,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 93.1
  },
  {
    "id": "coq-real-111",
    "code": "COQ-REAL-211",
    "description": "Água Sanitária Ypê Garrafa 2L",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 6",
    "price": 5.2,
    "stock": 125,
    "imageUrl": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 29.64
  },
  {
    "id": "coq-real-112",
    "code": "COQ-REAL-212",
    "description": "Saco para Lixo Embalixo 50L 30un",
    "category": "Limpeza",
    "brand": "Embalixo",
    "unit": "Cx c/ 10",
    "price": 12.9,
    "stock": 207,
    "imageUrl": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 10,
    "packagePrice": 122.55
  },
  {
    "id": "coq-real-113",
    "code": "COQ-REAL-213",
    "description": "Desengordurante Veja Cozinha Limão Pulverizador 500ml",
    "category": "Limpeza",
    "brand": "Veja",
    "unit": "Cx c/ 12",
    "price": 8.9,
    "stock": 135,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 101.46
  },
  {
    "id": "coq-real-114",
    "code": "COQ-REAL-214",
    "description": "Limpador Multiuso Veja Classic 500ml",
    "category": "Limpeza",
    "brand": "Veja",
    "unit": "Cx c/ 12",
    "price": 4.5,
    "stock": 141,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 51.3
  },
  {
    "id": "coq-real-115",
    "code": "COQ-REAL-215",
    "description": "Cloro Ativo Super Globo 1L",
    "category": "Limpeza",
    "brand": "Super Globo",
    "unit": "Cx c/ 12",
    "price": 4.2,
    "stock": 142,
    "imageUrl": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 47.88
  },
  {
    "id": "coq-real-116",
    "code": "COQ-REAL-216",
    "description": "Sabão Líquido Omo Lavagem Perfeita Galão 3L",
    "category": "Limpeza",
    "brand": "Omo",
    "unit": "Cx c/ 4",
    "price": 35.9,
    "stock": 203,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 4,
    "packagePrice": 136.42
  },
  {
    "id": "coq-real-117",
    "code": "COQ-REAL-217",
    "description": "Amaciante Ypê Tradicional Azul 2L",
    "category": "Limpeza",
    "brand": "Ypê",
    "unit": "Cx c/ 6",
    "price": 8.9,
    "stock": 168,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 50.73
  },
  {
    "id": "coq-real-118",
    "code": "COQ-REAL-218",
    "description": "Desinfetante Lysoform Bruto Suave 1L",
    "category": "Limpeza",
    "brand": "Lysoform",
    "unit": "Cx c/ 12",
    "price": 12.9,
    "stock": 180,
    "imageUrl": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 147.06
  },
  {
    "id": "coq-real-119",
    "code": "COQ-REAL-219",
    "description": "Limpador de Vidros Veja Vidrex Frasco 500ml",
    "category": "Limpeza",
    "brand": "Veja",
    "unit": "Cx c/ 12",
    "price": 7.9,
    "stock": 190,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 90.06
  },
  {
    "id": "coq-real-120",
    "code": "COQ-REAL-220",
    "description": "Saponáceo Cremoso Radium Clássico 250ml",
    "category": "Limpeza",
    "brand": "Radium",
    "unit": "Cx c/ 20",
    "price": 5.5,
    "stock": 55,
    "imageUrl": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 20,
    "packagePrice": 104.5
  },
  {
    "id": "coq-real-121",
    "code": "COQ-REAL-221",
    "description": "Creme Dental Colgate Total 12 Fresh Mint 90g",
    "category": "Higiene",
    "brand": "Colgate",
    "unit": "Cx c/ 12",
    "price": 4.5,
    "stock": 205,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 51.3
  },
  {
    "id": "coq-real-122",
    "code": "COQ-REAL-222",
    "description": "Creme Dental Colgate Tripla Ação Menta 90g",
    "category": "Higiene",
    "brand": "Colgate",
    "unit": "Cx c/ 12",
    "price": 2.8,
    "stock": 103,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 31.92
  },
  {
    "id": "coq-real-123",
    "code": "COQ-REAL-223",
    "description": "Sabonete em Barra Dove Original 90g",
    "category": "Higiene",
    "brand": "Dove",
    "unit": "Cx c/ 24",
    "price": 3.5,
    "stock": 147,
    "imageUrl": "https://images.unsplash.com/photo-1607006342411-9a910c64b6c8?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 79.8
  },
  {
    "id": "coq-real-124",
    "code": "COQ-REAL-224",
    "description": "Sabonete em Barra Protex Aloe 85g",
    "category": "Higiene",
    "brand": "Protex",
    "unit": "Cx c/ 24",
    "price": 2.9,
    "stock": 190,
    "imageUrl": "https://images.unsplash.com/photo-1607006342411-9a910c64b6c8?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 66.12
  },
  {
    "id": "coq-real-125",
    "code": "COQ-REAL-225",
    "description": "Desodorante Aerosol Rexona Men Active 150ml",
    "category": "Higiene",
    "brand": "Rexona",
    "unit": "Cx c/ 12",
    "price": 15.9,
    "stock": 70,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 181.26
  },
  {
    "id": "coq-real-126",
    "code": "COQ-REAL-226",
    "description": "Desodorante Aerosol Dove Feminino Original 150ml",
    "category": "Higiene",
    "brand": "Dove",
    "unit": "Cx c/ 12",
    "price": 16.9,
    "stock": 155,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 192.66
  },
  {
    "id": "coq-real-127",
    "code": "COQ-REAL-227",
    "description": "Shampoo Seda Ceramidas Frasco 325ml",
    "category": "Higiene",
    "brand": "Seda",
    "unit": "Cx c/ 12",
    "price": 12.9,
    "stock": 134,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 147.06
  },
  {
    "id": "coq-real-128",
    "code": "COQ-REAL-228",
    "description": "Condicionador Seda Ceramidas Frasco 325ml",
    "category": "Higiene",
    "brand": "Seda",
    "unit": "Cx c/ 12",
    "price": 14.5,
    "stock": 167,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 165.3
  },
  {
    "id": "coq-real-129",
    "code": "COQ-REAL-229",
    "description": "Shampoo Pantene Restauração Frasco 400ml",
    "category": "Higiene",
    "brand": "Pantene",
    "unit": "Cx c/ 12",
    "price": 18.5,
    "stock": 158,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 210.9
  },
  {
    "id": "coq-real-130",
    "code": "COQ-REAL-230",
    "description": "Condicionador Pantene Restauração Frasco 400ml",
    "category": "Higiene",
    "brand": "Pantene",
    "unit": "Cx c/ 12",
    "price": 19.9,
    "stock": 204,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 226.86
  },
  {
    "id": "coq-real-131",
    "code": "COQ-REAL-231",
    "description": "Fio Dental Colgate Menta 50m",
    "category": "Higiene",
    "brand": "Colgate",
    "unit": "Cx c/ 12",
    "price": 8.9,
    "stock": 249,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 101.46
  },
  {
    "id": "coq-real-132",
    "code": "COQ-REAL-232",
    "description": "Enxaguante Bucal Colgate Plax Menta 250ml",
    "category": "Higiene",
    "brand": "Colgate",
    "unit": "Cx c/ 6",
    "price": 12.9,
    "stock": 79,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 73.53
  },
  {
    "id": "coq-real-133",
    "code": "COQ-REAL-233",
    "description": "Papel Higiênico Neve Folha Dupla Leve 4 Pague 3",
    "category": "Higiene",
    "brand": "Neve",
    "unit": "Cx c/ 16",
    "price": 7.5,
    "stock": 164,
    "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 16,
    "packagePrice": 114
  },
  {
    "id": "coq-real-134",
    "code": "COQ-REAL-234",
    "description": "Hastes Flexíveis Cotonetes Johnson's Caixa 75un",
    "category": "Higiene",
    "brand": "Johnson's",
    "unit": "Cx c/ 24",
    "price": 3.9,
    "stock": 65,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 88.92
  },
  {
    "id": "coq-real-135",
    "code": "COQ-REAL-235",
    "description": "Absorvente Sempre Livre Adapt Especial Com Abas 8un",
    "category": "Higiene",
    "brand": "Sempre Livre",
    "unit": "Cx c/ 16",
    "price": 5.5,
    "stock": 64,
    "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 16,
    "packagePrice": 83.6
  },
  {
    "id": "coq-real-136",
    "code": "COQ-REAL-236",
    "description": "Protetor Diário Carefree Original Sem Perfume 15un",
    "category": "Higiene",
    "brand": "Carefree",
    "unit": "Cx c/ 24",
    "price": 4.8,
    "stock": 55,
    "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 24,
    "packagePrice": 109.44
  },
  {
    "id": "coq-real-137",
    "code": "COQ-REAL-237",
    "description": "Sabonete Líquido Protex Nutri Protect Refil 220ml",
    "category": "Higiene",
    "brand": "Protex",
    "unit": "Cx c/ 12",
    "price": 8.5,
    "stock": 215,
    "imageUrl": "https://images.unsplash.com/photo-1607006342411-9a910c64b6c8?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 96.9
  },
  {
    "id": "coq-real-138",
    "code": "COQ-REAL-238",
    "description": "Aparelho de Barbear Prestobarba 3 Gillette Blister 2un",
    "category": "Higiene",
    "brand": "Gillette",
    "unit": "Cx c/ 12",
    "price": 9.9,
    "stock": 165,
    "imageUrl": "https://images.unsplash.com/photo-1501250987900-211872d97eaa?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 112.86
  },
  {
    "id": "coq-real-139",
    "code": "COQ-REAL-239",
    "description": "Creme de Pentear Seda Ceramidas Pote 300ml",
    "category": "Higiene",
    "brand": "Seda",
    "unit": "Cx c/ 12",
    "price": 9.8,
    "stock": 227,
    "imageUrl": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 12,
    "packagePrice": 111.72
  },
  {
    "id": "coq-real-140",
    "code": "COQ-REAL-240",
    "description": "Enxaguante Bucal Listerine Cool Mint Frasco 250ml",
    "category": "Higiene",
    "brand": "Listerine",
    "unit": "Cx c/ 6",
    "price": 14.9,
    "stock": 157,
    "imageUrl": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=80",
    "companyId": "coqueiro",
    "packageItems": 6,
    "packagePrice": 84.93
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
  // Clear and force update se o novo "clubbi" tenant não estiver presente
  const existingCompanies = localStorage.getItem("facilitadora_companies");
  if (existingCompanies && !JSON.parse(existingCompanies)["clubbi"]) {
    localStorage.removeItem("facilitadora_companies");
    localStorage.removeItem("facilitadora_users");
    localStorage.removeItem("facilitadora_products");
  }
  // Force update only if new Coqueiro products are missing
  const existingProducts = localStorage.getItem("facilitadora_products");
  if (existingProducts && !existingProducts.includes("COQ-REAL-101")) {
    localStorage.removeItem("facilitadora_products");
  }

  // Force update only if new CLUBB user is missing
  const existingUsers = localStorage.getItem("facilitadora_users");
  if (existingUsers && !existingUsers.includes("CLUBB")) {
    localStorage.removeItem("facilitadora_users");
  }

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

// Firebase cloud sync helpers
const getFirebaseUrl = () => {
  const url = localStorage.getItem("firebase_db_url") || "https://coqueiro-a586e-default-rtdb.firebaseio.com";
  if (!url) return null;
  return url.trim().replace(/\/+$/, "");
};

const syncToCloud = async (key, data) => {
  const baseUrl = getFirebaseUrl();
  if (!baseUrl) return;
  try {
    await fetch(`${baseUrl}/${key}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error(`Error syncing ${key} to Firebase:`, e);
  }
};

export const syncFromCloud = async () => {
  const baseUrl = getFirebaseUrl();
  if (!baseUrl) return;
  try {
    const keys = ["companies", "users", "products", "orders"];
    for (const key of keys) {
      const res = await fetch(`${baseUrl}/${key}.json`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          let processedData = data;
          if (key === "products") {
            processedData = sanitizeProductsList(data);
            // Sync sanitized products back to cloud to fix them permanently
            await syncToCloud("products", processedData);
          }
          localStorage.setItem(`facilitadora_${key}`, JSON.stringify(processedData));
        } else {
          // Seed Firebase with local data if Firebase is empty
          const localData = localStorage.getItem(`facilitadora_${key}`);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (parsed) {
                await syncToCloud(key, parsed);
              }
            } catch(e) {}
          }
        }
      }
    }
  } catch (e) {
    console.error("Error fetching from Firebase:", e);
  }
};

// Companies Methods
export const getCompanies = () => {
  initDb();
  return JSON.parse(localStorage.getItem("facilitadora_companies"));
};

export const saveCompanies = (companies) => {
  localStorage.setItem("facilitadora_companies", JSON.stringify(companies));
  syncToCloud("companies", companies);
};

// Users Methods
export const getUsers = () => {
  initDb();
  return JSON.parse(localStorage.getItem("facilitadora_users"));
};

export const saveUsers = (users) => {
  localStorage.setItem("facilitadora_users", JSON.stringify(users));
  syncToCloud("users", users);
};

// Products Methods
export const getProducts = (companyId = null) => {
  initDb();
  let all = JSON.parse(localStorage.getItem("facilitadora_products"));
  if (!Array.isArray(all)) return [];
  all = sanitizeProductsList(all);
  if (!companyId) return all.filter(Boolean);
  return all.filter(p => p && p.companyId === companyId);
};

export const saveProducts = (products) => {
  const sanitized = sanitizeProductsList(products);
  localStorage.setItem("facilitadora_products", JSON.stringify(sanitized));
  syncToCloud("products", sanitized);
};

// Orders Methods
export const getOrders = (companyId = null) => {
  initDb();
  const all = JSON.parse(localStorage.getItem("facilitadora_orders"));
  if (!Array.isArray(all)) return [];
  if (!companyId) return all.filter(Boolean);
  return all.filter(o => o && o.companyId === companyId);
};

export const saveOrders = (orders) => {
  localStorage.setItem("facilitadora_orders", JSON.stringify(orders));
  syncToCloud("orders", orders);
};

// Fallback image maps and sanitization helper
const CATEGORY_FALLBACK_IMAGES = {
  "Bebidas": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=60",
  "Mercearia": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60",
  "Biscoitos": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Limpeza": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Higiene": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=60",
  "Laticínios": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60",
  "Derivados de Leite": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60",
  "Hortifruti": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=80",
  "Preparo de Sobremesas": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=60",
  "Massas Secas": "https://images.unsplash.com/photo-1621961401348-f099ce688b4a?w=300&auto=format&fit=crop&q=60",
  "Frios": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=60"
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60";

const itemImageMap = {
  "Refrigerante 2L": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=60",
  "Cerveja Pilsen Lata 350ml": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&auto=format&fit=crop&q=60",
  "Água Mineral Sem Gás 500ml": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&auto=format&fit=crop&q=60",
  "Suco Integral 1L": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&auto=format&fit=crop&q=60",
  "Energético 250ml": "https://images.unsplash.com/photo-1622543953490-0b70039a2be1?w=300&auto=format&fit=crop&q=60",
  "Água Tônica Lata 350ml": "https://images.unsplash.com/photo-1598615367916-24e0f111f17e?w=300&auto=format&fit=crop&q=60",
  "Cerveja Puro Malte 600ml": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&auto=format&fit=crop&q=60",
  "Refrigerante Lata 350ml": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=60",
  "Isotônico Laranja 500ml": "https://images.unsplash.com/photo-1571156137591-3e8c47e15622?w=300&auto=format&fit=crop&q=60",
  "Chá Gelado Pêssego 1.5L": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&auto=format&fit=crop&q=60",
  "Arroz Tipo 1 5kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60",
  "Feijão Carioca 1kg": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=300&auto=format&fit=crop&q=60",
  "Óleo de Soja 900ml": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60",
  "Azeite Extra Virgem 500ml": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60",
  "Macarrão Espaguete 500g": "https://images.unsplash.com/photo-1621961401348-f099ce688b4a?w=300&auto=format&fit=crop&q=60",
  "Farinha de Trigo 1kg": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=60",
  "Açúcar Refinado 1kg": "https://images.unsplash.com/photo-1600854483722-1d572718e24c?w=300&auto=format&fit=crop&q=60",
  "Café Torrado e Moído 500g": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=60",
  "Molho de Tomate 340g": "https://images.unsplash.com/photo-1607301408269-ac1702167d68?w=300&auto=format&fit=crop&q=60",
  "Sal Refinado 1kg": "https://images.unsplash.com/photo-1600854483722-1d572718e24c?w=300&auto=format&fit=crop&q=60",
  "Milho para Pipoca 500g": "https://images.unsplash.com/photo-1578271851222-4022766062a1?w=300&auto=format&fit=crop&q=60",
  "Leite Condensado 395g": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=60",
  "Creme de Leite 200g": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=60",
  "Extrato de Tomate 140g": "https://images.unsplash.com/photo-1607301408269-ac1702167d68?w=300&auto=format&fit=crop&q=60",
  "Biscoito Recheado Chocolate 140g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Biscoito Água e Sal 200g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Cookies Tradicional 100g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Wafer Chocolate 120g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Torrada Tradicional 160g": "https://images.unsplash.com/photo-1600431521340-491eca880813?w=300&auto=format&fit=crop&q=60",
  "Biscoito Maizena 400g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Biscoito de Polvilho 100g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Biscoito Amanteigado 300g": "https://images.unsplash.com/photo-1558961309-db6f1ca3eb82?w=300&auto=format&fit=crop&q=60",
  "Bolo Sabor Laranja 250g": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=60",
  "Sabão em Pó 1kg": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Detergente Líquido Neutro 500ml": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Amaciante 2L": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&auto=format&fit=crop&q=60",
  "Limpador Multiuso 500ml": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Água Sanitária 2L": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=60",
  "Esponja de Aço 8un": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=60",
  "Esponja Dupla Face 4un": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=60",
  "Desinfetante Pinho 1L": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Sabão em Barra 5un": "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop&q=60",
  "Saco para Lixo 50L 30un": "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=300&auto=format&fit=crop&q=60",
  "Creme Dental Menta 90g": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=60",
  "Sabonete em Barra 90g": "https://images.unsplash.com/photo-1607006342411-9a910c64b6c8?w=300&auto=format&fit=crop&q=60",
  "Desodorante Aerosol 150ml": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=60",
  "Shampoo Cabelos Normais 350ml": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=60",
  "Condicionador 350ml": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=60",
  "Fio Dental 50m": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=60",
  "Enxaguante Bucal 500ml": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=60",
  "Absorvente com Abas 8un": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=60",
  "Haste Flexível 75un": "https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=300&auto=format&fit=crop&q=60",
  "Papel Higiênico Folha Dupla 4un": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&auto=format&fit=crop&q=60",
  "Leite UHT Integral 1L": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60",
  "Leite UHT Desnatado 1L": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60",
  "Iogurte Morango 900g": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&auto=format&fit=crop&q=60",
  "Bebida Láctea Achocolatada 200ml": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60",
  "Manteiga Extra com Sal 200g": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&auto=format&fit=crop&q=60",
  "Requeijão Tradicional 200g": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&auto=format&fit=crop&q=60",
  "Queijo Parmesão Ralado 50g": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&auto=format&fit=crop&q=60",
  "Creme de Queijo Minas 200g": "https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=300&auto=format&fit=crop&q=60"
};

export const sanitizeProductsList = (productsList) => {
  if (!Array.isArray(productsList)) return [];
  return productsList.map(p => {
    if (!p) return p;
    const hasPlaceholder = !p.imageUrl || 
                           p.imageUrl.trim() === '' || 
                           p.imageUrl.includes('placehold.co') || 
                           p.imageUrl.includes('placeholder');
    if (hasPlaceholder) {
      let foundUrl = null;
      for (const [key, url] of Object.entries(itemImageMap)) {
        if (p.description.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(p.description.toLowerCase())) {
          foundUrl = url;
          break;
        }
      }
      if (!foundUrl) {
        foundUrl = CATEGORY_FALLBACK_IMAGES[p.category] || DEFAULT_FALLBACK_IMAGE;
      }
      return { ...p, imageUrl: foundUrl };
    }
    return p;
  });
};
