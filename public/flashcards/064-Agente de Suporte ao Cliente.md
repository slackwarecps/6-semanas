Title: Agente de Suporte ao Cliente
---

Logs de produção mostram que em 12% dos casos seu agente pula `get_customer` e chama `lookup_order` diretamente usando apenas o nome fornecido pelo cliente, às vezes levando a contas mal identificadas e reembolsos incorretos. Qual mudança corrige esse problema de confiabilidade de forma mais efetiva?

---
[ ] A - Adicionar exemplos few-shot mostrando que o agente sempre chama `get_customer` primeiro, mesmo quando clientes voluntariamente fornecem detalhes do pedido.
[ ] B - Implementar um classificador de roteamento que analisa cada pedido e habilita só um subconjunto de ferramentas apropriado para o tipo.
[ ] C - Adicionar uma pré-condição programática que bloqueia `lookup_order` e `process_refund` até que `get_customer` retorne um identificador verificado.
[ ] D - Reforçar o system prompt declarando que verificação do cliente via `get_customer` é mandatória antes de qualquer operação de pedido.

---
Tags: Domain_2::Tool_Design_MCP_Integration
