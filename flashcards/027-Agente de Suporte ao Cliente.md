Title: Agente de Suporte ao Cliente
---

Logs de produção mostram que para pedidos simples como "reembolso para o pedido #1234", seu agente resolve em 3–4 chamadas de ferramenta com 91% de sucesso. Mas para pedidos complexos como "fui cobrado em dobro, meu desconto não foi aplicado e quero cancelar", o agente faz em média 12+ chamadas com apenas 54% de sucesso — frequentemente investigando questões sequencialmente e buscando dados redundantes do cliente para cada uma. Qual mudança melhora o tratamento de pedidos complexos de forma mais efetiva?

---
[ ] A - Adicionar checkpoints explícitos de verificação entre estágios, exigindo que o agente registre progresso após resolver cada questão antes de passar para a próxima.
[ ] B - Reduzir o número de ferramentas combinando `get_customer`, `lookup_order` e ferramentas relacionadas a cobrança em uma única `investigate_issue`.
[ ] C - Decompor o pedido em questões separadas, depois investigar cada uma em paralelo usando contexto compartilhado do cliente antes de sintetizar uma resolução final.
[ ] D - Adicionar exemplos few-shot ao system prompt demonstrando sequências ideais de chamada de ferramentas para vários cenários multi-faceta de cobrança.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
