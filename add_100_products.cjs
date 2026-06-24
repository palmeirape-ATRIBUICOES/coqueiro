const fs = require('fs');
const path = require('path');

const mockDbPath = path.join(__dirname, 'src', 'mockDb.js');
let mockDbContent = fs.readFileSync(mockDbPath, 'utf8');

// Generate 100 mock products
const brands = ["Nestlé", "Ambev", "Coca-Cola", "Pepsico", "Unilever", "Mondelez", "Danone", "BRF", "Bauducco", "Yoki"];
const categories = ["Bebidas", "Mercearia", "Laticínios", "Frios", "Biscoitos", "Limpeza", "Higiene"];

const mockProducts = [];
for (let i = 1; i <= 100; i++) {
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const price = (Math.random() * 50 + 2).toFixed(2);
  const packageItems = [12, 24, 30, 48, 50][Math.floor(Math.random() * 5)];
  const packagePrice = (price * packageItems * 0.95).toFixed(2); // 5% discount for bulk
  
  mockProducts.push(`  {
    id: "clubbi-mock-${i}",
    code: "CLB-MOCK-${i}",
    description: "Produto de Teste ${i} ${brand} ${category}",
    category: "${category}",
    brand: "${brand}",
    unit: "Cx c/ ${packageItems}",
    price: ${price},
    stock: ${Math.floor(Math.random() * 200 + 50)},
    imageUrl: "https://placehold.co/300x300?text=Produto+${i}",
    companyId: "clubbi",
    packageItems: ${packageItems},
    packagePrice: ${packagePrice}
  }`);
}

const productsString = mockProducts.join(',\n');

// Find the end of INITIAL_PRODUCTS array
const insertMarker = '];\n\nconst INITIAL_ORDERS';
if (mockDbContent.includes(insertMarker)) {
  mockDbContent = mockDbContent.replace(
    insertMarker, 
    ',\n' + productsString + '\n' + insertMarker
  );
  
  // Also bump the localstorage version check to force update
  const initDbReplace = `export const initDb = () => {
  // Clear and force update se o novo "clubbi" tenant não estiver presente
  const existingCompanies = localStorage.getItem("facilitadora_companies");
  if (existingCompanies && !JSON.parse(existingCompanies)["clubbi"]) {
    localStorage.removeItem("facilitadora_companies");
    localStorage.removeItem("facilitadora_users");
    localStorage.removeItem("facilitadora_products");
  }
  // FORCE UPDATE for 100 products
  localStorage.removeItem("facilitadora_products");`;
  
  mockDbContent = mockDbContent.replace(
    `export const initDb = () => {\n  // Clear and force update if the new "clubbi" tenant is not present\n  const existingCompanies = localStorage.getItem("facilitadora_companies");\n  if (existingCompanies && !JSON.parse(existingCompanies)["clubbi"]) {\n    localStorage.removeItem("facilitadora_companies");\n    localStorage.removeItem("facilitadora_users");\n    localStorage.removeItem("facilitadora_products");\n  }`,
    initDbReplace
  );

  fs.writeFileSync(mockDbPath, mockDbContent, 'utf8');
  console.log('Added 100 mock products successfully!');
} else {
  console.error('Could not find insert marker for products.');
}
