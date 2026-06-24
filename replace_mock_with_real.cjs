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
  
  // Format image text for placehold (encode uri)
  const imageText = encodeURIComponent(item.n.split(' ').slice(0, 2).join(' '));
  const bg = category === 'Bebidas' ? '0284c7' : category === 'Mercearia' ? 'ea580c' : category === 'Higiene' ? '0891b2' : '475569';
  const imageUrl = `https://placehold.co/300x300/${bg}/ffffff?text=${imageText}`;

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
