Title: Claude Code para Integração Contínua
---

Seu pipeline CI inclui dois modos de code review baseados em Claude: um hook pré-merge-commit que bloqueia o merge do PR até concluir, e uma "análise profunda" que roda à noite, faz polling até concluir o lote e posta sugestões detalhadas no PR. Você quer reduzir custo de API usando a Message Batches API, que oferece 50% de economia mas exige polling e pode levar até 24 horas. Qual modo deveria usar processamento em lote?

---
[ ] A - Apenas o hook pré-merge-commit.
[ ] B - Apenas a análise profunda.
[ ] C - Ambos os modos.
[ ] D - Nenhum dos modos.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
