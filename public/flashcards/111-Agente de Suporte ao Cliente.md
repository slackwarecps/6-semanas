Title: Agente de Suporte ao Cliente
---

Logs de produção mostram que o agente às vezes escolhe `get_customer` quando `lookup_order` seria mais apropriado, especialmente para queries ambíguas como "preciso de ajuda com minha compra recente". Você decide adicionar exemplos few-shot ao system prompt para melhorar a seleção. Qual abordagem trata o problema de forma mais efetiva?

---
[ ] A - Adicionar orientações explícitas "use quando" e "não use quando" em cada descrição de ferramenta cobrindo casos ambíguos.
[ ] B - Adicionar exemplos agrupados por ferramenta — todos os cenários de `get_customer` juntos, depois todos os cenários de `lookup_order`.
[ ] C - Adicionar 4–6 exemplos direcionados a cenários ambíguos, cada um com justificativa de por que uma ferramenta foi escolhida em detrimento de alternativas plausíveis.
[ ] D - Adicionar 10–15 exemplos de pedidos claros e inequívocos demonstrando escolha correta para cenários típicos de cada ferramenta.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
