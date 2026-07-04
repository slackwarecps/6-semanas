/**
 * Script para limpar o banco de dados completamente
 * Uso: node clear-database.js
 */

const fs = require('fs');
const path = require('path');

// Simular localStorage
const localStorageFile = path.join(__dirname, '.localStorage.json');

// Chaves a remover
const keysToRemove = [
  'flashcards:sqlite:db',
  'flashcards:cards:v1',
  'flashcards:migration:completed'
];

try {
  // Tentar ler arquivo de localStorage se existir
  let data = {};
  if (fs.existsSync(localStorageFile)) {
    const content = fs.readFileSync(localStorageFile, 'utf8');
    data = JSON.parse(content);
  }

  // Remover chaves
  keysToRemove.forEach(key => {
    if (data[key]) {
      delete data[key];
      console.log(`✅ Removido: ${key}`);
    }
  });

  // Salvar arquivo atualizado
  fs.writeFileSync(localStorageFile, JSON.stringify(data, null, 2));
  console.log('\n🗑️  Banco de dados limpo com sucesso!');
  console.log('   Pronto para importar novos cartões.\n');
} catch (error) {
  console.error('❌ Erro ao limpar banco:', error.message);
  process.exit(1);
}
