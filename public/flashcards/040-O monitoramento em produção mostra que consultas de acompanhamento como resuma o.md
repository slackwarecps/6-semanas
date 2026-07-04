Title: O monitoramento em produção mostra que consultas de acompanhamento como "resuma o que aprendemos sobre tendências de mercado" levam consistentemente mais de 40 segundos.
---

O monitoramento em produção mostra que consultas de acompanhamento como "resuma o que aprendemos sobre tendências de mercado" levam consistentemente mais de 40 segundos. A investigação revela que o coordenador inicia o subagente de síntese para cada solicitação de resumo, passando mais de 80 mil tokens de descobertas acumuladas. O coordenador já tem essas descobertas em seu contexto por ter orquestrado a pesquisa.

Qual é a forma mais eficaz de melhorar o tempo de resposta para esses resumos de acompanhamento?

---
[ ] A - Pré-gerar e armazenar em cache resumos em várias granularidades sempre que novas descobertas se acumulem.
[ ] B - Fazer com que o coordenador trate diretamente as solicitações de resumo simples usando seu contexto existente, reservando o início de subagentes para análises complexas.
[ ] C - Habilitar o cache de prompt no subagente de síntese para reduzir o custo adicional de transferir repetidamente as mesmas descobertas de pesquisa.
[ ] D - Iniciar o subagente de síntese com contexto reduzido e fazer com que ele solicite descobertas específicas ao coordenador sob demanda.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
