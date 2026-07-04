Title: O coordenador fornece instruções detalhadas passo a passo ao subagente de busca na web, especificando consultas de busca exatas, prioridades de fontes e filtros de data.
---

O coordenador fornece instruções detalhadas passo a passo ao subagente de busca na web, especificando consultas de busca exatas, prioridades de fontes e filtros de data. O monitoramento em produção revela três problemas: (1) o subagente relata "resultados insuficientes" em vez de tentar abordagens alternativas quando as buscas pré-especificadas falham, (2) a qualidade da pesquisa cai para tópicos emergentes que não correspondem aos padrões esperados e (3) o subagente raramente traz à tona fontes tangenciais valiosas.

Qual é a forma mais eficaz de melhorar a adaptabilidade do subagente?

---
[ ] A - Remover completamente os detalhes procedurais, delegando com metas simples como "pesquise X minuciosamente" e contando com as capacidades gerais do subagente.
[ ] B - Adicionar diretivas explícitas de contingência às instruções detalhadas: "Se as buscas especificadas retornarem menos de N resultados, tente formulações de consulta alternativas antes de relatar falha."
[ ] C - Implementar uma etapa de classificação de tópicos em que o coordenador categoriza as solicitações como "bem definidas" ou "exploratórias" e usa estilos de instrução diferentes para cada categoria.
[ ] D - Especificar metas de pesquisa e critérios de qualidade (amplitude de cobertura, diversidade de fontes, atualidade) em vez de etapas procedurais, deixando que o subagente determine sua estratégia de busca.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
