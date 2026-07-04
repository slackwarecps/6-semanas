Title: Two workflows: (1) a blocking pre-merge check that must complete before merging, (2) a technical debt report generated overnight.
---

Two workflows: (1) a blocking pre-merge check that must complete before merging, (2) a technical debt report generated overnight. Your manager proposes switching both to Batch for 50% savings. How should you evaluate this proposal?
O que a pergunta pede: how should you evaluate this proposal → avaliar criticamente, não aceitar de olhos fechados.

A pegadinha: blocking... must complete before merging (síncrono) vs overnight (pode esperar).

Raciocínio: O pre-merge bloqueia o merge → não pode esperar 24h → síncrono. O relatório noturno tolera latência → batch (50% off). A é a divisão correta. C e D forçam batch no fluxo bloqueante (inviável); B abre mão da economia onde ela é possível.

---
[ ] A - Use batch for the technical debt reports only; keep real-time for pre-merge checks.
[ ] B - Keep real-time for both to avoid ordering issues.
[ ] C - Switch both to batch with a timeout fallback to real-time.
[ ] D - Switch both to batch with status polling.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
