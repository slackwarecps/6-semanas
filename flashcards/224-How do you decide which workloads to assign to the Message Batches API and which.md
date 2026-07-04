Title: How do you decide which workloads to assign to the Message Batches API and which to keep synchronous?
---

How do you decide which workloads to assign to the Message Batches API and which to keep synchronous?
[Resposta correta: Apenas cargas tolerantes a latência vão ao batch, e o que bloqueia merge fica síncrono. A e C ignoram que o batch não dá garantia de tempo mesmo quando termina rápido. D descarta indevidamente os ganhos do batch em cargas adequadas.]

---
[ ] A - Assign to batch the hooks that block merge, because the savings are worth it.
[ ] B - Assign to batch only latency-tolerant workloads, like nightly analysis, and keep synchronous the ones that block merge.
[ ] C - Assign everything to batch, because it usually finishes fast.
[ ] D - Keep everything synchronous, because batch is never reliable.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
