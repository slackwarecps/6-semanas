Title: A conformidade exige que reembolsos acima de US$ 500 sejam automaticamente escalonados para um agente humano — essa regra não pode ficar a critério do modelo.
---

A conformidade exige que reembolsos acima de US$ 500 sejam automaticamente escalonados para um agente humano — essa regra não pode ficar a critério do modelo. Apesar de instruções claras no prompt do sistema, os logs de produção mostram que o agente ocasionalmente processa reembolsos de alto valor diretamente (taxa de falha de 3%).

Como você deve garantir conformidade assegurada?

---
[ ] A - Modificar a ferramenta de reembolso para retornar um erro com a mensagem "Valor excede o limite da política — favor escalonar" quando o limite for ultrapassado.
[ ] B - Adicionar exemplos few-shot ao prompt mostrando o comportamento correto de escalonamento em diversos valores de reembolso (US$ 400, US$ 500, US$ 600).
[ ] C - Implementar um hook para interceptar as chamadas de ferramenta; quando o valor do processo de reembolso exceder US$ 500, bloqueá-lo e invocar o escalonamento humano.
[ ] D - Reforçar o prompt do sistema com linguagem enfática: "POLÍTICA CRÍTICA: Reembolsos acima de US$ 500 DEVEM acionar escalonamento humano. NUNCA processe esses diretamente."

---
Tags: Domain_1::Agentic_Architecture_Orchestration
