Title: Claude Code para Integração Contínua
---

A análise da sua review automatizada de código mostra grandes diferenças nas taxas de falsos positivos por categoria de achado: achados de segurança/correção têm 8% de FP, performance 18%, estilo/naming 52% e documentação 48%. Pesquisas com devs mostram desconfiança crescente — muitos começam a descartar achados sem ler porque "metade está errada". Categorias de alto FP minam a confiança em categorias acuradas. Qual abordagem melhor restaura a confiança dos devs enquanto melhora o sistema?

---
[ ] A - Desabilitar temporariamente categorias de alto FP (estilo, naming, documentação) e manter apenas categorias de alta precisão enquanto melhora os prompts.
[ ] B - Manter todas as categorias mas exibir scores de confiança junto a cada achado para que devs decidam o que investigar.
[ ] C - Manter todas as categorias e adicionar exemplos few-shot para melhorar a acurácia em cada categoria nas próximas semanas.
[ ] D - Aplicar uma redução uniforme de rigor em todas as categorias para baixar a taxa geral de FP.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
