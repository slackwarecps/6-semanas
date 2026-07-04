Title: Agente de Suporte ao Cliente
---

Em testes, você nota que o agente frequentemente chama `get_customer` quando usuários perguntam sobre status de pedido, embora `lookup_order` fosse mais apropriado. O que você deve checar primeiro para tratar esse problema?

---
[ ] A - Implementar um classificador de pré-processamento para detectar pedidos relacionados a ordem e roteá-los diretamente a `lookup_order`.
[ ] B - Reduzir o número de ferramentas disponíveis ao agente para simplificar a escolha.
[ ] C - Adicionar exemplos few-shot ao system prompt cobrindo todos os padrões possíveis de pedido para melhorar a seleção de ferramentas.
[ ] D - Verificar as descrições das ferramentas para garantir que diferenciem claramente o propósito de cada uma.

---
Tags: Domain_2::Tool_Design_MCP_Integration
