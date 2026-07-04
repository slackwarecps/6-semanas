Title: Claude Code para Integração Contínua
---

Seu sistema CI/CD roda três análises baseadas em Claude: (1) checagens rápidas de estilo em todo PR que bloqueiam o merge até concluir, (2) auditorias semanais e abrangentes de segurança em toda a base, e (3) geração noturna de casos de teste para módulos recém-modificados. A Message Batches API oferece 50% de economia, mas o processamento pode levar até 24 horas. Você quer otimizar custo de API mantendo experiência aceitável para devs. Qual combinação casa corretamente cada tarefa com uma abordagem de API?

---
[ ] A - Use a Message Batches API para todas as três tarefas para maximizar a economia de 50%, configurando o pipeline para fazer polling até a conclusão dos lotes.
[ ] B - Use chamadas síncronas para checagens de estilo em PR; use a Message Batches API para auditorias semanais de segurança e geração noturna de testes.
[ ] C - Use chamadas síncronas para todas para tempos de resposta consistentes, contando com prompt caching para reduzir custos.
[ ] D - Use chamadas síncronas para checagens de estilo em PR e geração noturna de testes; use a Message Batches API apenas para auditorias semanais.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
