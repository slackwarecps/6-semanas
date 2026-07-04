Title: Sistema de Pesquisa Multiagente
---

O subagente de busca web retorna resultados para apenas 3 das 5 categorias de fontes solicitadas (sites de concorrentes e relatórios da indústria têm sucesso, mas arquivos de notícias e feeds sociais sofrem timeout). O subagente de análise de documentos processa com sucesso todos os documentos fornecidos. O subagente de síntese precisa produzir um sumário a partir de entradas a montante de qualidade mista. Qual estratégia de propagação de erro é mais efetiva?

---
[ ] A - Continuar a síntese usando apenas as fontes bem-sucedidas e produzir uma saída sem mencionar quais dados estavam indisponíveis.
[ ] B - O subagente de síntese retorna um erro ao coordenador, disparando retry total ou falha da tarefa por dados incompletos.
[ ] C - O subagente de síntese pede ao coordenador para retentar fontes com timeout com prazo maior antes de iniciar a síntese.
[ ] D - Estruturar a saída da síntese com anotações de cobertura indicando quais conclusões estão bem suportadas e onde existem lacunas devido a fontes indisponíveis.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
