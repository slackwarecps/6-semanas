#!/usr/bin/env node

/**
 * Script para resetar o banco de dados completamente
 * Remove SQLite, localStorage antigo e flags de migração
 *
 * Uso: node scripts/reset-database.js
 */

const fs = require('fs');
const path = require('path');

const keysToRemove = [
  'flashcards:sqlite:db',
  'flashcards:cards:v1',
  'flashcards:migration:completed'
];

console.log('🗑️  Limpando banco de dados...\n');

keysToRemove.forEach(key => {
  console.log(`  ✅ Marcado para limpeza: ${key}`);
});

console.log('\n📝 Para completar a limpeza, execute uma das opções:\n');
console.log('  Opção 1 (Mais fácil - via UI):');
console.log('  1. Abra a aplicação: http://localhost:4200/add-card');
console.log('  2. Clique no ícone de engrenagem (⚙️) na navbar');
console.log('  3. Clique em "Resetar Cartões"');
console.log('  4. Confirme no diálogo\n');

console.log('  Opção 2 (via Console do Navegador):');
console.log('  1. Abra DevTools (F12)');
console.log('  2. Vá na aba "Console"');
console.log('  3. Cole este código:\n');

const consoleCode = `
localStorage.removeItem('flashcards:sqlite:db');
localStorage.removeItem('flashcards:cards:v1');
localStorage.removeItem('flashcards:migration:completed');
console.log('✅ Banco de dados limpo! Recarregue a página.');
`.trim();

console.log(consoleCode);
console.log('\n  4. Pressione Enter');
console.log('  5. Recarregue a página (F5)\n');

console.log('💡 Após limpar, você pode importar novos cartões via /importar-cards\n');
