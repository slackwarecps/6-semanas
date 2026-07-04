Title: When aggregated results total ~75K tokens, the synthesis agent reliably cites the first 15K and final 10K but omits findings in the middle 50K — even when relevant.
---

When aggregated results total ~75K tokens, the synthesis agent reliably cites the first 15K and final 10K but omits findings in the middle 50K — even when relevant. How should you restructure the aggregated input?
O que a pergunta pede: how should you restructure the aggregated input → reorganizar a entrada.

A pegadinha: É o efeito "lost in the middle" (primazia/recência) — o modelo lembra do começo e do fim, esquece o meio.

Raciocínio: A informação crítica está enterrada no meio. Um resumo dos achados-chave no início (posição de primazia) + cabeçalhos de seção navegáveis garante que o essencial não se perca. A perde detalhe. C só ajuda parcialmente. D só redistribui o problema. B .

---
[ ] A - Summarize all outputs to under 20K tokens before aggregation.
[ ] B - Place a key findings summary at the beginning and organize details with explicit section headers.
[ ] C - Stream results incrementally, processing web search first.
[ ] D - Rotate which subagent's results appear first across tasks.

---
Tags: Domain_5::Context_Management_Reliability
