Title: The web search subagent queries three categories: academic databases returned 15 papers, industry reports returned "0 results found", patent databases returned "Connection timeout.
---

The web search subagent queries three categories: academic databases returned 15 papers, industry reports returned "0 results found", patent databases returned "Connection timeout." When designing error propagation, what approach enables the best recovery decisions?
O que a pergunta pede: enables the best recovery decisions → melhores decisões de recuperação.

A pegadinha: 0 results é um resultado válido (a busca funcionou, não achou nada); timeout é uma falha de acesso (vale repetir). Tratar igual é o erro.

Raciocínio: A boa recuperação depende de diferenciar "não achei nada" (não adianta repetir) de "não consegui acessar" (vale repetir). B preserva essa distinção. A esconde numa métrica; D trata coisas distintas como iguais; C tira a decisão do coordenador. B .

---
[ ] A - Aggregate outcomes into a single success-rate metric (e.g., "67% coverage").
[ ] B - Distinguish access failures (timeout) needing retry from valid empty results ("0 results") representing successful queries.
[ ] C - Have the subagent retry transient failures internally and report only persistent errors.
[ ] D - Report both the timeout and "0 results" as failures.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
