Title: Sistema de Pesquisa Multiagente
---

Durante a pesquisa, o subagente de busca web consulta três categorias de fontes com resultados diferentes: bases acadêmicas retornam 15 papers relevantes, relatórios da indústria retornam "0 resultados" e bases de patentes retornam "Connection timeout". Ao desenhar a propagação de erro para o coordenador, qual abordagem habilita as melhores decisões de recuperação?

---
[ ] A - Agregar resultados em uma única métrica de percentual de sucesso (ex.: "67% de cobertura de fontes") com logs detalhados disponíveis sob demanda.
[ ] B - Reportar tanto "timeout" quanto "0 resultados" como falhas que requerem intervenção do coordenador.
[ ] C - Retentar falhas transitórias internamente e reportar apenas erros persistentes.
[ ] D - Distinguir falhas de acesso (timeout) que exigem decisão de retry de resultados vazios válidos ("0 resultados") que representam queries bem-sucedidas.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
