Title: Agente de Suporte ao Cliente
---

Logs de produção mostram que o agente interpreta mal saídas de suas ferramentas MCP: timestamps Unix de `get_customer`, datas ISO 8601 de `lookup_order` e códigos de status numéricos (1=pendente, 2=enviado). Algumas ferramentas são servidores MCP de terceiros que você não pode modificar. Qual abordagem para normalização de formato de dados é mais mantível?

---
[ ] A - Usar um hook PostToolUse para interceptar saídas de ferramentas e aplicar transformações de formato antes que o agente processe.
[ ] B - Modificar ferramentas que você controla para retornar formatos legíveis para humanos e criar wrappers para ferramentas de terceiros.
[ ] C - Criar uma ferramenta `normalize_data` que o agente chama após cada recuperação de dados para transformar valores.
[ ] D - Adicionar documentação detalhada de formato no system prompt explicando convenções de dado de cada ferramenta.

---
Tags: Domain_2::Tool_Design_MCP_Integration
