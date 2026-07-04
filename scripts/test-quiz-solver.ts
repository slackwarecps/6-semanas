import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AnthropicQuizSolver } from '../src/app/infrastructure/ai/anthropic.quiz-solver';
import { MarkdownParserService } from '../src/app/features/import-cards/data/services/markdown-parser.service';

async function main(): Promise<void> {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    console.error(
      '❌ ANTHROPIC_API_KEY não definida.\n' +
      '   Copie .env.example para .env e preencha a chave.'
    );
    process.exit(1);
  }

  const model = process.env['ANTHROPIC_MODEL'];

  const flashcardPath = resolve(
    process.cwd(),
    'public/flashcards/001-Otimizar custos CI-CD com Claude.md'
  );

  console.log('📖 Carregando flashcard de teste...');
  const fileContent = readFileSync(flashcardPath, 'utf-8');

  const parser = new MarkdownParserService();
  const [card] = parser.parseMarkdownFile(fileContent, flashcardPath);

  if (!card) {
    console.error('❌ Falha ao parsear o flashcard de teste.');
    process.exit(1);
  }

  console.log('\n--- Pergunta enviada ao modelo ---');
  console.log(card.question);
  console.log('----------------------------------\n');

  console.log('🤖 Consultando modelo...');
  const solver = new AnthropicQuizSolver({ apiKey, model });
  const answer = await solver.solve(card.question);

  console.log('\n✅ Resposta estruturada do modelo:');
  console.log(JSON.stringify(answer, null, 2));
}

main().catch((err) => {
  console.error('❌ Erro ao executar o teste:', err);
  process.exit(1);
});
