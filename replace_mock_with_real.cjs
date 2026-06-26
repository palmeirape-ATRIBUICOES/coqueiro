const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src', 'mockDb.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');

const categories = {
  "Bebidas": {
    brands: ["Coca-Cola", "Ambev", "Heineken", "Pepsi", "Red Bull", "Del Valle"],
    items: [
      { n: "Refrigerante 2L", p: 9.50, pkg: 6 },
      { n: "Cerveja Pilsen Lata 350ml", p: 3.20, pkg: 12 },
      { n: "Água Mineral Sem Gás 500ml", p: 1.50, pkg: 12 },
      { n: "Suco Integral 1L", p: 12.90, pkg: 6 },
      { n: "Energético 250ml", p: 8.50, pkg: 6 },
      { n: "Água Tônica Lata 350ml", p: 3.80, pkg: 6 },
      { n: "Cerveja Puro Malte 600ml", p: 8.90, pkg: 24 },
      { n: "Refrigerante Lata 350ml", p: 4.00, pkg: 12 },
      { n: "Isotônico Laranja 500ml", p: 5.50, pkg: 6 },
      { n: "Chá Gelado Pêssego 1.5L", p: 7.90, pkg: 6 }
    ]
  },
  "Mercearia": {
    brands: ["Camil", "Tio João", "Gallo", "Soya", "Fugini", "Knorr", "Yoki"],
    items: [
      { n: "Arroz Tipo 1 5kg", p: 26.90, pkg: 6 },
      { n: "Feijão Carioca 1kg", p: 7.50, pkg: 10 },
      { n: "Óleo de Soja 900ml", p: 6.20, pkg: 20 },
      { n: "Azeite Extra Virgem 500ml", p: 32.90, pkg: 6 },
      { n: "Macarrão Espaguete 500g", p: 4.50, pkg: 20 },
      { n: "Farinha de Trigo 1kg", p: 5.80, pkg: 10 },
      { n: "Açúcar Refinado 1kg", p: 4.20, pkg: 10 },
      { n: "Café Torrado e Moído 500g", p: 16.90, pkg: 10 },
      { n: "Molho de Tomate 340g", p: 2.10, pkg: 24 },
      { n: "Sal Refinado 1kg", p: 2.50, pkg: 30 },
      { n: "Milho para Pipoca 500g", p: 4.90, pkg: 10 },
      { n: "Leite Condensado 395g", p: 6.50, pkg: 24 },
      { n: "Creme de Leite 200g", p: 3.90, pkg: 24 },
      { n: "Extrato de Tomate 140g", p: 2.80, pkg: 24 }
    ]
  },
  "Biscoitos": {
    brands: ["Bauducco", "Nestlé", "Piraquê", "Marilan", "Oreo", "Mabel"],
    items: [
      { n: "Biscoito Recheado Chocolate 140g", p: 3.50, pkg: 30 },
      { n: "Biscoito Água e Sal 200g", p: 4.20, pkg: 20 },
      { n: "Cookies Tradicional 100g", p: 5.90, pkg: 24 },
      { n: "Wafer Chocolate 120g", p: 3.10, pkg: 30 },
      { n: "Torrada Tradicional 160g", p: 4.80, pkg: 20 },
      { n: "Biscoito Maizena 400g", p: 6.50, pkg: 20 },
      { n: "Biscoito de Polvilho 100g", p: 3.90, pkg: 24 },
      { n: "Biscoito Amanteigado 300g", p: 8.50, pkg: 12 },
      { n: "Bolo Sabor Laranja 250g", p: 7.90, pkg: 14 }
    ]
  },
  "Limpeza": {
    brands: ["Omo", "Ypê", "Veja", "Brilhante", "Bom Bril", "Limpol"],
    items: [
      { n: "Sabão em Pó 1kg", p: 14.90, pkg: 12 },
      { n: "Detergente Líquido Neutro 500ml", p: 2.30, pkg: 24 },
      { n: "Amaciante 2L", p: 11.50, pkg: 6 },
      { n: "Limpador Multiuso 500ml", p: 4.80, pkg: 12 },
      { n: "Água Sanitária 2L", p: 5.20, pkg: 6 },
      { n: "Esponja de Aço 8un", p: 3.50, pkg: 14 },
      { n: "Esponja Dupla Face 4un", p: 6.90, pkg: 10 },
      { n: "Desinfetante Pinho 1L", p: 7.20, pkg: 12 },
      { n: "Sabão em Barra 5un", p: 9.80, pkg: 10 },
      { n: "Saco para Lixo 50L 30un", p: 12.90, pkg: 10 }
    ]
  },
  "Higiene": {
    brands: ["Colgate", "Oral-B", "Dove", "Rexona", "Seda", "Pantene"],
    items: [
      { n: "Creme Dental Menta 90g", p: 4.50, pkg: 12 },
      { n: "Sabonete em Barra 90g", p: 2.80, pkg: 24 },
      { n: "Desodorante Aerosol 150ml", p: 15.90, pkg: 12 },
      { n: "Shampoo Cabelos Normais 350ml", p: 18.50, pkg: 12 },
      { n: "Condicionador 350ml", p: 19.90, pkg: 12 },
      { n: "Fio Dental 50m", p: 8.90, pkg: 12 },
      { n: "Enxaguante Bucal 500ml", p: 22.90, pkg: 6 },
      { n: "Absorvente com Abas 8un", p: 5.50, pkg: 16 },
      { n: "Haste Flexível 75un", p: 3.90, pkg: 24 },
      { n: "Papel Higiênico Folha Dupla 4un", p: 7.50, pkg: 16 }
    ]
  },
  "Laticínios": {
    brands: ["Itambé", "Batavo", "Danone", "Nestlé", "Elegê", "Piracanjuba"],
    items: [
      { n: "Leite UHT Integral 1L", p: 4.90, pkg: 12 },
      { n: "Leite UHT Desnatado 1L", p: 4.90, pkg: 12 },
      { n: "Iogurte Morango 900g", p: 11.50, pkg: 6 },
      { n: "Bebida Láctea Achocolatada 200ml", p: 2.20, pkg: 27 },
      { n: "Manteiga Extra com Sal 200g", p: 12.90, pkg: 12 },
      { n: "Requeijão Tradicional 200g", p: 8.90, pkg: 24 },
      { n: "Queijo Parmesão Ralado 50g", p: 5.50, pkg: 20 },
      { n: "Creme de Queijo Minas 200g", p: 7.90, pkg: 12 }
    ]
  }
};

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

let realProducts = [];
let idCounter = 1;

for (let i = 0; i < 100; i++) {
  const catKeys = Object.keys(categories);
  const category = catKeys[Math.floor(Math.random() * catKeys.length)];
  const catData = categories[category];
  
  const item = catData.items[Math.floor(Math.random() * catData.items.length)];
  const brand = catData.brands[Math.floor(Math.random() * catData.brands.length)];
  
  // Create a slight price variance to make them look distinct
  const variance = 1 + (Math.random() * 0.1 - 0.05); // +/- 5%
  const price = (item.p * variance).toFixed(2);
  const packageItems = item.pkg;
  const packagePrice = (price * packageItems * 0.95).toFixed(2); // 5% bulk discount
  
  const imageUrl = itemImageMap[item.n] || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=60`;

  realProducts.push(`  {
    id: "clubbi-real-${idCounter}",
    code: "CLB-REAL-${idCounter}",
    description: "${item.n} ${brand}",
    category: "${category}",
    brand: "${brand}",
    unit: "Cx c/ ${packageItems}",
    price: ${price},
    stock: ${Math.floor(Math.random() * 200 + 50)},
    imageUrl: "${imageUrl}",
    companyId: "clubbi",
    packageItems: ${packageItems},
    packagePrice: ${packagePrice}
  }`);

  realProducts.push(`  {
    id: "coq-real-${idCounter}",
    code: "COQ-REAL-${idCounter}",
    description: "${item.n} ${brand}",
    category: "${category}",
    brand: "${brand}",
    unit: "Cx c/ ${packageItems}",
    price: ${price},
    stock: ${Math.floor(Math.random() * 200 + 50)},
    imageUrl: "${imageUrl}",
    companyId: "coqueiro",
    packageItems: ${packageItems},
    packagePrice: ${packagePrice}
  }`);
  idCounter++;
}

// Read the mockDb and replace the old mock products
// We'll regex all objects where id: "clubbi-mock-X"
const regex = /\s*{\s*id:\s*"clubbi-mock-\d+"[\s\S]*?packagePrice:\s*\d+\.\d+\s*},?/g;
let newDbContent = dbContent.replace(regex, '');

// Since replacing removed them, we now append the realProducts right before ]; at the end of INITIAL_PRODUCTS
const realProductsStr = realProducts.join(',\n');
newDbContent = newDbContent.replace(/\];\r?\n\r?\nconst INITIAL_ORDERS/, ',\n' + realProductsStr + '\n];\n\nconst INITIAL_ORDERS');

// Clean up any double commas
newDbContent = newDbContent.replace(/,,/g, ',');

fs.writeFileSync(dbPath, newDbContent, 'utf8');
console.log('Replaced mock products with 100 REAL products!');
