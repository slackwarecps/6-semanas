Title: The current prompt tells Claude to "check that comments are accurate and up-to-date.
---

The current prompt tells Claude to "check that comments are accurate and up-to-date." Findings flag acceptable patterns (TODO markers) while missing comments that describe behavior the code no longer implements. What change addresses the root cause of this inconsistent analysis?
O que a pergunta pede: addresses the root cause of this inconsistent analysis → a raiz da inconsistência.

A pegadinha: A instrução atual ("accurate and up-to-date") é vaga . Critério vago → análise inconsistente.

Raciocínio: A raiz é o critério vago. Defini-lo com precisão ( sinalizar só quando o comentário contradiz o código ) elimina tanto os falsos positivos (TODOs) quanto os falsos negativos. B trata um sintoma. C adiciona dado mas não cria um critério claro. D ajuda, mas A vai direto à raiz.

---
[ ] A - Specify explicit criteria: flag comments only when their claimed behavior contradicts actual code behavior.
[ ] B - Filter out TODO, FIXME, and descriptive comment patterns before analysis.
[ ] C - Include git blame data so Claude can identify comments that predate recent modifications.
[ ] D - Add few-shot examples of misleading comments to help the model recognize similar patterns.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
