Title: Your CI pipeline includes two code review modes: a pre-merge-commit hook that blocks PR merging until complete, and "deep analysis" that runs overnight, polls for batch completion, then posts detailed suggestions.
---

Your CI pipeline includes two code review modes: a pre-merge-commit hook that blocks PR merging until complete, and "deep analysis" that runs overnight, polls for batch completion, then posts detailed suggestions. Which mode should use batch processing?
O que a pergunta pede: which mode should use batch → qual modo deve usar batch (escolha o que tolera atraso).

A pegadinha: blocks PR merging until complete (precisa ser rápido) vs runs overnight, polls for batch completion (já descreve o comportamento de batch).

Raciocínio: O hook pré-merge bloqueia o merge e precisa ser rápido → síncrono. A deep analysis roda à noite e já faz polling — o caso clássico de batch (lento, mas 50% mais barato). C .

---
[ ] A - Both modes
[ ] B - Pre-merge-commit hook only
[ ] C - Deep analysis only
[ ] D - Neither mode

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
