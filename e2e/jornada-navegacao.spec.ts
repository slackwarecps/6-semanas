import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe.serial('Jornada de Aprendizado - Tela do Desafio', () => {
  const jornadaId = '4678eaf6-d785-4629-828e-5336d1a2ca7c';

  test.beforeAll(async () => {
    // Garante que a jornada de teste está desbloqueada no banco de dados do backend
    try {
      execSync(
        `sqlite3 backend/database.sqlite "INSERT OR REPLACE INTO jornada_progresso (user_id, jornadaId, status, currentQuestionIndex, currentErrors, currentLives) VALUES ('fabao', '${jornadaId}', 'unlocked', 0, 0, 3);"`
      );
      console.log(`[E2E Setup] Progresso da jornada ${jornadaId} definido como unlocked no SQLite.`);
    } catch (err) {
      console.error('[E2E Setup] Erro ao preparar banco de dados:', err);
    }
  });

  test.afterAll(async () => {
    // Limpa o registro criado para manter o banco limpo após os testes
    try {
      execSync(
        `sqlite3 backend/database.sqlite "DELETE FROM jornada_progresso WHERE user_id='fabao' AND jornadaId='${jornadaId}';"`
      );
      console.log(`[E2E Cleanup] Registro de progresso da jornada ${jornadaId} removido do SQLite.`);
    } catch (err) {
      console.error('[E2E Cleanup] Erro ao limpar banco de dados:', err);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Captura logs do console do navegador
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser Error] ${err.message}`));

    // Navega para a URL da jornada específica
    await page.goto(`/learn/jornada/${jornadaId}`);
    
    // Aguarda o loading sumir
    await expect(page.locator('.loading-state')).not.toBeVisible();
  });

  test('Deve funcionar a navegação entre as 30 perguntas usando os botões inferiores', async ({ page }) => {
    // Localiza o badge indicando o progresso da pergunta (ex: "Card 1/30")
    const progressBadge = page.locator('.badge-fase');
    await expect(progressBadge).toBeVisible();
    await expect(progressBadge).toContainText('Card 1/30');

    // Localiza os 4 botões de navegação no rodapé
    const btnFirst = page.locator('.feedback-navigator button').nth(0); // ⏮
    const btnPrev = page.locator('.feedback-navigator button').nth(1);  // ◀
    const btnNext = page.locator('.feedback-navigator button').nth(2);  // ▶
    const btnLast = page.locator('.feedback-navigator button').nth(3);  // ⏭

    // --- 1. ESTADO INICIAL (Card 1) ---
    await expect(btnFirst).toBeDisabled();
    await expect(btnPrev).toBeDisabled();
    await expect(btnNext).toBeEnabled();
    await expect(btnLast).toBeEnabled();

    // --- 2. IR PARA ÚLTIMA PERGUNTA (⏭) ---
    await btnLast.click();
    await expect(progressBadge).toContainText('Card 30/30');
    await expect(btnFirst).toBeEnabled();
    await expect(btnPrev).toBeEnabled();
    await expect(btnNext).toBeDisabled();
    await expect(btnLast).toBeDisabled();

    // --- 3. RETORNAR UMA PERGUNTA (◀) ---
    await btnPrev.click();
    await expect(progressBadge).toContainText('Card 29/30');
    await expect(btnFirst).toBeEnabled();
    await expect(btnPrev).toBeEnabled();
    await expect(btnNext).toBeEnabled();
    await expect(btnLast).toBeEnabled();

    // --- 4. RETORNAR À PRIMEIRA PERGUNTA (⏮) ---
    await btnFirst.click();
    await expect(progressBadge).toContainText('Card 1/30');
    await expect(btnFirst).toBeDisabled();
    await expect(btnPrev).toBeDisabled();
    await expect(btnNext).toBeEnabled();
    await expect(btnLast).toBeEnabled();
  });

  test('Deve abrir e fechar o modal com a tradução correta da pergunta', async ({ page }) => {
    // Verifica se o card principal foi renderizado
    const cardBox = page.locator('.card-box');
    await expect(cardBox).toBeVisible();

    // Localiza o botão "Ver tradução" na barra lateral de ações
    const btnTraducao = page.locator('button:has-text("Ver tradução")');
    await expect(btnTraducao).toBeVisible();

    // Clica no botão de tradução
    await btnTraducao.click();

    // Espera que o modal de explicação seja exibido
    const modalOverlay = page.locator('.explanation-modal-overlay');
    await expect(modalOverlay).toBeVisible();

    // Valida que o título do modal é "Tradução"
    const modalTitle = page.locator('.explanation-modal-header h2');
    await expect(modalTitle).toHaveText(/Tradução/i);

    // Valida que a tradução da pergunta foi carregada no modal e não está vazia
    const modalBody = page.locator('.explanation-modal-body');
    await expect(modalBody).toBeVisible();
    
    const bodyText = await modalBody.textContent();
    expect(bodyText?.trim().length).toBeGreaterThan(10); // Deve conter o texto da tradução

    // Localiza o botão "Fechar" no rodapé do modal e clica nele
    const btnFechar = page.locator('.explanation-modal-footer button.btn-close-modal');
    await expect(btnFechar).toBeVisible();
    await btnFechar.click();

    // O modal deve ser ocultado
    await expect(modalOverlay).not.toBeVisible();
  });
});
