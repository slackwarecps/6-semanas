import { test, expect } from '@playwright/test';

test.describe('CRUD de Jornadas no Painel Admin', () => {
  const nomeJornada = 'Jornada E2E Teste Temporário';
  const nomeJornadaEditada = 'Jornada E2E Teste Temporário - Editada';

  test.beforeEach(async ({ page }) => {
    // Captura logs do console do navegador para depurar erros
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser Error] ${err.message}`));

    // Acessa diretamente a URL do admin de jornadas
    await page.goto('/admin/jornada');
    // Espera que o carregamento inicial termine (o texto de carregamento some)
    await expect(page.locator('.loading')).not.toBeVisible();
  });

  test('Deve criar, editar e deletar uma jornada com sucesso', async ({ page }) => {
    // --- 1. CRIAR JORNADA ---
    // Clica no botão de Nova Jornada
    const btnNovaJornada = page.locator('button:has-text("✨ Nova Jornada")');
    await expect(btnNovaJornada).toBeVisible();
    await btnNovaJornada.click();

    // Verifica se o formulário detalhado abriu
    const detailPanel = page.locator('.detail-panel');
    await expect(detailPanel).toBeVisible();

    // Preenche os campos do formulário
    await page.fill('#nome', nomeJornada);
    await page.fill('#ordem', '99');
    await page.fill('#pontosTentativas', '5');

    // Marca como Ativa se já não estiver
    const checkboxAtiva = page.locator('input[name="ativa"]');
    if (!(await checkboxAtiva.isChecked())) {
      await checkboxAtiva.check();
    }

    // Seleciona pelo menos um card no seletor
    // Espera que a tabela de seleção tenha linhas e clica na primeira
    const firstCardRow = page.locator('.selector-table tbody tr').first();
    await expect(firstCardRow).toBeVisible();
    await firstCardRow.click();

    // Salva a jornada
    const btnSalvar = page.locator('button:has-text("💾 Salvar Jornada")');
    await btnSalvar.click();

    // Espera o painel de detalhes fechar
    await expect(detailPanel).not.toBeVisible();

    // Verifica se a jornada criada aparece na tabela de listagem master
    const rowNovaJornada = page.locator(`.admin-table tbody tr:has-text("${nomeJornada}")`);
    await expect(rowNovaJornada).toBeVisible();
    
    // Valida dados da linha criada
    await expect(rowNovaJornada.locator('.col-ordem')).toHaveText('99');
    await expect(rowNovaJornada.locator('.col-erros')).toHaveText('5');
    await expect(rowNovaJornada.locator('.col-status')).toContainText('Ativa');

    // --- 2. EDITAR JORNADA ---
    // Clica no botão de editar da linha criada
    const btnEditar = rowNovaJornada.locator('.btn-edit');
    await btnEditar.click();

    // O formulário detalhado deve abrir novamente
    await expect(detailPanel).toBeVisible();

    // Altera o nome e desmarca a checkbox de ativa
    await page.fill('#nome', nomeJornadaEditada);
    await checkboxAtiva.uncheck();

    // Salva as alterações
    await btnSalvar.click();
    await expect(detailPanel).not.toBeVisible();

    // Verifica se a listagem reflete as alterações
    const rowJornadaEditada = page.locator(`.admin-table tbody tr:has-text("${nomeJornadaEditada}")`);
    await expect(rowJornadaEditada).toBeVisible();
    await expect(rowJornadaEditada.locator('.col-status')).toContainText('Inativa');

    // --- 3. DELETAR JORNADA ---
    // Configura o handler de diálogo nativo do navegador para confirmar o popup "confirm"
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Tem certeza que deseja deletar a jornada "${nomeJornadaEditada}"?`);
      await dialog.accept();
    });

    // Clica no botão de deletar da linha editada
    const btnDeletar = rowJornadaEditada.locator('.btn-delete');
    await btnDeletar.click();

    // A linha correspondente deve sumir da tabela
    await expect(rowJornadaEditada).not.toBeVisible();
  });
});
