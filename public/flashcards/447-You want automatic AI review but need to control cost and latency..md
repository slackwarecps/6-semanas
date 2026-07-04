Title: You want automatic AI review but need to control cost and latency.
---

You want automatic AI review but need to control cost and latency. Where should you apply the separate instance hook?
[Resposta correta: Para controlar custo e latência, aplica-se o hook apenas em diretórios de alto valor onde a consistência importa (ex: ./queries). Monitorar o projeto inteiro (A) maximiza o overhead; restringir a config e docs (C) ignora o código crítico onde a duplicação ocorre; amostragem aleatória (D) não garante cobertura dos pontos importantes.]

---
[ ] A - On the entire project, to ensure maximum coverage.
[ ] B - Only in high-value directories where consistency matters, such as ./queries.
[ ] C - Only in configuration and documentation files.
[ ] D - Randomly on part of the files, to sample the changes.

---
Tags: Domain_5::Context_Management_Reliability
