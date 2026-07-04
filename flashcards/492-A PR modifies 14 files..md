Title: A PR modifies 14 files.
---

A PR modifies 14 files. Your single-pass review is inconsistent: detailed for some files, superficial for others, bugs missed, and contradictory feedback (flagging a pattern in one file, approving identical code elsewhere). How should you restructure the review?
O que a pergunta pede: how should you restructure the review → como reestruturar.

A pegadinha: O problema é a passagem única sobre 14 arquivos (atenção diluída, contradições).

Raciocínio: A raiz é a atenção diluída numa só passagem. Dividir em análise por arquivo (qualidade local consistente) + uma passagem de integração resolve tanto a superficialidade quanto as contradições. A só aumenta o contexto (não garante atenção uniforme). C é caro e não corrige contradições de raiz. D empurra o problema para o desenvolvedor. B .

---
[ ] A - Switch to a larger-context model to give all 14 files attention in one pass.
[ ] B - Split into focused passes: analyze each file individually, then a separate integration-focused pass examining cross-file data flow.
[ ] C - Run three independent passes and only flag issues appearing in at least two.
[ ] D - Require developers to split large PRs into 3-4 file submissions.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
