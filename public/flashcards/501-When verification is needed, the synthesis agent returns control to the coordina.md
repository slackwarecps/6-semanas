Title: When verification is needed, the synthesis agent returns control to the coordinator, which invokes web search, then re-invokes synthesis.
---

When verification is needed, the synthesis agent returns control to the coordinator, which invokes web search, then re-invokes synthesis. This adds 2-3 round trips and increases latency by 40%. 85% are simple fact-checks; 15% require deeper investigation. What's the most effective approach to reduce overhead while maintaining system reliability?
O que a pergunta pede: reduce overhead while maintaining reliability → restrição dupla.

A pegadinha: 85% simples vs 15% complexas → trate os dois grupos de formas diferentes .

Raciocínio: A resposta certa atende às duas metades: reduz overhead (85% resolvidos localmente) E mantém confiabilidade (15% complexos seguem o caminho controlado). B dá poder demais ao agente (perde controle/confiabilidade); A não reduz a latência percebida; D é especulativo. C é o equilíbrio exato.

---
[ ] A - Accumulate all verification needs and batch them to the coordinator at the end.
[ ] B - Give the synthesis agent all web search tools to handle any verification directly.
[ ] C - Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex ones still delegate via the coordinator.
[ ] D - Have the web search agent cache extra context anticipating verifications.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
