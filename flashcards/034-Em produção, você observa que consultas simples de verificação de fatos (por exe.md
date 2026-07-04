Title: Em produção, você observa que consultas simples de verificação de fatos (por exemplo, "Em que ano o Acordo de Paris sobre o Clima foi assinado?") percorrem todos os quatro subagentes sequencialmente, consumindo mais de 40 segundos e tokens significativos por consulta.
---

Em produção, você observa que consultas simples de verificação de fatos (por exemplo, "Em que ano o Acordo de Paris sobre o Clima foi assinado?") percorrem todos os quatro subagentes sequencialmente, consumindo mais de 40 segundos e tokens significativos por consulta. Pesquisas comparativas complexas se beneficiam do pipeline completo. Sua distribuição de consultas é diversa e está evoluindo à medida que os usuários descobrem novas aplicações.

Qual é a abordagem mais eficaz para otimizar para variações de complexidade das consultas?

---
[ ] A - Implementar roteamento baseado em padrões que categoriza as consultas por estrutura (fato único vs. comparativa vs. analítica) e mapeia cada categoria para uma combinação predefinida de subagentes.
[ ] B - Criar um caminho rápido para perguntas factuais que ignora completamente os subagentes, roteando todas as outras consultas pelo pipeline completo para garantir a profundidade da pesquisa.
[ ] C - Fazer com que o coordenador analise cada consulta e decida dinamicamente quais subagentes invocar com base em sua avaliação dos requisitos da consulta.
[ ] D - Treinar um classificador de complexidade de consultas com dados históricos rotulados para prever as combinações ideais de subagentes, retreinando periodicamente à medida que os padrões de consulta evoluem.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
