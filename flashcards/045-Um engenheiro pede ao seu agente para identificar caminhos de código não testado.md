Title: Um engenheiro pede ao seu agente para identificar caminhos de código não testados em um módulo legado de processamento de pagamentos que abrange 45 arquivos.
---

Um engenheiro pede ao seu agente para identificar caminhos de código não testados em um módulo legado de processamento de pagamentos que abrange 45 arquivos. Após ler os primeiros 8 arquivos-fonte, as respostas do agente estão ficando visivelmente menos precisas — ele está esquecendo padrões de código discutidos anteriormente e ainda não localizou todos os arquivos de teste nem rastreou os fluxos de pagamento críticos.

Qual é a abordagem mais eficaz para concluir essa investigação?

---
[ ] A - Documentar todas as descobertas atuais em um relatório de resumo, limpar o contexto completamente e, então, usar esse relatório como única referência para continuar a investigação.
[ ] B - Criar subagentes para investigar perguntas específicas (por exemplo, "encontrar todos os arquivos de teste do processamento de pagamentos", "rastrear as dependências do fluxo de reembolso") enquanto o agente principal coordena as descobertas e preserva o entendimento de alto nível.
[ ] C - Limpar o contexto com /clear e, então, reler seletivamente apenas os arquivos mais críticos descobertos até agora, gravando as descobertas-chave em um arquivo de rascunho que persiste entre as redefinições de contexto.
[ ] D - Passar a usar o Grep para buscar nomes de funções específicas em vez de ler arquivos inteiros, reduzindo o conteúdo carregado no contexto para a exploração restante.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
