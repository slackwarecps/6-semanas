Title: Seu sistema extrai metadados de eventos (data, local, organizador, `attendee_count`) de artigos de notícias usando um esquema JSON com todos os campos anuláveis.
---

Seu sistema extrai metadados de eventos (data, local, organizador, `attendee_count`) de artigos de notícias usando um esquema JSON com todos os campos anuláveis. Durante a avaliação, você observa que o modelo frequentemente gera valores plausíveis, porém incorretos, para campos não mencionados no artigo — por exemplo, gerando "500" para `attendee_count` quando a fonte não contém nenhuma informação de público.

Qual é a maneira mais eficaz de reduzir essas extrações falsas?

---
[ ] A - Adicionar uma etapa de pós-processamento usando uma segunda chamada de LLM para verificar se cada valor extraído existe no documento de origem.
[ ] B - Adicionar instruções no prompt para retornar null em qualquer campo cuja informação não esteja diretamente declarada na fonte.
[ ] C - Tornar todos os campos do esquema obrigatórios (não anuláveis) com regras de validação estritas para garantir que o modelo só produza dados verificáveis.
[ ] D - Migrar para um nível de modelo mais capaz, com melhor aderência a instruções, para reduzir a tendência a alucinações.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
