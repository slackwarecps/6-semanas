const fs = require('fs');
const path = require('path');

// Lê a pasta /flashcards
const flashcardsDir = path.join(__dirname, 'flashcards');
const publicFlashcardsDir = path.join(__dirname, 'public', 'flashcards');

try {
  // Lista todos os arquivos .md
  const files = fs.readdirSync(flashcardsDir)
    .filter(file => file.endsWith('.md'))
    .sort();

  console.log(`✅ Encontrados ${files.length} arquivos Markdown`);

  // Cria o index.json
  const index = { files };
  const indexPath = path.join(publicFlashcardsDir, 'index.json');

  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log(`📝 Índice atualizado: ${indexPath}`);
  console.log(`📊 Total de flashcards: ${files.length}`);
} catch (err) {
  console.error('❌ Erro ao gerar índice:', err);
  process.exit(1);
}
