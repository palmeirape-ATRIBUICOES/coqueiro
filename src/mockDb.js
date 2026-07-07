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
    "id": "coq-prod_absorvente",
    "code": "COQ-PROD_ABSORVENTE",
    "description": "ABSORVENTE",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7,
    "stock": 100,
    "imageUrl": "https://www.callfarma.com.br/_next/image?url=https%3A%2F%2Fd2lakedouw4zad.cloudfront.net%2Fabs-intimus-gel-tripla-prot-sabas-suave-74236.png&w=384&q=75",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7
  },
  {
    "id": "coq-prod_acucar",
    "code": "COQ-PROD_ACUCAR",
    "description": "AÇÚCAR",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5xOnMLx_DZG3y7_DLQZXLe6xQxiS7KX2LeQ&s",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_adocante_100_ml",
    "code": "COQ-PROD_ADOCANTE_100_ML",
    "description": "ADOÇANTE 100 ML",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://tudooffice.com.br/wp-content/uploads/2025/08/adocante-adocyl-500ml.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_agua_sanitaria",
    "code": "COQ-PROD_AGUA_SANITARIA",
    "description": "AGUA SANITÁRIA",
    "category": "Bebidas",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.5,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1413049/agua_sanitaria_verde_2l_sanol_1_20251029151842_0d2ba16d9bb9.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.5
  },
  {
    "id": "coq-prod_arroz",
    "code": "COQ-PROD_ARROZ",
    "description": "ARROZ",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://assets.instabuy.app.br/ib.item.image.large/l-99faae90cf72469c9b296186ee3dc5d8.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_aveia_150g",
    "code": "COQ-PROD_AVEIA_150G",
    "description": "AVEIA 150G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://phygital-files.mercafacil.com/estrelaquatis/uploads/produto/aveia_em_flocos_finos_naturale_170gr_b9501f4b-73ca-46bf-885d-3fe7959d04da.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_azeite_gallo_250",
    "code": "COQ-PROD_AZEITE_GALLO_250",
    "description": "AZEITE GALLO 250",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 29,
    "stock": 100,
    "imageUrl": "https://m.media-amazon.com/images/I/61L9yLfothL._AC_SY679_.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 29
  },
  {
    "id": "coq-prod_azeitona_80g",
    "code": "COQ-PROD_AZEITONA_80G",
    "description": "AZEITONA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://zonasul.vtexassets.com/arquivos/ids/3657569/VF4qT-qqCUAAAAAAAAb2tw.jpg?v=638591146916400000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_azeitona_340g",
    "code": "COQ-PROD_AZEITONA_340G",
    "description": "AZEITONA  340G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "https://fortali.agilecdn.com.br/29707_1.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_baconzitos",
    "code": "COQ-PROD_BACONZITOS",
    "description": "BACONZITOS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://paguemenos.vtexassets.com/arquivos/ids/877188/salgadinho-chips-baconzitos-classicos-pacote-42g-principal.png?v=638524405422430000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_batata_lay_s",
    "code": "COQ-PROD_BATATA_LAY_S",
    "description": "BATATA LAY'S",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7,
    "stock": 100,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbsjyqcaf4DzXTeeDCQqOr1gBONQN7UeSj2w&s",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7
  },
  {
    "id": "coq-prod_batata_palha_105g",
    "code": "COQ-PROD_BATATA_PALHA_105G",
    "description": "BATATA PALHA 105G",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9,
    "stock": 100,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYuqCJSFoWo-xZYmXUk0e8edK6OG4omvLzUQ&s",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9
  },
  {
    "id": "coq-prod_batata_palha_70g",
    "code": "COQ-PROD_BATATA_PALHA_70G",
    "description": "BATATA PALHA 70G",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_batata_ruffles",
    "code": "COQ-PROD_BATATA_RUFFLES",
    "description": "BATATA RUFFLES",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://img.cdndsgni.com/preview/10001714.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_billyejack_200g",
    "code": "COQ-PROD_BILLYEJACK_200G",
    "description": "BILLY & JACK 200G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9,
    "stock": 100,
    "imageUrl": "https://destro.fbitsstatic.net/img/p/molho-kisabor-billy-jack-200g-80758/267313.jpg?w=500&h=500&v=202501231555&qs=ignore",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9
  },
  {
    "id": "coq-prod_biscoito_maisena",
    "code": "COQ-PROD_BISCOITO_MAISENA",
    "description": "BISCOITO MAISENA",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://piraque.com.br/wp-content/uploads/2020/11/7896024761651.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_biscoito_piraque_sabores",
    "code": "COQ-PROD_BISCOITO_PIRAQUE_SABORES",
    "description": "BISCOITO PIRAQUE SABORES",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.5
  },
  {
    "id": "coq-prod_biscoito_piraque_wafer",
    "code": "COQ-PROD_BISCOITO_PIRAQUE_WAFER",
    "description": "BISCOITO PIRAQUE WAFER",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://piraque.com.br/wp-content/uploads/2020/11/7896024760647-500x500.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_biscoito_skiny",
    "code": "COQ-PROD_BISCOITO_SKINY",
    "description": "BISCOITO SKINY",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "https://stoque.agilecdn.com.br/12831.png?v=37-1652079208",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_biscoito_trakinas",
    "code": "COQ-PROD_BISCOITO_TRAKINAS",
    "description": "TRAKINAS CHOCOLATE",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3.5,
    "stock": 100,
    "imageUrl": "https://www.paodeacucar.com/img/uploads/1/450/33042450.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3.5
  },
  {
    "id": "coq-prod_caixa_de_bombom",
    "code": "COQ-PROD_CAIXA_DE_BOMBOM",
    "description": "CAIXA DE BOMBOM - GAROTO",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/600x450/2481/2481975/produto/170844881/whatsapp-image-2026-02-27-at-08-03-02-bzis195zry.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17
  },
  {
    "id": "coq-prod_caixa_de_vela",
    "code": "COQ-PROD_CAIXA_DE_VELA",
    "description": "CAIXA DE VELA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://http2.mlstatic.com/D_NQ_NP_739765-MLB75973797332_052024-O.webp",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_caldo_kinor_unidade",
    "code": "COQ-PROD_CALDO_KINOR_UNIDADE",
    "description": "CALDO KINOR UNIDADE",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 2,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/673450/caldo_knorr_carne_57_gramas_3113_1_1883a3285177506d19b080bae69179b8.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 2
  },
  {
    "id": "coq-prod_canela_em_po_20g",
    "code": "COQ-PROD_CANELA_EM_PO_20G",
    "description": "CANELA EM PÓ 20G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://casacoqueiro.com.br/wp-content/uploads/2023/11/2040.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_canela_em_po_30g",
    "code": "COQ-PROD_CANELA_EM_PO_30G",
    "description": "CANELA EM PÓ 30G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/800x800/2555/2555531/produto/310101420/canela-em-p--30g---trisanti--3d--aq585izvfx.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_caninha_da_roca",
    "code": "COQ-PROD_CANINHA_DA_ROCA",
    "description": "CANINHA DA ROÇA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://carrefourbrfood.vtexassets.com/arquivos/ids/199617/7835752_1.jpg?v=637272444333100000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_carmed_250",
    "code": "COQ-PROD_CARMED_250",
    "description": "CARMED 250ml",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1306939/enxaguante_bucal_carmed_fini_dentadura_250ml_20079_1_74ecbe3ff653b0ee7ee6bbec38ccb2a3.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17
  },
  {
    "id": "coq-prod_casa_e_perfume",
    "code": "COQ-PROD_CASA_E_PERFUME",
    "description": "CASA E PERFUME",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://tfchgi.vteximg.com.br/arquivos/ids/169313-1000-1000/7896040704625.jpg?v=637781291900470000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_cereal_de_120g",
    "code": "COQ-PROD_CEREAL_DE_120G",
    "description": "SNOW FLAKES SACHE 120G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://www.sondadelivery.com.br/img.aspx/sku/1544641/530/7891000050880.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_cha_cx_16g",
    "code": "COQ-PROD_CHA_CX_16G",
    "description": "CHÁ LEÃO CX 16G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/600x1000/204/204167/produto/85938440/7891098000163_2d_1_-zjahqi.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_cheetos",
    "code": "COQ-PROD_CHEETOS",
    "description": "CHEETOS LUA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://du3hj28fogfli.cloudfront.net/Custom/Content/Products/55/74/55742_cheetos-lua-37g-p49671_m1_637840849960506219.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_chupeta",
    "code": "COQ-PROD_CHUPETA",
    "description": "CHUPETA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://img.freepik.com/vetores-premium/icone-de-chupeta-de-bebe-em-estilo-cartoon-sobre-um-fundo-branco_96318-14976.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_coco_flocos_100g",
    "code": "COQ-PROD_COCO_FLOCOS_100G",
    "description": "COCO FLOCOS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-f8f79c26ac7f40c8b336026704c407db.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_cola_tek_bond_2g",
    "code": "COQ-PROD_COLA_TEK_BOND_2G",
    "description": "COLA TEK BOND 2g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/694926/cola_tek_bond_instantanea_adesivo_2g_392331_1_d56b504c6442a24534f44f26e3b31832.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_cola_tek_bond_793",
    "code": "COQ-PROD_COLA_TEK_BOND_793",
    "description": "COLA TEK BOND 793",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10,
    "stock": 100,
    "imageUrl": "https://eletrobraz.com.br/wp-content/uploads/2020/04/tekbond-100g.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10
  },
  {
    "id": "coq-prod_creme_de_leite_200g",
    "code": "COQ-PROD_CREME_DE_LEITE_200G",
    "description": "CREME DE LEITE 200G",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.8,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/2500x2500/1896/1896128/produto/264616878/1-kzu5tx64xh.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.8
  },
  {
    "id": "coq-prod_crunch_cereal_120g",
    "code": "COQ-PROD_CRUNCH_CEREAL_120G",
    "description": "CRUNCH CEREAL 120G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://redemix.vteximg.com.br/arquivos/ids/214890-1000-1000/7891000255445---Cereal-Matinal-CRUNCH-120g---1.jpg?v=638363335910570000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_desodorante",
    "code": "COQ-PROD_DESODORANTE",
    "description": "DESODORANTE",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "https://cf.shopee.com.br/file/br-11134201-23010-ywbtf8t7b6lvc6",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_detergente",
    "code": "COQ-PROD_DETERGENTE",
    "description": "DETERGENTE BARRA",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "https://eficazjf.com.br/wp-content/uploads/2023/12/detergente-500-barra.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_diabo_verde",
    "code": "COQ-PROD_DIABO_VERDE",
    "description": "DIABO VERDE",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 15,
    "stock": 100,
    "imageUrl": "https://tdc01z.vteximg.com.br/arquivos/ids/158618-1000-1000/14989-limpa-forno-diabo-verde-250g.png?v=637897724379730000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 15
  },
  {
    "id": "coq-prod_doritos",
    "code": "COQ-PROD_DORITOS",
    "description": "DORITOS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://toppng.com/uploads/preview/doritos-png-11553951845nti4f3y2xd.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_ervilha_em_conserva",
    "code": "COQ-PROD_ERVILHA_EM_CONSERVA",
    "description": "ERVILHA EM LATA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-de8e8f8cf2054566a8495dd57c5701d3.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_esponja",
    "code": "COQ-PROD_ESPONJA",
    "description": "ESPONJA und",
    "category": "Limpeza",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 2,
    "stock": 100,
    "imageUrl": "https://img.freepik.com/fotos-gratis/esponja-de-cozinha-em-fundo-branco_58702-2390.jpg?semt=ais_hybrid",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 2
  },
  {
    "id": "coq-prod_fandangos",
    "code": "COQ-PROD_FANDANGOS",
    "description": "FANDANGOS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1306939/salgadinho_fandangos_presunto_35g_19039_1_ddcdc28366d63bb35cbae23207b56287.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_farinha_de_trigo_1kg",
    "code": "COQ-PROD_FARINHA_DE_TRIGO_1KG",
    "description": "FARINHA DE TRIGO 1KG",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-aac2e156680a461a8874bd718c93b047.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_farinha_de_trigo_1kg_com_fermento",
    "code": "COQ-PROD_FARINHA_DE_TRIGO_1KG_COM_FERMENTO",
    "description": "FARINHA DE TRIGO 1KG COM FERMENTO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0579/9742/6861/files/image-removebg-preview_1_f5617f09-f121-43c4-9e70-7a12f126baba.png?v=1705499858&width=480",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_farinha_lactea_360",
    "code": "COQ-PROD_FARINHA_LACTEA_360",
    "description": "FARINHA LACTEA LATA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 15,
    "stock": 100,
    "imageUrl": "https://tdc08h.vteximg.com.br/arquivos/ids/213924-600-600/Farinha-Lactea-Nestle-Lata-360g.jpg?v=638215774771830000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 15
  },
  {
    "id": "coq-prod_farofa_pronta_300g",
    "code": "COQ-PROD_FAROFA_PRONTA_300G",
    "description": "FAROFA PRONTA 300G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9.5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.big/b-00ad054116b9491387cb366485ad0d9d.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9.5
  },
  {
    "id": "coq-prod_feijao",
    "code": "COQ-PROD_FEIJAO",
    "description": "FEIJÃO 1KG",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://combrasil.com/wp-content/uploads/2024/06/Feijao-Preto-1kg-2024-3-768x768.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_fermento_em_po_100g",
    "code": "COQ-PROD_FERMENTO_EM_PO_100G",
    "description": "FERMENTO EM PÓ 100G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://destro.fbitsstatic.net/img/p/fermento-quimico-apti-em-po-100g-86876/273873.jpg?w=1000&h=1000&v=no-change&qs=ignore",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_ferrero_rocher",
    "code": "COQ-PROD_FERRERO_ROCHER",
    "description": "FERRERO ROCHER",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 27,
    "stock": 100,
    "imageUrl": "https://tezegw.vtexassets.com/arquivos/ids/473376/3275199.png?v=638947550195200000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 27
  },
  {
    "id": "coq-prod_filtro_de_papel",
    "code": "COQ-PROD_FILTRO_DE_PAPEL",
    "description": "FILTRO DE PAPEL 103",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.big/b-e6e78bf39a5742848dcc35a79285f56e.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_flocao_500g",
    "code": "COQ-PROD_FLOCAO_500G",
    "description": "FLOCÃO 500G YOKI",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "https://carrefourbrfood.vtexassets.com/arquivos/ids/193722507/7891095006878.png?v=638872367351300000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_fralda_peronal",
    "code": "COQ-PROD_FRALDA_PERONAL",
    "description": "FRALDA PERSONAL G",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 19.99,
    "stock": 100,
    "imageUrl": "https://a-static.mlcdn.com.br/undefinedxundefined/fralda-descartavel-personal-soft-protect-mega-tamanho-g-9-pacotes-com-34-tiras/efacil/206304/533e7581131e72458f721934311fd9ed.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 19.99
  },
  {
    "id": "coq-prod_fuba_1kg",
    "code": "COQ-PROD_FUBA_1KG",
    "description": "FUBÁ 1KG",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-8b5b5085773745658eda445a48c7ba03.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_gelatina_sabores",
    "code": "COQ-PROD_GELATINA_SABORES",
    "description": "GELATINA SABORES",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 2.5,
    "stock": 100,
    "imageUrl": "https://cf.shopee.com.br/file/a6f8eba83d882c9855a142bf383c8a91",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 2.5
  },
  {
    "id": "coq-prod_goiabada_300g",
    "code": "COQ-PROD_GOIABADA_300G",
    "description": "GOIABADA 300G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://multpelatacado.agilecdn.com.br/52106.jpg?v=258-1844515099",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_granulado_120g",
    "code": "COQ-PROD_GRANULADO_120G",
    "description": "GRANULADO 120G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://dori.com.br/wp-content/uploads/2022/09/Dori-Granulado-Chocolate-120g-9012106-1-596x1024.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_guardanapo",
    "code": "COQ-PROD_GUARDANAPO",
    "description": "GUARDANAPO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "https://www.sondadelivery.com.br/img.aspx/sku/1000053483/530/7896053440305-02.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_ketchup_400g",
    "code": "COQ-PROD_KETCHUP_400G",
    "description": "KETCHUP 400G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://destro.fbitsstatic.net/img/p/ketchup-tradicional-predilecta-squeeze-400g-79893/266448.jpg?w=1000&h=1000&v=202502071619&qs=ignore",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_lasanha",
    "code": "COQ-PROD_LASANHA",
    "description": "LASANHA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "https://wilso.agilecdn.com.br/11527_1.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_leite",
    "code": "COQ-PROD_LEITE",
    "description": "LEITE ITALAC/GLORIA",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7.5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-8167330c1d7d429887590032d73903ea.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-prod_leite_condensado_395g",
    "code": "COQ-PROD_LEITE_CONDENSADO_395G",
    "description": "LEITE CONDENSADO 395G",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7.5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-9777e8da631848798bc3df8e32926e15.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-prod_leite_de_coco_200ml",
    "code": "COQ-PROD_LEITE_DE_COCO_200ML",
    "description": "LEITE DE COCO 200ML",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://brasileiroonline.co.uk/wp-content/uploads/2021/03/Menina-Leite-de-Coco-200ml-1-1.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_leite_em_po_aurora",
    "code": "COQ-PROD_LEITE_EM_PO_AURORA",
    "description": "LEITE EM PÓ AURORA",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17,
    "stock": 100,
    "imageUrl": "https://tdc08h.vteximg.com.br/arquivos/ids/162720-600-600/1096585-leite-po-gloria-sch-400g-integral-g.jpg?v=637789716167400000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17
  },
  {
    "id": "coq-prod_leite_ninho_380g",
    "code": "COQ-PROD_LEITE_NINHO_380G",
    "description": "LEITE NINHO 380G",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 25,
    "stock": 100,
    "imageUrl": "https://carrefourbr.vtexassets.com/arquivos/ids/152066471/197ca79488834a64b1ae5fb3665c66c8.jpg?v=638526180453070000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 25
  },
  {
    "id": "coq-prod_macarrao_espaguete",
    "code": "COQ-PROD_MACARRAO_ESPAGUETE",
    "description": "MACARRÃO ESPAGUETE",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.big/b-8442e80f7b2d4a17aa695210cd621abb.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_macarrao_parafuso",
    "code": "COQ-PROD_MACARRAO_PARAFUSO",
    "description": "MACARRÃO PARAFUSO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5.5,
    "stock": 100,
    "imageUrl": "https://destro.fbitsstatic.net/img/p/macarrao-dona-benta-parafuso-semola-500g-87327/274324.jpg?w=1000&h=1000&v=202501231555&qs=ignore",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.5
  },
  {
    "id": "coq-prod_macarrao_pene",
    "code": "COQ-PROD_MACARRAO_PENE",
    "description": "MACARRÃO PENE",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5.5,
    "stock": 100,
    "imageUrl": "https://savegnagoio.vtexassets.com/arquivos/ids/429214-800-auto?v=638404941511770000&width=800&height=auto&aspect=true",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.5
  },
  {
    "id": "coq-prod_maionese_hellmann_s_500g",
    "code": "COQ-PROD_MAIONESE_HELLMANN_S_500G",
    "description": "MAIONESE HELLMANN'S 500G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_maionese_vigor_200",
    "code": "COQ-PROD_MAIONESE_VIGOR_200",
    "description": "MAIONESE VIGOR 200",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "https://mercantilnovaera.vtexassets.com/arquivos/ids/174987/Maionese-Vigor-Sache-200g.jpg?v=637459707742730000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_maizena_200g",
    "code": "COQ-PROD_MAIZENA_200G",
    "description": "MAIZENA 200G",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-prod_massa_de_bolo_400g",
    "code": "COQ-PROD_MASSA_DE_BOLO_400G",
    "description": "MASSA DE BOLO 400g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-prod_milho_verde_em_conserva",
    "code": "COQ-PROD_MILHO_VERDE_EM_CONSERVA",
    "description": "MILHO VERDE EM CONSERVA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_minister",
    "code": "COQ-PROD_MINISTER",
    "description": "MINISTER",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10
  },
  {
    "id": "coq-prod_miojo",
    "code": "COQ-PROD_MIOJO",
    "description": "MIOJO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3.5
  },
  {
    "id": "coq-prod_molho_de_alho",
    "code": "COQ-PROD_MOLHO_DE_ALHO",
    "description": "MOLHO DE ALHO",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_molho_de_tomate_300g",
    "code": "COQ-PROD_MOLHO_DE_TOMATE_300G",
    "description": "MOLHO DE TOMATE 300G",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_molho_pimenta_gota",
    "code": "COQ-PROD_MOLHO_PIMENTA_GOTA",
    "description": "MOLHO PIMENTA GOTA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_molho_shoyu",
    "code": "COQ-PROD_MOLHO_SHOYU",
    "description": "MOLHO SHOYU",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-prod_molho_tomate_pomarola",
    "code": "COQ-PROD_MOLHO_TOMATE_POMAROLA",
    "description": "MOLHO TOMATE POMAROLA",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_mostarda_180g",
    "code": "COQ-PROD_MOSTARDA_180G",
    "description": "MOSTARDA 180g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_mucilon_360",
    "code": "COQ-PROD_MUCILON_360",
    "description": "MUCILON arroz e aveia",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "https://d21wiczbqxib04.cloudfront.net/naCEqSQnyYsvKrk4S_MAQ0jenF0=/1600x0/smart/https://osuper-ecommerce-koch.s3.sa-east-1.amazonaws.com/e52600c1-CerealInfantilMucilonArrozeAveiaLeve600GPague550G_66575.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_nescau_200g",
    "code": "COQ-PROD_NESCAU_200G",
    "description": "Nescau 200g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9
  },
  {
    "id": "coq-prod_nescau_350g",
    "code": "COQ-PROD_NESCAU_350G",
    "description": "NESCAU 350g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_nutella_140g",
    "code": "COQ-PROD_NUTELLA_140G",
    "description": "NUTELLA 140G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 15,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 15
  },
  {
    "id": "coq-prod_oleo",
    "code": "COQ-PROD_OLEO",
    "description": "ÓLEO LIZA/SOYA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 11,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 11
  },
  {
    "id": "coq-prod_palito_de_churrasco",
    "code": "COQ-PROD_PALITO_DE_CHURRASCO",
    "description": "PALITO DE CHURRASCO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_palito_de_dente",
    "code": "COQ-PROD_PALITO_DE_DENTE",
    "description": "PALITO DE DENTE",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_papel_aluminio",
    "code": "COQ-PROD_PAPEL_ALUMINIO",
    "description": "PAPEL ALUMÍNIO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_papel_higienico",
    "code": "COQ-PROD_PAPEL_HIGIENICO",
    "description": "PAPEL HIGIÊNICO",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_pasta_de_dente",
    "code": "COQ-PROD_PASTA_DE_DENTE",
    "description": "PASTA DE DENTE",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_po_cafe_100",
    "code": "COQ-PROD_PO_CAFE_100",
    "description": "PÓ CAFÉ 100",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9.5
  },
  {
    "id": "coq-prod_po_cafe_250",
    "code": "COQ-PROD_PO_CAFE_250",
    "description": "PÓ CAFÉ 250",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 22.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 22.5
  },
  {
    "id": "coq-prod_po_de_cafe_500",
    "code": "COQ-PROD_PO_DE_CAFE_500",
    "description": "PÓ DE CAFÉ 500",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 41,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 41
  },
  {
    "id": "coq-prod_pratinho_descartavel",
    "code": "COQ-PROD_PRATINHO_DESCARTAVEL",
    "description": "PRATINHO DESCARTÁVEL",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_pringles_sabor_original_35g",
    "code": "COQ-PROD_PRINGLES_SABOR_ORIGINAL_35G",
    "description": "PRINGLES SABOR ORIGINAL 35g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_queijo_ralado_50g",
    "code": "COQ-PROD_QUEIJO_RALADO_50G",
    "description": "QUEIJO RALADO 50G",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-prod_raffaello",
    "code": "COQ-PROD_RAFFAELLO",
    "description": "RAFFAELLO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 27,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 27
  },
  {
    "id": "coq-prod_sabao_barra",
    "code": "COQ-PROD_SABAO_BARRA",
    "description": "SABÃO BARRA",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_sabao_pastoso_500g",
    "code": "COQ-PROD_SABAO_PASTOSO_500G",
    "description": "SABÃO PASTOSO 500G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9.5
  },
  {
    "id": "coq-prod_sabonete",
    "code": "COQ-PROD_SABONETE",
    "description": "SABONETE",
    "category": "Higiene",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_sal_fino",
    "code": "COQ-PROD_SAL_FINO",
    "description": "SAL FINO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_sal_grosso",
    "code": "COQ-PROD_SAL_GROSSO",
    "description": "SAL GROSSO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-prod_sal_grosso_temperado",
    "code": "COQ-PROD_SAL_GROSSO_TEMPERADO",
    "description": "SAL GROSSO TEMPERADO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_sardinha_lata",
    "code": "COQ-PROD_SARDINHA_LATA",
    "description": "SARDINHA LATA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7
  },
  {
    "id": "coq-prod_sensacoes",
    "code": "COQ-PROD_SENSACOES",
    "description": "SENSAÇÕES",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7
  },
  {
    "id": "coq-prod_soda_caustica_em_escamas",
    "code": "COQ-PROD_SODA_CAUSTICA_EM_ESCAMAS",
    "description": "SODA CÁUSTICA EM ESCAMAS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 15,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 15
  },
  {
    "id": "coq-prod_sopa_de_ervilha_400g",
    "code": "COQ-PROD_SOPA_DE_ERVILHA_400G",
    "description": "SOPA DE ERVILHA 400G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.5
  },
  {
    "id": "coq-prod_suco_tang",
    "code": "COQ-PROD_SUCO_TANG",
    "description": "SUCO TANG",
    "category": "Bebidas",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 2,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 2
  },
  {
    "id": "coq-prod_sucrilhos_cx_240",
    "code": "COQ-PROD_SUCRILHOS_CX_240",
    "description": "SUCRILHOS CX 240",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_tapioca_granulada_400g",
    "code": "COQ-PROD_TAPIOCA_GRANULADA_400G",
    "description": "TAPIOCA GRANULADA 400G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 7.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 7.5
  },
  {
    "id": "coq-prod_tixan_ype_400g",
    "code": "COQ-PROD_TIXAN_YPE_400G",
    "description": "TIXAN YPE 400G",
    "category": "Limpeza",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9
  },
  {
    "id": "coq-prod_toddy_200g",
    "code": "COQ-PROD_TODDY_200G",
    "description": "TODDY 200G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9
  },
  {
    "id": "coq-prod_toddy_370g",
    "code": "COQ-PROD_TODDY_370G",
    "description": "TODDY 370G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 11,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 11
  },
  {
    "id": "coq-prod_torcida",
    "code": "COQ-PROD_TORCIDA",
    "description": "TORCIDA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-prod_vassoura",
    "code": "COQ-PROD_VASSOURA",
    "description": "VASSOURA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10
  },
  {
    "id": "coq-prod_veja_gold",
    "code": "COQ-PROD_VEJA_GOLD",
    "description": "VEJA GOLD",
    "category": "Limpeza",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_vela_240g",
    "code": "COQ-PROD_VELA_240G",
    "description": "VELA 240G",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-prod_vela_estrelinha",
    "code": "COQ-PROD_VELA_ESTRELINHA",
    "description": "VELA ESTRELINHA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.5
  },
  {
    "id": "coq-prod_vela_vulcao",
    "code": "COQ-PROD_VELA_VULCAO",
    "description": "VELA VULCÃO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-prod_vinagre",
    "code": "COQ-PROD_VINAGRE",
    "description": "VINAGRE",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-p_mpd4xui6",
    "code": "COQ-P_MPD4XUI6",
    "description": "ACETONA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/500x500/2609/2609592/produto/220016528/acetona-80ml-v99dm73by7.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4
  },
  {
    "id": "coq-p_mpd5adlx",
    "code": "COQ-P_MPD5ADLX",
    "description": "AVEIA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://cereaisnaturale.com.br/adm/file_manager/imagens/novidades/lancamentos/aveias-170-thumbs/02-somos_aveia-flocos-semfundo.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-p_mpd7ccbb",
    "code": "COQ-P_MPD7CCBB",
    "description": "LAYS CLASSIC",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.99,
    "stock": 100,
    "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgPAiQxdGs03ptOKeoLNFJ3bEWPoDMJdVhew&s",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.99
  },
  {
    "id": "coq-p_mpd7lk0g",
    "code": "COQ-P_MPD7LK0G",
    "description": "TRAKINAS MORANGO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 0,
    "stock": 100,
    "imageUrl": "https://muffatosupermercados.vtexassets.com/arquivos/ids/386958-800-auto?v=638531852754300000&width=800&height=auto&aspect=true",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 0
  },
  {
    "id": "coq-p_mpd7nnif",
    "code": "COQ-P_MPD7NNIF",
    "description": "CAIXA DE BOMBOM - NESTLE",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/800x800/1030/1030675/produto/43581382/18acaea892.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17
  },
  {
    "id": "coq-p_mpd7nnts",
    "code": "COQ-P_MPD7NNTS",
    "description": "CAIXA DE BOMBOM - NESTLE",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17,
    "stock": 100,
    "imageUrl": "https://cdn.awsli.com.br/800x800/1030/1030675/produto/43581382/18acaea892.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17
  },
  {
    "id": "coq-p_mpd7pf7a",
    "code": "COQ-P_MPD7PF7A",
    "description": "CAIXA DE BOMBOM - LACTA",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 17.13,
    "stock": 100,
    "imageUrl": "https://hortifrutibr.vtexassets.com/arquivos/ids/158709/Caixa-De-Bombons-De-Chocolate-Sortidos-Favoritos-Lacta-2506g.png?v=638671093505300000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 17.13
  },
  {
    "id": "coq-p_mpe8qsml",
    "code": "COQ-P_MPE8QSML",
    "description": "Sardinha tomate",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-p_mpg80r3n",
    "code": "COQ-P_MPG80R3N",
    "description": "CHA LEÃO CX 16G",
    "category": "Bebidas",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5.97,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.large/l-1aaa56b7dae34447ad3d5281e78b4bea.jpeg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5.97
  },
  {
    "id": "coq-p_mpg828dz",
    "code": "COQ-P_MPG828DZ",
    "description": "CHEETOS MIX",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.99,
    "stock": 100,
    "imageUrl": "https://ibassets.com.br/ib.item.image.big/b-5af35a7e49194d8aa633c5c8913746d3.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.99
  },
  {
    "id": "coq-p_mpg8dv2i",
    "code": "COQ-P_MPG8DV2I",
    "description": "FANDANGOS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://brazilianstyle.com.au/cdn/shop/files/FANCHEE140_1200x1200.png?v=1707951863",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-p_mpg9flx7",
    "code": "COQ-P_MPG9FLX7",
    "description": "FILTRO DE PAPEL 102",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 5,
    "stock": 100,
    "imageUrl": "https://tb0932.vtexassets.com/arquivos/ids/162664/114810.png?v=637705336713100000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 5
  },
  {
    "id": "coq-p_mpo1dnqq",
    "code": "COQ-P_MPO1DNQQ",
    "description": "GRANULADO 120g",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6.5,
    "stock": 100,
    "imageUrl": "https://cdn.sistemawbuy.com.br/arquivos/bf7f0e0b3af5b13655fe6d09511cd080/produtos/6501a1b2b2859/granu-678e2e52ed5da.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6.5
  },
  {
    "id": "coq-p_mpo1gdt5",
    "code": "COQ-P_MPO1GDT5",
    "description": "LEITE DE COCO YUKA 500ml",
    "category": "Laticínios",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 6,
    "stock": 100,
    "imageUrl": "https://mercantilnovaera.vteximg.com.br/arquivos/ids/202978-1000-1000/Leite-de-Coco-FREDAO-Garrafa-500ml.jpg?v=638046410145400000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 6
  },
  {
    "id": "coq-p_mpo1jw82",
    "code": "COQ-P_MPO1JW82",
    "description": "MUCILON MULTICEREAIS",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12,
    "stock": 100,
    "imageUrl": "https://dmvfarma.vtexassets.com/arquivos/ids/269141/7891000356890-CerealInfantilMucilonMulticereais360g-1.jpg?v=638786794195500000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12
  },
  {
    "id": "coq-p_mpo1wngb",
    "code": "COQ-P_MPO1WNGB",
    "description": "AZEITONA SEM CAROÇO vale fertil",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8,
    "stock": 100,
    "imageUrl": "https://apoioentrega.vteximg.com.br/arquivos/ids/1877471-1000-1000/177113_0.png?v=638931040328100000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8
  },
  {
    "id": "coq-p_mpo41hlv",
    "code": "COQ-P_MPO41HLV",
    "description": "ÁGUA OXIGENADA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 3,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1147605/agua_oxigenada_cremosa_marcia_30_volumes_70ml_82062_1_77d4488f1b1e468dca9c5b899df11d9b.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 3
  },
  {
    "id": "coq-p_mqwu331a",
    "code": "COQ-P_MQWU331A",
    "description": "PAO FRANCES",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 0.65,
    "stock": 100,
    "imageUrl": "https://cdn.2rscms.com.br/imgcache/5054/uploads/5054/layout/Linha%20Gold%20Paes/pao-frances-12h.png.webp",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 0.65
  },
  {
    "id": "coq-p_h8vmidc",
    "code": "COQ-P_H8VMIDC",
    "description": "PT 1,020KG PE DE MOCA RAPANUI",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 24.49,
    "stock": 100,
    "imageUrl": "https://dcdn-us.mitiendanube.com/stores/001/342/555/products/04-261041d3174fa70f5117792016277744-480-0.webp",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 24.49
  },
  {
    "id": "coq-p_9wl92tq",
    "code": "COQ-P_9WL92TQ",
    "description": "B 500G MT YOGURT SORTIDO BERBAU",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 9.07,
    "stock": 100,
    "imageUrl": "https://supernova.vteximg.com.br/arquivos/ids/165723-1000-1000/Bala-Berbau-Yogurte-Sortida-500g-1-.jpg?v=638599431819130000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 9.07
  },
  {
    "id": "coq-p_322wvm1",
    "code": "COQ-P_322WVM1",
    "description": "PCT 440G C.MEGABALL HALLOWEEN S",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 13.97,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/sg-11134201-7rdyc-m1inhqyxnb1j85",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 13.97
  },
  {
    "id": "coq-p_0xdaly0",
    "code": "COQ-P_0XDALY0",
    "description": "PCT 440G C.MEGABALL SUKEST",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 13.97,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/987957/chiclete_bola_megaball_sortido_440g_sukest_1705571_1_699b8e42d1663c012cb729fa5bd73dab.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 13.97
  },
  {
    "id": "coq-p_1e6r8e0",
    "code": "COQ-P_1E6R8E0",
    "description": "PCT 440G C.MEGABALL SUKEST",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 13.97,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/987957/chiclete_bola_megaball_sortido_440g_sukest_1705571_1_699b8e42d1663c012cb729fa5bd73dab.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 13.97
  },
  {
    "id": "coq-p_x2e09dd",
    "code": "COQ-P_X2E09DD",
    "description": "DP 800G BANANADA PL CAMPISTA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 23.07,
    "stock": 100,
    "imageUrl": "https://loja.bananadacampista.com.br/wp-content/uploads/2022/05/MARIOLA-CRISTALIZADA-800G--1024x1024.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 23.07
  },
  {
    "id": "coq-p_qxl0ru6",
    "code": "COQ-P_QXL0RU6",
    "description": "DP 800G BANANADA PL CAMPISTA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 23.07,
    "stock": 100,
    "imageUrl": "https://loja.bananadacampista.com.br/wp-content/uploads/2022/05/MARIOLA-CRISTALIZADA-800G--1024x1024.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 23.07
  },
  {
    "id": "coq-p_5s67dih",
    "code": "COQ-P_5S67DIH",
    "description": "DP 201G CLISS MENTA FLORESTAL",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10.47,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/sg-11134201-7rbkw-m62zsmaluxef40",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10.47
  },
  {
    "id": "coq-p_knd97p3",
    "code": "COQ-P_KND97P3",
    "description": "DP 201G CLISS MELANCIA FLORESTAL",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10.47,
    "stock": 100,
    "imageUrl": "https://http2.mlstatic.com/D_NQ_NP_919998-MLB72806964667_112023-O-chiclete-cliss-cartela-melancia-florestal-201g-1cx-c-12un.webp",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10.47
  },
  {
    "id": "coq-p_vvqo5x4",
    "code": "COQ-P_VVQO5X4",
    "description": "DP 201G CLISS HORTELA FLORESTAL",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10.47,
    "stock": 100,
    "imageUrl": "https://png.pngtree.com/png-clipart/20231018/original/pngtree-mint-isolated-on-whitebackground-plant-photo-png-image_13352336.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10.47
  },
  {
    "id": "coq-p_jidjua0",
    "code": "COQ-P_JIDJUA0",
    "description": "DP 201G CLISS CANELA FLORESTAL",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 10.47,
    "stock": 100,
    "imageUrl": "https://riovermelho.agilecdn.com.br/90676.jpg?v=271-2407982494",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 10.47
  },
  {
    "id": "coq-p_aog4hq4",
    "code": "COQ-P_AOG4HQ4",
    "description": "DP 24X15G DIPLOKO HOT DOG TF DANILLA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 51.77,
    "stock": 100,
    "imageUrl": "https://marcosuldistribuidora.com.br/wp-content/uploads/2025/03/7543a.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 51.77
  },
  {
    "id": "coq-p_jbkybat",
    "code": "COQ-P_JBKYBAT",
    "description": "PCT 500G PIR POP GUM CHERRY CER SIM",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12.57,
    "stock": 100,
    "imageUrl": "https://imgprd.martinsatacado.com.br/catalogoimg/288894/01_288894_01.jpg?v=180920225324;ims=1000x",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12.57
  },
  {
    "id": "coq-p_kfxdf6n",
    "code": "COQ-P_KFXDF6N",
    "description": "PCT 500G PIR POP GUM CHERRY CER SIM",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 12.57,
    "stock": 100,
    "imageUrl": "https://imgprd.martinsatacado.com.br/catalogoimg/288894/01_288894_01.jpg?v=180920225324;ims=1000x",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 12.57
  },
  {
    "id": "coq-p_3ua8lxa",
    "code": "COQ-P_3UA8LXA",
    "description": "CHUP DOCE DE LEITE 1,5KG ROSSETTO",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 35.67,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/sg-11134201-7rdxa-m1hdawvyin6132",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 35.67
  },
  {
    "id": "coq-p_4d2b780",
    "code": "COQ-P_4D2B780",
    "description": "CHUP DOCE DE LEITE 1,5KG ROSSETTO",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 35.67,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/sg-11134201-7rdxa-m1hdawvyin6132",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 35.67
  },
  {
    "id": "coq-p_e3r9vzk",
    "code": "COQ-P_E3R9VZK",
    "description": "DP 15X6,5G DOCTOR SLIME SAB DANILLA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 22.37,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/808210/cartela_de_chicletes_daniclets_10_5g_35unidades_danilla_62080007_1_6bc2508e478de8c4a44205168755de36.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 22.37
  },
  {
    "id": "coq-p_uwkvauw",
    "code": "COQ-P_UWKVAUW",
    "description": "DP 15X6G CANETA MAGICA SAB DANILLA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 22.37,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1424002/caneta_mgica_de_ponta_dupla_marcador_e_destaque_1_20260106222354_2e8888e71289.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 22.37
  },
  {
    "id": "coq-p_13svrwq",
    "code": "COQ-P_13SVRWQ",
    "description": "WF TRENTO 375G MASSIMO CHOC PECCIN",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 40.57,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/br-11134207-81z1k-mfliof55jabpc2",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 40.57
  },
  {
    "id": "coq-p_z4pxvnn",
    "code": "COQ-P_Z4PXVNN",
    "description": "DP 24X16G CROC-CHOC PISTACHE JAZAM",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 18.87,
    "stock": 100,
    "imageUrl": "https://down-br.img.susercontent.com/file/br-11134207-820md-mml516qan3lw6c",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 18.87
  },
  {
    "id": "coq-p_wwxe0n0",
    "code": "COQ-P_WWXE0N0",
    "description": "DP 24X15G DIPLOKO PIZZA TF DANILLA",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 51.77,
    "stock": 100,
    "imageUrl": "https://cdn.sistemawbuy.com.br/arquivos/bf7f0e0b3af5b13655fe6d09511cd080/produtos/679b7f4dd30b3/4-679b972582a51.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 51.77
  },
  {
    "id": "coq-p_xuq7rpl",
    "code": "COQ-P_XUQ7RPL",
    "description": "CH BLONG TUTTI FRUIT 200G PECCIN",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.09,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1321271/chicle_blong_tutti_frutti_peccin_200g_1023_3_2cf6eff7edbf70b1b0978174cc4739e1.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.09
  },
  {
    "id": "coq-p_5fog9as",
    "code": "COQ-P_5FOG9AS",
    "description": "CH BLONG BLUE 200G PECCIN",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.09,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1321271/chicle_blong_blue_peccin_200g_1053_3_4625aaf880c69bf89d24c05ad4215ed6.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.09
  },
  {
    "id": "coq-p_tbkuh85",
    "code": "COQ-P_TBKUH85",
    "description": "K.OVO 2X20G LUI/MENINOS FERRERO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 19.57,
    "stock": 100,
    "imageUrl": "https://docesvaz.vtexassets.com/arquivos/ids/166914/Sem%20titulo.png.png?v=638762741382900000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 19.57
  },
  {
    "id": "coq-p_j1lovrg",
    "code": "COQ-P_J1LOVRG",
    "description": "K.OVO 2X20G LUI/MENINOS FERRERO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 19.57,
    "stock": 100,
    "imageUrl": "https://docesvaz.vtexassets.com/arquivos/ids/166914/Sem%20titulo.png.png?v=638762741382900000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 19.57
  },
  {
    "id": "coq-p_8xku4tc",
    "code": "COQ-P_8XKU4TC",
    "description": "CH BLONG ENERGY 200G PECCIN",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 8.09,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1176430/90_chicle_blong_200g_recheado_energy_24_peccin_8339_2_1d6ad99f879b79022d13e26163cd83d4.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 8.09
  },
  {
    "id": "coq-p_msw8ddh",
    "code": "COQ-P_MSW8DDH",
    "description": "DP 24X15,5G TORTUGUITA MORANGO ARCOR",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 35.67,
    "stock": 100,
    "imageUrl": "https://images.tcdn.com.br/img/img_prod/1375436/tortuguita_chocolate_leite_c_morango_24x15_5g_arcor_2105_1_55a3df52c6524cb86511af2d1dbdbd43.jpg",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 35.67
  },
  {
    "id": "coq-p_qu4j6k3",
    "code": "COQ-P_QU4J6K3",
    "description": "DP 24X15,5G TORTUGUITA AO LT ARCOR",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 35.67,
    "stock": 100,
    "imageUrl": "https://atacadonafi.com.br/image/cache/catalog/produtos/1_3188001_267-1080x1440.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 35.67
  },
  {
    "id": "coq-p_d90nn1d",
    "code": "COQ-P_D90NN1D",
    "description": "DP 15X10G DIPLOKO NEON ALIEN DAN",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 29.37,
    "stock": 100,
    "imageUrl": "https://cdn.sistemawbuy.com.br/arquivos/bf7f0e0b3af5b13655fe6d09511cd080/produtos/641c684757590/diploko-alien-66db2d2d50102.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 29.37
  },
  {
    "id": "coq-p_0w1vitx",
    "code": "COQ-P_0W1VITX",
    "description": "TICTAC 14X14,5G FRUTA TE GUSTA F",
    "category": "Hortifruti",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 41.97,
    "stock": 100,
    "imageUrl": "https://carrefourbrfood.vtexassets.com/arquivos/ids/213177487/6995675_1.jpg?v=639081503820500000",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 41.97
  },
  {
    "id": "coq-p_r2f79hq",
    "code": "COQ-P_R2F79HQ",
    "description": "DP 24X18G DANCLETES DINO OVINHO DAN",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 27.27,
    "stock": 100,
    "imageUrl": "https://eucomprodireto.com.br/wp-content/uploads/2025/02/15309533142-brinclets-ovo-dino.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 27.27
  },
  {
    "id": "coq-p_uuaecql",
    "code": "COQ-P_UUAECQL",
    "description": "PT 1,020KG PE DE MOCA RAPANUI",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 24.49,
    "stock": 100,
    "imageUrl": "https://dcdn-us.mitiendanube.com/stores/001/342/555/products/04-261041d3174fa70f5117792016277744-480-0.webp",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 24.49
  },
  {
    "id": "coq-p_psqsc74",
    "code": "COQ-P_PSQSC74",
    "description": "TICTAC 14X14,5G MENTA FERRERO",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 41.97,
    "stock": 100,
    "imageUrl": "https://www.tictac.com/br/static/b098166bf2fe6621b97f1e5035144c0c/menta_packshot_br.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 41.97
  },
  {
    "id": "coq-p_oaig853",
    "code": "COQ-P_OAIG853",
    "description": "CHOC 80G DIAMANTE NEGRO LACTA",
    "category": "Biscoitos",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 11.45,
    "stock": 100,
    "imageUrl": "https://d1jgmae0hcnr1i.cloudfront.net/Custom/Content/Products/16/26/162676_lacta-chocolate-80g-diamante-negro-p140475_z1_638321202911105690.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 11.45
  },
  {
    "id": "coq-p_j3x3j6x",
    "code": "COQ-P_J3X3J6X",
    "description": "UN 26G MOGUL 360 URSO SAB ARCOR",
    "category": "Mercearia",
    "brand": "Sem descrição",
    "unit": "un",
    "price": 4.45,
    "stock": 100,
    "imageUrl": "https://www.arcor.com.br/wp-content/uploads/2026/03/Ursinhos-26g.png",
    "companyId": "coqueiro",
    "packageItems": 1,
    "packagePrice": 4.45
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
    localStorage.removeItem("facilitadora_companies");
  }
  // Force update only if new Coqueiro products are missing or old categories are active
  const existingProducts = localStorage.getItem("facilitadora_products");
  if (existingProducts && (!existingProducts.includes("coq-prod_agua_sanitaria") || !existingProducts.includes("Higiene"))) {
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
