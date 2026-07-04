Title: In a large project, Claude creates duplicate queries instead of reusing the existing ones.
---

In a large project, Claude creates duplicate queries instead of reusing the existing ones. Which hook pattern mitigates this?
[Resposta correta: O padrão lança uma segunda instância do Claude Code (via Agent SDK) para revisar as mudanças, detectar queries similares e dar feedback para remover a duplicata. Matching por regex (A) é frágil e não entende similaridade semântica; apagar tudo (C) é destrutivo; despejar o diretório inteiro no contexto (D) não é o mecanismo descrito e não gera o feedback de revisão.]

---
[ ] A - A hook that does pattern matching by regex on query names to block duplicates.
[ ] B - A hook that, when modifying files in ./queries, launches a second instance of Claude Code to review the changes and detect similar queries.
[ ] C - A hook that automatically deletes any new query added in ./queries.
[ ] D - A hook that includes the entire ./queries directory in the context of each edit.

---
Tags: Domain_5::Context_Management_Reliability
