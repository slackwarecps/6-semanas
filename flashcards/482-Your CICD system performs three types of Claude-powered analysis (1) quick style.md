Title: Your CI/CD system performs three types of Claude-powered analysis: (1) quick style checks on each PR that block merging until complete, (2) comprehensive security audits run weekly, and (3) test case generation triggered nightly.
---

Your CI/CD system performs three types of Claude-powered analysis: (1) quick style checks on each PR that block merging until complete, (2) comprehensive security audits run weekly, and (3) test case generation triggered nightly. The Message Batches API offers 50% cost savings but can take up to 24 hours to process. Which combination correctly matches each task to its API approach?
O que a pergunta pede: which combination correctly matches each task → associe cada tarefa à abordagem certa (não uma regra única para tudo).

A pegadinha: block merging until complete = precisa ser rápido → síncrono. weekly e nightly podem esperar → batch.

Raciocínio: Só os style checks bloqueiam o merge , então precisam de resposta imediata → síncrono. A auditoria semanal e a geração noturna toleram o atraso de 24h, então ambas ganham os 50% de economia do batch . D é a única que casa cada tarefa pela sua tolerância a atraso. B erra ao manter a geração noturna em síncrono — ela pode esperar.

---
[ ] A - Use the Message Batches API for all three tasks to maximize the 50% cost savings, and poll for batch completion.
[ ] B - Use synchronous calls for PR style checks and nightly test generation; use Message Batches API only for weekly security audits.
[ ] C - Use synchronous calls for all three tasks for consistent response times, and rely on prompt caching to reduce costs.
[ ] D - Use synchronous calls for PR style checks; use the Message Batches API for weekly security audits and nightly test generation.

---
Tags: Domain_5::Context_Management_Reliability
