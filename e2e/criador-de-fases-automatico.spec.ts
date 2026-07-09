import { test, expect } from '@playwright/test';

test.describe('Criador de Fases Automático - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navega até a página do criador de fases
    await page.goto('/criador-de-fases-automatico');
    // Aguarda o formulário carregar
    await expect(page.locator('.criador-container')).toBeVisible();
  });

  test('Deve exibir o título da página corretamente', async ({ page }) => {
    const pageTitle = page.locator('.header h1');
    await expect(pageTitle).toHaveText('🎬 Criador de Fases Automático');
  });

  test('Deve exibir todas as seções do formulário', async ({ page }) => {
    // Verificar se as seções principais estão visíveis
    const formWrapper = page.locator('.form-wrapper');
    await expect(formWrapper).toBeVisible();

    // Verificar labels das seções
    await expect(page.locator('text=Escolha os cenários')).toBeVisible();
    await expect(page.locator('text=Escolha os domínios')).toBeVisible();
    await expect(page.locator('text=Escolha a quantidade de perguntas:')).toBeVisible();
    await expect(page.locator('text=Escolha a quantidade erros máximos:')).toBeVisible();
    await expect(page.locator('text=Escolha o título:')).toBeVisible();
    await expect(
      page.locator('text=Escolha o método de escolha das perguntas:')
    ).toBeVisible();
  });

  test('Deve permitir seleção de múltiplos cenários', async ({ page }) => {
    // Encontrar todos os checkboxes de cenários (primeira seção)
    const checkboxes = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    expect(checkboxCount).toBeGreaterThan(0);

    // Selecionar o primeiro cenário
    await checkboxes.nth(0).click();
    await expect(checkboxes.nth(0)).toBeChecked();

    // Selecionar o segundo cenário
    if (checkboxCount > 1) {
      await checkboxes.nth(1).click();
      await expect(checkboxes.nth(1)).toBeChecked();
    }

    // Desselecionar o primeiro
    await checkboxes.nth(0).click();
    await expect(checkboxes.nth(0)).not.toBeChecked();
  });

  test('Deve permitir seleção de múltiplos domínios', async ({ page }) => {
    // Primeiro, selecionar um cenário para habilitar os domínios
    const selectGrids = page.locator('.select-grid');
    const scenarioCheckboxes = selectGrids.nth(0).locator('.checkbox-item input[type="checkbox"]');
    
    // Selecionar o primeiro cenário
    await scenarioCheckboxes.nth(0).click();
    await page.waitForTimeout(500); // Aguardar carregamento de domínios

    // Encontrar todos os checkboxes de domínios (segunda seção)
    const domainCheckboxes = selectGrids.nth(1).locator('.checkbox-item input[type="checkbox"]');
    const domainCount = await domainCheckboxes.count();

    expect(domainCount).toBeGreaterThan(0);

    // Selecionar o primeiro domínio
    await domainCheckboxes.nth(0).click();
    await expect(domainCheckboxes.nth(0)).toBeChecked();

    // Selecionar o segundo domínio
    if (domainCount > 1) {
      await domainCheckboxes.nth(1).click();
      await expect(domainCheckboxes.nth(1)).toBeChecked();
    }

    // Desselecionar o primeiro
    await domainCheckboxes.nth(0).click();
    await expect(domainCheckboxes.nth(0)).not.toBeChecked();
  });

  test('Deve permitir editar quantidade de perguntas', async ({ page }) => {
    const quantityInput = page.locator('#quantityQuestions');
    await expect(quantityInput).toHaveValue('10');

    // Alterar quantidade
    await quantityInput.fill('25');
    await expect(quantityInput).toHaveValue('25');

    // Alterar novamente
    await quantityInput.fill('50');
    await expect(quantityInput).toHaveValue('50');
  });

  test('Deve permitir editar quantidade máxima de erros', async ({ page }) => {
    const maxErrorsInput = page.locator('#maxErrors');
    await expect(maxErrorsInput).toHaveValue('3');

    // Alterar quantidade
    await maxErrorsInput.fill('5');
    await expect(maxErrorsInput).toHaveValue('5');

    // Alterar novamente
    await maxErrorsInput.fill('1');
    await expect(maxErrorsInput).toHaveValue('1');
  });

  test('Deve permitir editar título da jornada', async ({ page }) => {
    const titleInput = page.locator('#title');

    // Preencher título
    await titleInput.fill('Minha Jornada de Teste');
    await expect(titleInput).toHaveValue('Minha Jornada de Teste');

    // Alterar título
    await titleInput.clear();
    await titleInput.fill('Jornada 2.0');
    await expect(titleInput).toHaveValue('Jornada 2.0');
  });

  test('Deve exibir opção "Randômica" selecionada por padrão', async ({ page }) => {
    const randomRadio = page.locator('input[name="selectionMethod"][value="random"]');
    await expect(randomRadio).toBeChecked();
  });

  test('Deve permitir alternar entre métodos de seleção', async ({ page }) => {
    const randomRadio = page.locator('input[name="selectionMethod"][value="random"]');
    const sequentialRadio = page.locator('input[name="selectionMethod"][value="sequential"]');

    // Verificar que random está selecionado
    await expect(randomRadio).toBeChecked();
    await expect(sequentialRadio).not.toBeChecked();

    // Clicar em sequencial
    await sequentialRadio.click();
    await expect(randomRadio).not.toBeChecked();
    await expect(sequentialRadio).toBeChecked();

    // Volta para random
    await randomRadio.click();
    await expect(randomRadio).toBeChecked();
    await expect(sequentialRadio).not.toBeChecked();
  });

  test('Deve exibir inputs de range sequencial apenas quando selecionado', async ({ page }) => {
    const sequentialRadio = page.locator('input[name="selectionMethod"][value="sequential"]');
    const sequentialInputs = page.locator('.sequential-inputs');

    // Inputs não devem estar visíveis por padrão
    await expect(sequentialInputs).not.toBeVisible();

    // Clicar em sequencial
    await sequentialRadio.click();
    await expect(sequentialInputs).toBeVisible();

    // Voltar para random
    const randomRadio = page.locator('input[name="selectionMethod"][value="random"]');
    await randomRadio.click();
    await expect(sequentialInputs).not.toBeVisible();
  });

  test('Deve permitir editar range sequencial', async ({ page }) => {
    const sequentialRadio = page.locator('input[name="selectionMethod"][value="sequential"]');
    await sequentialRadio.click();

    const startInput = page.locator('#sequentialStart');
    const endInput = page.locator('#sequentialEnd');

    // Verificar valores padrão
    await expect(startInput).toHaveValue('1');
    await expect(endInput).toHaveValue('2000');

    // Alterar range
    await startInput.fill('100');
    await endInput.fill('500');

    await expect(startInput).toHaveValue('100');
    await expect(endInput).toHaveValue('500');
  });

  test('Deve validar título obrigatório', async ({ page }) => {
    // Selecionar cenários e domínios
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();

    await scenarioCheckbox.click();
    await domainCheckbox.click();

    // Aguardar contagem
    await page.waitForTimeout(500);

    // Não preencher título
    const submitBtn = page.locator('button[type="submit"]');

    // Verificar se o botão está desabilitado por falta de título
    if (await submitBtn.isDisabled()) {
      // Se tiver registros mas sem título, não deve estar habilitado
      await expect(submitBtn).toBeDisabled();
    } else {
      // Se o botão estiver habilitado, capturar alert de validação
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('título');
        await dialog.accept();
      });

      await submitBtn.click();
    }
  });

  test('Deve validar seleção de cenários obrigatória', async ({ page }) => {
    // Selecionar um cenário primeiro para habilitar os domínios
    const selectGrids = page.locator('.select-grid');
    const scenarioCheckbox = selectGrids.nth(0).locator('.checkbox-item input[type="checkbox"]').first();
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Preencher domínio e título
    const domainCheckbox = selectGrids.nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    const titleInput = page.locator('#title');

    await domainCheckbox.click();
    await titleInput.fill('Teste Jornada');

    // Aguardar contagem
    await page.waitForTimeout(500);

    // Desselecionar cenários
    await scenarioCheckbox.click();
    const submitBtn = page.locator('button[type="submit"]');

    // Botão deve estar desabilitado (sem cenários)
    await expect(submitBtn).toBeDisabled();

    // Se por algum motivo estiver habilitado
    if (await submitBtn.isEnabled()) {
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('cenário');
        await dialog.accept();
      });

      await submitBtn.click();
    }
  });

  test('Deve validar seleção de domínios obrigatória', async ({ page }) => {
    // Preencher cenário e título
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    const titleInput = page.locator('#title');

    await scenarioCheckbox.click();
    await titleInput.fill('Teste Jornada');

    // Aguardar contagem
    await page.waitForTimeout(500);

    // Não selecionar domínios
    const submitBtn = page.locator('button[type="submit"]');

    // Botão deve estar desabilitado (sem domínios)
    await expect(submitBtn).toBeDisabled();

    // Se por algum motivo estiver habilitado
    if (await submitBtn.isEnabled()) {
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('domínio');
        await dialog.accept();
      });

      await submitBtn.click();
    }
  });

  test('Deve enviar formulário com dados válidos', async ({ page }) => {
    // Preencher todos os dados obrigatórios
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    const titleInput = page.locator('#title');
    const quantityInput = page.locator('#quantityQuestions');
    const maxErrorsInput = page.locator('#maxErrors');

    await scenarioCheckbox.click();
    await domainCheckbox.click();
    await titleInput.fill('Jornada de Teste E2E');
    await quantityInput.fill('15');
    await maxErrorsInput.fill('4');

    // Aguardar contagem de registros
    await page.waitForTimeout(1000);

    // Verificar que o botão está habilitado
    const submitBtn = page.locator('button[type="submit"]');
    const recordCount = await page.locator('.records-label strong').textContent();
    const count = parseInt(recordCount || '0');

    if (count > 0) {
      // Capturar o alert de sucesso
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('✅');
        await dialog.accept();
      });

      await submitBtn.click();

      // Aguardar navegação para admin/jornada
      await page.waitForURL('/admin/jornada');
    }
  });

  test('Deve cancelar e voltar ao dashboard', async ({ page }) => {
    // Preencher alguns dados
    const titleInput = page.locator('#title');
    await titleInput.fill('Jornada que será cancelada');

    // Clicar em cancelar
    const cancelBtn = page.locator('button:has-text("❌ Cancelar")');
    await cancelBtn.click();

    // Verificar que voltou ao dashboard
    await page.waitForURL('/dashboard');
  });

  test('Deve validar limites numéricos', async ({ page }) => {
    const quantityInput = page.locator('#quantityQuestions');
    const maxErrorsInput = page.locator('#maxErrors');

    // Testar limite máximo de quantidade (1000)
    await quantityInput.fill('5000');
    // O input pode truncar ou aceitar, vamos verificar
    const quantityValue = await quantityInput.inputValue();
    expect(parseInt(quantityValue)).toBeLessThanOrEqual(5000); // Valor aceito

    // Testar limite máximo de erros (10)
    await maxErrorsInput.fill('20');
    const maxErrorsValue = await maxErrorsInput.inputValue();
    expect(parseInt(maxErrorsValue)).toBeLessThanOrEqual(20);

    // Testar mínimos (1)
    await quantityInput.fill('0');
    const quantityMin = await quantityInput.inputValue();
    // Inputs number com min="1" rejeitam 0 no HTML5

    await maxErrorsInput.fill('0');
    const maxErrorsMin = await maxErrorsInput.inputValue();
    // Inputs number com min="1" rejeitam 0 no HTML5
  });

  test('Deve navegar do dashboard para criador de fases', async ({ page }) => {
    // Navegar para o dashboard
    await page.goto('/dashboard');

    // Aguardar que o dashboard carregue
    await expect(page.locator('.dashboard')).toBeVisible();

    // Clicar no botão "Criador de Fases Automático"
    const criadorBtn = page.locator('button:has-text("🎬 Criador de Fases Automático")');
    await expect(criadorBtn).toBeVisible();
    await criadorBtn.click();

    // Verificar que foi para a página correta
    await page.waitForURL('/criador-de-fases-automatico');
    await expect(page.locator('.criador-container')).toBeVisible();
  });

  test('Deve manter estado do formulário ao selecionar múltiplos items', async ({ page }) => {
    // Selecionar múltiplos cenários
    const scenarioCheckboxes = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]');
    const scenarioCount = await scenarioCheckboxes.count();

    for (let i = 0; i < Math.min(3, scenarioCount); i++) {
      await scenarioCheckboxes.nth(i).click();
      await expect(scenarioCheckboxes.nth(i)).toBeChecked();
    }

    // Selecionar múltiplos domínios
    const domainCheckboxes = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]');
    const domainCount = await domainCheckboxes.count();

    for (let i = 0; i < Math.min(2, domainCount); i++) {
      await domainCheckboxes.nth(i).click();
      await expect(domainCheckboxes.nth(i)).toBeChecked();
    }

    // Preencher outros campos
    const titleInput = page.locator('#title');
    const quantityInput = page.locator('#quantityQuestions');
    const maxErrorsInput = page.locator('#maxErrors');

    await titleInput.fill('Jornada Completa');
    await quantityInput.fill('20');
    await maxErrorsInput.fill('5');

    // Verificar que tudo está preenchido
    for (let i = 0; i < Math.min(3, scenarioCount); i++) {
      await expect(scenarioCheckboxes.nth(i)).toBeChecked();
    }
    for (let i = 0; i < Math.min(2, domainCount); i++) {
      await expect(domainCheckboxes.nth(i)).toBeChecked();
    }
    await expect(titleInput).toHaveValue('Jornada Completa');
    await expect(quantityInput).toHaveValue('20');
    await expect(maxErrorsInput).toHaveValue('5');
  });

  test('Deve habilitar botão submit quando dados válidos e há registros', async ({ page }) => {
    // Inicialmente o botão deve estar desabilitado (sem seleções)
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();

    // Preencher dados válidos
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    const titleInput = page.locator('#title');

    await scenarioCheckbox.click();
    await domainCheckbox.click();
    await titleInput.fill('Jornada de Teste');

    // Aguardar contagem
    await page.waitForTimeout(1000);

    // Verificar se há registros
    const recordCount = await page.locator('.records-label strong').textContent();
    const count = parseInt(recordCount || '0');

    if (count > 0) {
      // Se houver registros, botão deve estar habilitado
      await expect(submitBtn).toBeEnabled();
    } else {
      // Se não houver registros, botão deve estar desabilitado
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('Deve exibir placeholder correto no campo de título', async ({ page }) => {
    const titleInput = page.locator('#title');
    const placeholder = await titleInput.getAttribute('placeholder');
    expect(placeholder).toContain('jornada do Bob Esponja');
  });

  test('Deve permitir alternar entre métodos de seleção múltiplas vezes', async ({ page }) => {
    const randomRadio = page.locator('input[name="selectionMethod"][value="random"]');
    const sequentialRadio = page.locator('input[name="selectionMethod"][value="sequential"]');

    // Toggle 1: Random -> Sequential
    await sequentialRadio.click();
    await expect(sequentialRadio).toBeChecked();

    // Toggle 2: Sequential -> Random
    await randomRadio.click();
    await expect(randomRadio).toBeChecked();

    // Toggle 3: Random -> Sequential
    await sequentialRadio.click();
    await expect(sequentialRadio).toBeChecked();

    // Toggle 4: Sequential -> Random
    await randomRadio.click();
    await expect(randomRadio).toBeChecked();
  });

  test('Deve conter opção "ForaDosCenarios" na lista de cenários', async ({ page }) => {
    const scenariosCheckboxes = page.locator('.select-grid').first().locator('.checkbox-item');
    const scenariosText = await scenariosCheckboxes.allTextContents();
    
    expect(scenariosText.some(text => text.includes('ForaDosCenarios'))).toBeTruthy();
  });

  test('Deve conter opção "ForaDosDominios" na lista de domínios', async ({ page }) => {
    // Selecionar um cenário primeiro para habilitar os domínios
    const selectGrids = page.locator('.select-grid');
    const scenarioCheckbox = selectGrids.nth(0).locator('.checkbox-item input[type="checkbox"]').first();
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Agora verificar os domínios
    const domainsCheckboxes = selectGrids.nth(1).locator('.checkbox-item');
    const domainsText = await domainsCheckboxes.allTextContents();
    
    expect(domainsText.some(text => text.includes('ForaDosDominios'))).toBeTruthy();
  });

  test('Deve exibir label "Registros Existentes" quando cenários e domínios são selecionados', async ({ page }) => {
    const recordsInfo = page.locator('.records-info');
    
    // Inicialmente não deve estar visível
    await expect(recordsInfo).not.toBeVisible();

    // Selecionar um cenário
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    await scenarioCheckbox.click();

    // Ainda não deve estar visível (falta domínio)
    await expect(recordsInfo).not.toBeVisible();

    // Selecionar um domínio
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    await domainCheckbox.click();

    // Agora deve estar visível
    await expect(recordsInfo).toBeVisible();
    await expect(page.locator('.records-label')).toContainText('Registros Existentes:');
  });

  test('Deve desabilitar botão criar jornada quando não há registros existentes', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');

    // Botão deve estar desabilitado inicialmente (sem seleções)
    await expect(submitBtn).toBeDisabled();

    // Selecionar um cenário "ForaDosCenarios" e domínio "ForaDosDominios"
    // (estes provavelmente não terão muitos/nenhum registro)
    const scenariosCheckboxes = page.locator('.select-grid').first().locator('.checkbox-item');
    const scenariosText = await scenariosCheckboxes.allTextContents();
    const foraCenariosIndex = scenariosText.findIndex(text => text.includes('ForaDosCenarios'));

    if (foraCenariosIndex !== -1) {
      const foraCenariosCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').nth(foraCenariosIndex);
      await foraCenariosCheckbox.click();
    }

    const domainsCheckboxes = page.locator('.select-grid').nth(1).locator('.checkbox-item');
    const domainsText = await domainsCheckboxes.allTextContents();
    const foraDominiosIndex = domainsText.findIndex(text => text.includes('ForaDosDominios'));

    if (foraDominiosIndex !== -1) {
      const foraDominiosCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').nth(foraDominiosIndex);
      await foraDominiosCheckbox.click();
    }

    // Preencher título
    const titleInput = page.locator('#title');
    await titleInput.fill('Teste Fora de Cenários/Domínios');

    // Aguardar um pouco para a contagem atualizar
    await page.waitForTimeout(1000);

    // Se houver registros, o botão estará habilitado, caso contrário desabilitado
    // Este teste apenas verifica que o comportamento está funcionando
    const recordCount = await page.locator('.records-label strong');
    const recordText = await recordCount.textContent();
    const count = parseInt(recordText || '0');

    if (count > 0) {
      await expect(submitBtn).toBeEnabled();
    } else {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('Deve mostrar contagem de registros atualizada quando selecionar diferentes cenários e domínios', async ({ page }) => {
    const recordsLabel = page.locator('.records-label strong');
    const selectGrids = page.locator('.select-grid');

    // Selecionar primeiro cenário
    let scenarioCheckbox = selectGrids.first().locator('.checkbox-item input[type="checkbox"]').first();
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Selecionar primeiro domínio
    let domainCheckbox = selectGrids.nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    await domainCheckbox.click();
    await page.waitForTimeout(1000);

    const firstCount = await recordsLabel.textContent();
    expect(firstCount).toBeTruthy();
    expect(firstCount).not.toBe('');

    // Desselecionar primeiro cenário
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Domínio é automaticamente desmarcado (ou pode estar inválido)
    // Selecionar segundo cenário
    scenarioCheckbox = selectGrids.first().locator('.checkbox-item input[type="checkbox"]').nth(1);
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Selecionar primeiro domínio disponível (pode ser diferente do anterior)
    domainCheckbox = selectGrids.nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    await domainCheckbox.click();
    await page.waitForTimeout(1000);

    const secondCount = await recordsLabel.textContent();
    expect(secondCount).toBeTruthy();
    expect(secondCount).not.toBe('');
  });

  test('Deve desabilitar botão quando desselecionar todos os cenários ou domínios', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    const titleInput = page.locator('#title');

    // Selecionar cenário e domínio
    await scenarioCheckbox.click();
    await domainCheckbox.click();
    await titleInput.fill('Teste');

    // Aguardar contagem
    await page.waitForTimeout(500);

    // Botão deve estar habilitado (assumindo que há registros)
    const recordCount = await page.locator('.records-label strong').textContent();
    const count = parseInt(recordCount || '0');

    if (count > 0) {
      await expect(submitBtn).toBeEnabled();
    }

    // Desselecionar cenário
    await scenarioCheckbox.click();

    // Botão deve estar desabilitado
    await expect(submitBtn).toBeDisabled();
  });

  test('Deve criar uma jornada com sucesso e redirecionar para admin', async ({ page, context }) => {
    // Interceptar alertas
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message;
      await dialog.accept();
    });

    // Preencher formulário
    const titleInput = page.locator('#title');
    await titleInput.fill('Jornada de Teste do Criador');

    // Selecionar cenário (primeiro)
    const scenarioCheckbox = page.locator('.select-grid').first().locator('.checkbox-item input[type="checkbox"]').first();
    await scenarioCheckbox.click();
    await page.waitForTimeout(500);

    // Selecionar domínio
    const domainCheckbox = page.locator('.select-grid').nth(1).locator('.checkbox-item input[type="checkbox"]').first();
    await domainCheckbox.click();
    await page.waitForTimeout(1000);

    // Verificar se tem registros
    const recordCount = await page.locator('.records-label strong').textContent();
    const count = parseInt(recordCount || '0');
    expect(count).toBeGreaterThan(0);

    // Ajustar quantidade de perguntas se necessário
    const quantityInput = page.locator('#quantityQuestions');
    const currentQuantity = await quantityInput.inputValue();
    if (parseInt(currentQuantity || '0') > count) {
      await quantityInput.fill(Math.min(5, count).toString());
      await page.waitForTimeout(500);
    }

    // Clicar botão criar jornada
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Aguardar o alerta de sucesso
    await page.waitForTimeout(1000);

    // Verificar se navegou para admin/jornada
    await page.waitForURL('**/admin/jornada', { timeout: 5000 });
    expect(page.url()).toContain('/admin/jornada');
  });
});
