Title: Seu pipeline de extração processa contratos que frequentemente incluem aditivos.
---

Seu pipeline de extração processa contratos que frequentemente incluem aditivos. Quando um contrato contém tanto os termos originais quanto aditivos posteriores (por exemplo, a cláusula original especifica "30-day payment terms" enquanto o Aditivo 1 altera isso para "45 days"), o modelo extrai de forma inconsistente um valor ou o outro, sem indicar qual se aplica.

Qual é a abordagem mais eficaz para melhorar a precisão da extração em documentos com aditivos?

---
[ ] A - Redesenhar o esquema para que os campos alterados capturem múltiplos valores, cada um com sua localização na fonte e data de vigência.
[ ] B - Adicionar instruções no prompt para sempre extrair o valor do aditivo mais recente e ignorar os termos originais substituídos.
[ ] C - Pré-processar os documentos com um classificador que identifica e remove as seções substituídas antes da etapa principal de extração.
[ ] D - Implementar uma validação pós-extração usando correspondência de padrões para detectar aditivos e sinalizar essas extrações para revisão manual.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
