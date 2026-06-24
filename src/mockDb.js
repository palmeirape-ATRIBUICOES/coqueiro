// Mock database using localStorage for the Clubbi SaaS clone
const INITIAL_PRODUCTS = [
  {
    "id": "9171",
    "ean": "7896024760357",
    "description": "Biscoito Recheado Chocolate Piraquê Pacote 160g",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2.96,
    "packagePrice": 85.5,
    "packageQtd": 30,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024760357",
    "stock": 149381
  },
  {
    "id": "2733",
    "ean": "7892840808020",
    "description": "Isotônico Gatorade Pet Laranja 500ml",
    "category": "Sucos E Refrescos",
    "categorySlug": "sucos-e-refrescos",
    "parentCategory": "Bebidas Não Alcoólicas",
    "price": 0,
    "packagePrice": 29.1,
    "packageQtd": 6,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7892840808020",
    "stock": 1923
  },
  {
    "id": "2734",
    "ean": "7892840808037",
    "description": "Isotonico Gatorade Limao Pet 500ml",
    "category": "Sucos E Refrescos",
    "categorySlug": "sucos-e-refrescos",
    "parentCategory": "Bebidas Não Alcoólicas",
    "price": 0,
    "packagePrice": 29.1,
    "packageQtd": 6,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7892840808037",
    "stock": 2488
  },
  {
    "id": "9440",
    "ean": "7896071024839",
    "description": "BISCOITO CHOCOLATE RECHEIO CHOCOLATE TODDY PACOTE 100G",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2,
    "packagePrice": 84.59,
    "packageQtd": 44,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896071024839",
    "stock": 198
  },
  {
    "id": "104351",
    "ean": "7891000432402",
    "description": "Composto Lácteo Ninho Forti+ Lata 380g\n",
    "category": "Derivados de Leite",
    "categorySlug": "derivados-de-leite",
    "parentCategory": "Laticínios",
    "price": 15.55,
    "packagePrice": 358.8,
    "packageQtd": 24,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891000432402",
    "stock": 2620
  },
  {
    "id": "2491",
    "ean": "7891910000197",
    "description": "Açúcar Refinado União 1kg",
    "category": "Açúcar e Adoçante",
    "categorySlug": "acucar-e-adocante",
    "parentCategory": "Mercearia",
    "price": 0,
    "packagePrice": 45.9,
    "packageQtd": 10,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891910000197",
    "stock": 3859
  },
  {
    "id": "97694",
    "ean": "7896024761651",
    "description": "Biscoito Maizena Piraquê Pacote 175g",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2.96,
    "packagePrice": 136.8,
    "packageQtd": 48,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024761651",
    "stock": 334555
  },
  {
    "id": "33941",
    "ean": "7891095031115",
    "description": "Batata Palha Tradicional Yoki Sachê 105g",
    "category": "Aperitivos e Salgadinhos",
    "categorySlug": "aperitivos-e-salgadinhos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 6.1,
    "packagePrice": 117.21,
    "packageQtd": 20,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891095031115",
    "stock": 8449
  },
  {
    "id": "3778",
    "ean": "7896028014494",
    "description": "Leite De Coco Menina 200ml",
    "category": "Preparo de Sobremesas",
    "categorySlug": "preparo-de-sobremesas",
    "parentCategory": "Mercearia",
    "price": 2.24,
    "packagePrice": 51.6,
    "packageQtd": 24,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896028014494",
    "stock": 14611
  },
  {
    "id": "93879",
    "ean": "7891152801521",
    "description": "BISCOITO CREAM CRACKER MANTEIGA RICHESTER SUPERIORE PACOTE 350G",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 4.98,
    "packagePrice": 114.96,
    "packageQtd": 24,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891152801521",
    "stock": 29611
  },
  {
    "id": "95440",
    "ean": "7896004007632",
    "description": "Cereal Matinal Sucrilhos Kellogg's Original Pacote 110g\n\n",
    "category": "Aveias e Cereais",
    "categorySlug": "aveias-e-cereais",
    "parentCategory": "Mercearia",
    "price": 4.23,
    "packagePrice": 81.37,
    "packageQtd": 20,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896004007632",
    "stock": 1580
  },
  {
    "id": "99468",
    "ean": "7896071030007",
    "description": "Biscoito Rosquinha Coco Mabel Pacote 300g\n",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 4.05,
    "packagePrice": 124.48,
    "packageQtd": 32,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896071030007",
    "stock": 3755
  },
  {
    "id": "3742",
    "ean": "7896024760371",
    "description": "Biscoito Recheado Limão Piraquê Pacote 160g",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2.96,
    "packagePrice": 85.5,
    "packageQtd": 30,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024760371",
    "stock": 69426
  },
  {
    "id": "9172",
    "ean": "7896024760364",
    "description": "Biscoito Recheado Morango Piraquê Pacote 160g",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2.96,
    "packagePrice": 85.5,
    "packageQtd": 30,
    "supplierName": "Clubbi Box Regiao 1",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024760364",
    "stock": 77769
  },
  {
    "id": "99429",
    "ean": "7896024761439",
    "description": "Biscoito Leite Maltado Original Piraquê Pacote 132g",
    "category": "Biscoitos",
    "categorySlug": "biscoitos",
    "parentCategory": "Biscoitos, Salgadinhos e Doces",
    "price": 2.8,
    "packagePrice": 134.5,
    "packageQtd": 50,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7896024761439",
    "stock": 149973
  },
  {
    "id": "6144",
    "ean": "7898080640222",
    "description": "Creme De Leite Leve Italac Tetra Pack 200g",
    "category": "Derivados de Leite",
    "categorySlug": "derivados-de-leite",
    "parentCategory": "Laticínios",
    "price": 2.65,
    "packagePrice": 61.2,
    "packageQtd": 24,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7898080640222",
    "stock": 4234
  },
  {
    "id": "1398",
    "ean": "7891079000229",
    "description": "Macarrão Instantâneo Galinha Caipira Nissin Miojo Lámen Pacote 85g",
    "category": "Massas Secas",
    "categorySlug": "massas-secas",
    "parentCategory": "Mercearia",
    "price": 2.24,
    "packagePrice": 107.5,
    "packageQtd": 50,
    "supplierName": "Estoque Clubbi Tijuca",
    "imageUrl": "https://res.cloudinary.com/dti85ldyv/image/upload/c_scale,h_120/f_png/b_white,c_limit,d_product-thumb_ybwmng.png/products/7891079000229",
    "stock": 26802
  }
];

const INITIAL_MERCHANTS = {
  "WDPHP": {
    code: "WDPHP",
    name: "Mercadinho do Thiago (WDPHP)",
    email: "thiago@mercadinhowdphp.com.br",
    phone: "(11) 98888-7777",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    minOrder: 300,
    creditLimit: 1500,
    paymentTerms: ["Pix à Vista", "Boleto 7 dias", "Boleto 14 dias"]
  },
  "TEST1": {
    code: "TEST1",
    name: "Mercearia Silva",
    email: "silva@merceariasilva.com",
    phone: "(21) 97777-6666",
    address: "Rua São Clemente, 300 - Botafogo, Rio de Janeiro - RJ",
    minOrder: 250,
    creditLimit: 1000,
    paymentTerms: ["Pix à Vista", "Dinheiro na Entrega"]
  }
};

const INITIAL_WHITELABELS = {
  "coqueiro": {
    id: "coqueiro",
    name: "Casa Coqueiro",
    title: "Casa Coqueiro - Abasteça sua Loja",
    logoText: "Casa Coqueiro",
    logoColor: "#059669",
    logoType: "image",
    logoUrl: "https://casacoqueiro.com.br/wp-content/uploads/2023/11/dddd-1.png",
    primaryColor: "#059669",
    secondaryColor: "#eab308",
    accentColor: "#ef4444",
    banners: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80"
    ],
    showInstaPay: true
  },
  "clubbi": {
    id: "clubbi",
    name: "Clubbi Original",
    title: "Clubbi - Abasteça sua Loja",
    logoText: "clubbi",
    logoColor: "#0062ff",
    logoType: "text", // "text" or "image"
    primaryColor: "#0062ff",
    secondaryColor: "#00c853",
    accentColor: "#ff3d00",
    banners: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80"
    ],
    showInstaPay: true
  },
  "verde": {
    id: "verde",
    name: "SuperMercado Verde",
    title: "AbastShop - Distribuidora Hortifruti",
    logoText: "AbastVerde",
    logoColor: "#2e7d32",
    logoType: "text",
    primaryColor: "#2e7d32",
    secondaryColor: "#81c784",
    accentColor: "#f57c00",
    banners: [
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop&q=80"
    ],
    showInstaPay: false
  },
  "gold": {
    id: "gold",
    name: "Distribuidora Gold",
    title: "Premium Gold B2B",
    logoText: "GoldDist",
    logoColor: "#c5a059",
    logoType: "text",
    primaryColor: "#c5a059",
    secondaryColor: "#1a1a1a",
    accentColor: "#e6b800",
    banners: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1200&auto=format&fit=crop&q=80"
    ],
    showInstaPay: true
  }
};

const INITIAL_ORDERS = [
  {
    id: "ORD-9823",
    merchantCode: "WDPHP",
    merchantName: "Mercadinho do Thiago (WDPHP)",
    date: "2026-06-20T10:15:30Z",
    items: [
      { id: "9171", description: "Biscoito Recheado Chocolate Piraquê Pacote 160g", qty: 2, price: 2.96, packageQtd: 30, packagePrice: 85.50, isBox: true }
    ],
    total: 171.00,
    paymentTerm: "Boleto 7 dias",
    status: "Delivered"
  }
];

export const initDb = () => {
  if (!localStorage.getItem("clubbi_products")) {
    localStorage.setItem("clubbi_products", JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem("clubbi_merchants")) {
    localStorage.setItem("clubbi_merchants", JSON.stringify(INITIAL_MERCHANTS));
  }
  if (!localStorage.getItem("clubbi_whitelabels")) {
    localStorage.setItem("clubbi_whitelabels", JSON.stringify(INITIAL_WHITELABELS));
  }
  if (!localStorage.getItem("clubbi_orders")) {
    localStorage.setItem("clubbi_orders", JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem("clubbi_active_whitelabel")) {
    localStorage.setItem("clubbi_active_whitelabel", "coqueiro");
  }
};

export const getProducts = () => {
  initDb();
  return JSON.parse(localStorage.getItem("clubbi_products"));
};

export const saveProducts = (products) => {
  localStorage.setItem("clubbi_products", JSON.stringify(products));
};

export const getMerchants = () => {
  initDb();
  return JSON.parse(localStorage.getItem("clubbi_merchants"));
};

export const saveMerchants = (merchants) => {
  localStorage.setItem("clubbi_merchants", JSON.stringify(merchants));
};

export const getWhitelabels = () => {
  initDb();
  return JSON.parse(localStorage.getItem("clubbi_whitelabels"));
};

export const saveWhitelabels = (whitelabels) => {
  localStorage.setItem("clubbi_whitelabels", JSON.stringify(whitelabels));
};

export const getOrders = () => {
  initDb();
  return JSON.parse(localStorage.getItem("clubbi_orders"));
};

export const saveOrders = (orders) => {
  localStorage.setItem("clubbi_orders", JSON.stringify(orders));
};

export const getActiveWhitelabelId = () => {
  initDb();
  return localStorage.getItem("clubbi_active_whitelabel") || "clubbi";
};

export const setActiveWhitelabelId = (id) => {
  localStorage.setItem("clubbi_active_whitelabel", id);
};
