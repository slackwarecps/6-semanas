Title: Você está implementando a lógica de escalonamento para quando o agente deve chamar `escalate_to_human`.
---

Você está implementando a lógica de escalonamento para quando o agente deve chamar `escalate_to_human`. Sua equipe propõe quatro abordagens diferentes para acionar o escalonamento.

Qual abordagem identificará de forma mais confiável os casos que genuinamente exigem intervenção humana?

---
[ ] A - Instruir o agente a escalonar quando o cliente solicitar um humano, quando o problema exigir exceções de política ou quando o agente não conseguir avançar de forma significativa.
[ ] B - Configurar o agente para escalonar após três chamadas de ferramenta consecutivas que falhem em resolver o problema declarado pelo cliente, garantindo uma tentativa razoável antes de envolver um humano.
[ ] C - Implementar análise de sentimento que monitore indicadores de frustração (linguagem negativa, perguntas repetidas, pontos de exclamação) e acione o escalonamento quando a pontuação de frustração ultrapassar um limite configurado.
[ ] D - Construir um motor de regras que mapeie tipos específicos de problemas, segmentos de clientes e categorias de produtos para decisões de escalonamento, eliminando a necessidade de julgamentos do modelo.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
