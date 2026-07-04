Title: Why distinguish a timeout from a valid empty result ("0 results")?
---

Why distinguish a timeout from a valid empty result ("0 results")?
[Resposta correta: Timeout e resultado vazio têm significados distintos e exigem tratamentos diferentes. A trata o vazio como falha, gerando retries inúteis. C ignora que timeout pode exigir retry. D agrega os dois, destruindo informação acionável.]

---
[ ] A - Because both are failures and should trigger a retry.
[ ] B - Because they are semantically different: a timeout is unknown data (evaluate retry), whereas "0 results" is a successful query that found nothing.
[ ] C - Because both are valid findings and require no retry.
[ ] D - Because a timeout should be treated as "0 results" to simplify.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
