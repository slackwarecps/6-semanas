Title: The agent averages 4+ API round-trips per resolution.
---

The agent averages 4+ API round-trips per resolution. Claude requests get_customer and lookup_order in separate sequential turns even when both are needed upfront. Most effective way to reduce round-trips?
O que a pergunta pede: most effective way to reduce round-trips → reduzir idas e voltas.

A pegadinha: As duas ferramentas são frequentemente necessárias juntas → permita chamadas paralelas numa só rodada.

Raciocínio: O Claude suporta múltiplas chamadas de ferramenta na mesma rodada (parallel tool use). Instruí-lo a agrupar quando ambas são necessárias upfront reduz as idas e voltas direto, sem nova infraestrutura. A desperdiça chamadas (executa o que pode não ser preciso); B cria ferramentas rígidas por combinação; D não muda o comportamento de batching. C . (B é defensável para uma combinação muito comum, mas C é mais geral.)

---
[ ] A - Speculative execution that auto-calls likely tools alongside any request, returning all results.
[ ] B - Composite tools like get_customer_with_orders bundling common combinations.
[ ] C - Prompt Claude to batch tool requests per turn, returning all results together before the next call.
[ ] D - Increase max_tokens so Claude can plan ahead.

---
Tags: Domain_2::Tool_Design_MCP_Integration
