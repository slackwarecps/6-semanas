Title: Sistema de Pesquisa Multiagente
---

O monitoramento de produção mostra qualidade inconsistente de síntese. Quando os resultados agregados têm ~75K tokens, o agente de síntese cita de forma confiável informações dos primeiros 15K tokens (manchetes/snippets de busca web) e dos últimos 10K (conclusões da análise de documentos), mas frequentemente perde achados críticos nos 50K do meio — mesmo quando respondem diretamente à pergunta de pesquisa. Como reestruturar a entrada agregada?

---
[ ] A - Sumarizar todas as saídas dos subagentes para abaixo de 20K tokens antes da agregação para manter o conteúdo dentro do alcance confiável de processamento do modelo.
[ ] B - Streamar incrementalmente os resultados dos subagentes ao agente de síntese, processando primeiro os de busca web até concluir e depois adicionando os de análise de documentos.
[ ] C - Posicionar um sumário de achados-chave no início da entrada agregada e organizar resultados detalhados com cabeçalhos de seção explícitos para navegação mais fácil.
[ ] D - Implementar rotação que alterne quais resultados aparecem primeiro entre tarefas de pesquisa para garantir que ambas as fontes ganhem posição superior ao longo do tempo.

---
Tags: Domain_5::Context_Management_Reliability
