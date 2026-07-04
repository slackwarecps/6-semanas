Title: Claude suggests 10 test cases but 6 duplicate scenarios already covered in the existing test suite.
---

Claude suggests 10 test cases but 6 duplicate scenarios already covered in the existing test suite. What change would most effectively reduce duplicate suggestions?
O que a pergunta pede: most effectively reduce duplicate suggestions → reduzir duplicatas.

A pegadinha: O Claude não enxerga o que já existe → falta o contexto dos testes atuais.

Raciocínio: A causa é simples: o Claude não vê os testes atuais. Dar esse contexto resolve na raiz. B é frágil (correspondência por nome falha). C só corta o volume (mesma proporção de duplicatas). D muda o foco mas ainda pode duplicar edge cases. A .

---
[ ] A - Include the existing test file in the context so Claude can see what's already covered.
[ ] B - Post-process to filter suggestions whose names match existing test names.
[ ] C - Reduce requested suggestions from 10 to 5.
[ ] D - Instruct Claude to focus only on edge cases and error conditions.

---
Tags: Domain_5::Context_Management_Reliability
