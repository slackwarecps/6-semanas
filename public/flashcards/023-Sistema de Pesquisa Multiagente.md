Title: Sistema de Pesquisa Multiagente
---

O subagente de busca web sofre timeout ao pesquisar um tema complexo. Você precisa desenhar como a informação sobre essa falha é retornada ao coordenador. Qual abordagem de propagação de erro melhor habilita recuperação inteligente?

---
[ ] A - Retornar contexto estruturado de erro ao coordenador, incluindo o tipo de falha, a query executada, quaisquer resultados parciais e abordagens alternativas potenciais.
[ ] B - Capturar o timeout dentro do subagente e retornar um conjunto de resultados vazio marcado como bem-sucedido.
[ ] C - Implementar retentativas automáticas com backoff exponencial dentro do subagente, retornando apenas um status genérico "busca indisponível" depois de esgotar as tentativas.
[ ] D - Propagar a exceção de timeout diretamente ao handler de topo, terminando o workflow de pesquisa inteiro.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
