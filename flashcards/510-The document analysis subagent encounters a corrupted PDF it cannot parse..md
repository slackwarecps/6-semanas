Title: The document analysis subagent encounters a corrupted PDF it cannot parse.
---

The document analysis subagent encounters a corrupted PDF it cannot parse. What is the most effective way to handle this failure?
O que a pergunta pede: most effective way to handle this failure → tratar a falha.

A pegadinha: Uma falha pontual num documento não deve travar tudo nem ser escondida.

Raciocínio: Erro pontual deve subir com contexto para o coordenador decidir (pular? alternativa?). B é desproporcional (mata tudo); C esconde a perda de dados; D é inútil aqui — corrupção não é transitória, repetir não resolve. A .

---
[ ] A - Return the error with context to the coordinator, letting it decide how to proceed.
[ ] B - Throw an exception that terminates the entire workflow.
[ ] C - Silently skip the corrupted document and continue.
[ ] D - Retry parsing three times with exponential backoff before reporting failure.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
