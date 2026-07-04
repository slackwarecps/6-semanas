Title: Sistema de Pesquisa Multiagente
---

O subagente de análise de documentos encontra um arquivo PDF corrompido que ele não consegue parsear. Ao desenhar o tratamento de erros do sistema, qual é a forma mais efetiva de lidar com essa falha?

---
[ ] A - Retornar um erro com contexto ao agente coordenador, permitindo que ele decida como prosseguir.
[ ] B - Pular silenciosamente o documento corrompido e continuar processando os demais arquivos para evitar interromper o workflow.
[ ] C - Retentar automaticamente o parsing três vezes com backoff exponencial antes de reportar uma falha.
[ ] D - Lançar uma exceção que termina o workflow inteiro de pesquisa.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
