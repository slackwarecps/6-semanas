Title: Claude Code para Integração Contínua
---

Seu time quer reduzir custos de API para análise automatizada. Atualmente, chamadas síncronas ao Claude atendem dois fluxos: (1) checagem bloqueante pré-merge que precisa concluir antes de devs poderem mergear, e (2) relatório de tech-debt gerado de noite para revisão na manhã seguinte. Seu gerente propõe mover ambos para a Message Batches API para economizar 50%. Como avaliar essa proposta?

---
[ ] A - Mover ambos para processamento em lote com fallback para chamadas síncronas se os lotes demorarem demais.
[ ] B - Mover ambos os fluxos para processamento em lote com polling de status para verificar conclusão.
[ ] C - Use processamento em lote apenas para relatórios de tech-debt; mantenha chamadas síncronas para checagens pré-merge.
[ ] D - Manter chamadas síncronas para ambos os fluxos para evitar problemas com ordenação de resultados em lote.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
