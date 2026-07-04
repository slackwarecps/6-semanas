Title: Sistema de Pesquisa Multiagente
---

Um subagente de análise de documentos falha frequentemente ao processar arquivos PDF: alguns têm seções corrompidas que disparam exceções de parsing, outros são protegidos por senha e às vezes a biblioteca de parsing trava em arquivos grandes. Atualmente, qualquer exceção termina imediatamente o subagente e retorna um erro ao coordenador, que precisa decidir se retenta, pula ou falha a tarefa toda. Isso causa envolvimento excessivo do coordenador no tratamento rotineiro de erros. Qual melhoria arquitetural é mais efetiva?

---
[ ] A - Criar um agente dedicado a tratamento de erros que monitore todas as falhas via fila compartilhada e decida ações de recuperação, enviando comandos de reinício diretamente aos subagentes.
[ ] B - Configurar o subagente para sempre retornar resultados parciais com status de sucesso, embutindo detalhes do erro em metadados; o coordenador trata todas as respostas como bem-sucedidas.
[ ] C - Fazer com que o coordenador valide todos os documentos antes de enviá-los ao subagente, rejeitando documentos que possam causar falhas.
[ ] D - Implementar recuperação local no subagente para falhas transitórias e escalar ao coordenador apenas erros que ele não consegue resolver, incluindo passos tentados e resultados parciais.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
