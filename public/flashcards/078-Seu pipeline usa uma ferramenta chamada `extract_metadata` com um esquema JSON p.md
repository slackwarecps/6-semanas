Title: Seu pipeline usa uma ferramenta chamada `extract_metadata` com um esquema JSON para detalhes do artigo.
---

Seu pipeline usa uma ferramenta chamada `extract_metadata` com um esquema JSON para detalhes do artigo. Você também definiu as ferramentas `lookup_citations` e `verify_doi` para enriquecimento. Durante os testes, você nota que, quando os usuários incluem pedidos como "extract the metadata and tell me how cited it is", o Claude às vezes chama `lookup_citations` primeiro, o que falha porque ela precisa do DOI que `extract_metadata` forneceria.

Qual é a maneira mais eficaz de garantir que a extração estruturada de metadados aconteça primeiro?

---
[ ] A - Definir `tool_choice` como "any" para que o Claude tenha de usar uma ferramenta, combinado com instruções no prompt do sistema priorizando `extract_metadata`.
[ ] B - Definir `tool_choice` como "auto" e reordenar as definições de ferramentas para que `extract_metadata` apareça primeiro no array de ferramentas, já que o Claude prioriza as ferramentas listadas antes.
[ ] C - Definir `tool_choice` como {"type": "tool", "name": "`extract_metadata`"} e processar os pedidos de enriquecimento em turnos subsequentes, depois de receber os metadados extraídos.
[ ] D - Definir `tool_choice` como {"type": "tool", "name": "`extract_metadata`"} para toda chamada de API no pipeline, garantindo que o Claude sempre extraia metadados antes que qualquer enriquecimento possa ocorrer.

---
Tags: Domain_2::Tool_Design_MCP_Integration
