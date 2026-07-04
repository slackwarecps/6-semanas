Title: Simple requests ("refund order #1234"): 91% resolution in 3-4 tool calls.
---

Simple requests ("refund order #1234"): 91% resolution in 3-4 tool calls. Complex requests ("charged twice, discount didn't apply, want to cancel"): 12+ calls, only 54%, investigating concerns sequentially and gathering redundant customer data. Most effective change?
O que a pergunta pede: most effective change to improve complex request handling → lidar melhor com pedidos complexos.

A pegadinha: Investiga sequencialmente e repete a coleta de dados → decomponha e investigue em paralelo com contexto compartilhado .

Raciocínio: Os dois sintomas (sequencial + dados redundantes) somem com decomposição + paralelismo + contexto compartilhado : cada demanda é tratada em paralelo e os dados do cliente são buscados uma vez e reutilizados. B mantém o sequencial; C ajuda marginalmente; D esconde a complexidade numa ferramenta-canivete (e não adiciona paralelismo). A .

---
[ ] A - Decompose the request into distinct concerns, investigate each in parallel using shared customer context, then synthesize a resolution.
[ ] B - Verification gates between steps, checkpointing after each concern.
[ ] C - Few-shot examples of ideal tool sequences for multi-part billing scenarios.
[ ] D - Consolidate get_customer, lookup_order, and billing lookups into one investigate_issue tool.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
