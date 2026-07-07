#!/bin/bash
# Script de deploy e inicialização local para Casa Coqueiro PWA / SaaS

echo "📦 Instalando dependências..."
npm install

echo "🛠️ Compilando o projeto para produção..."
npm run build

echo "🚀 Pronto! O build foi gerado no diretório 'dist'."
echo "Para rodar em ambiente local de desenvolvimento, utilize: npm run dev"
