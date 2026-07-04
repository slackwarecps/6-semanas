Title: The agent frequently calls get_customer for order-status questions, though lookup_order would be more appropriate.
---

The agent frequently calls get_customer for order-status questions, though lookup_order would be more appropriate. What should you examine first?
O que a pergunta pede: what should you examine first → o primeiro lugar a investigar.

A pegadinha: Problema de seleção de ferramenta → o primeiro suspeito é sempre a descrição das ferramentas.

Raciocínio: O primeiro passo no diagnóstico de má seleção de ferramenta é checar se as descrições separam claramente os propósitos. É o mais barato e a causa mais comum. A , C , D são intervenções posteriores e mais pesadas. B .

---
[ ] A - Implement a pre-processing classifier that routes order queries to lookup_order.
[ ] B - Review tool descriptions to ensure they clearly distinguish each tool's purpose.
[ ] C - Add few-shot examples covering every order-related query pattern.
[ ] D - Reduce the number of tools to simplify selection.

---
Tags: Domain_2::Tool_Design_MCP_Integration
