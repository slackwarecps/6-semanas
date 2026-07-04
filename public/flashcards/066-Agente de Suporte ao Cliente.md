Title: Agente de Suporte ao Cliente
---

Logs de produção mostram que o agente frequentemente chama `get_customer` quando usuários perguntam sobre pedidos (ex.: "verifique meu pedido #12345") em vez de chamar `lookup_order`. Ambas as ferramentas têm descrições mínimas ("Gets customer information" / "Gets order details") e aceitam formatos de identificador parecidos. Qual é o primeiro passo mais efetivo para melhorar a confiabilidade da seleção de ferramenta?

---
[ ] A - Implementar uma camada de roteamento que analisa o input do usuário antes de cada turno e pré-seleciona a ferramenta correta com base em palavras-chave detectadas e padrões de ID.
[ ] B - Combinar ambas em uma única `lookup_entity` que aceita qualquer identificador e decide internamente qual backend consultar.
[ ] C - Adicionar exemplos few-shot ao system prompt demonstrando padrões corretos de seleção, com 5–8 exemplos roteando consultas relacionadas a pedido para `lookup_order`.
[ ] D - Expandir a descrição de cada ferramenta para incluir formatos de entrada, queries de exemplo, casos de borda e fronteiras explicando quando usá-la versus ferramentas similares.

---
Tags: Domain_2::Tool_Design_MCP_Integration
