Title: When is it appropriate to use the Message Batches API instead of synchronous calls?
---

When is it appropriate to use the Message Batches API instead of synchronous calls?
[Resposta correta: O batch serve a cargas tolerantes a latência, com economia de 50% e até 24h sem SLA. A e C usam batch em tarefas que bloqueiam o usuário ou exigem tempo real, onde ele não cabe. D ignora a ausência de garantia de latência.]

---
[ ] A - For pre-merge checks that block the user, because the savings make the wait worthwhile.
[ ] B - For latency-tolerant jobs, like nightly reports, with 50% savings and up to 24h of asynchronous processing.
[ ] C - For real-time responses, because batch guarantees low latency.
[ ] D - Always, because batch is cheaper and faster than synchronous calls.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
