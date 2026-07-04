Title: When adopting a hook that launches a separate instance of Claude for review, what are the trade-offs and the recommendation?
---

When adopting a hook that launches a separate instance of Claude for review, what are the trade-offs and the recommendation?
[Resposta correta: O benefício é codebase mais limpo com menos duplicação, e o custo é tempo e uso de API extras por edição, mitigado ao monitorar somente diretórios críticos. A instância separada consome API adicional (contra B e D), e o objetivo é mais qualidade e menos duplicação, não velocidade (C).]

---
[ ] A - Benefit of a cleaner codebase, with the cost of extra time and API, recommending monitoring only critical directories.
[ ] B - No relevant cost, since the extra instance reuses the same API session.
[ ] C - Benefit of speed, with the cost of lower quality due to automatic review.
[ ] D - Cost only of storage, with no impact on time or API calls.

---
Tags: Domain_5::Context_Management_Reliability
