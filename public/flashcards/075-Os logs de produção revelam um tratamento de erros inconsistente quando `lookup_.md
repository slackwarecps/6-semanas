Title: Os logs de produção revelam um tratamento de erros inconsistente: quando `lookup_order` falha, o agente às vezes tenta novamente mais de 5 vezes (desperdício quando o ID do pedido não existe), às vezes escalona imediatamente (prematuro para problemas temporários de rede) e às vezes pede esclarecimentos ao usuário (inadequado quando o problema é um erro de permissão no backend).
---

Os logs de produção revelam um tratamento de erros inconsistente: quando `lookup_order` falha, o agente às vezes tenta novamente mais de 5 vezes (desperdício quando o ID do pedido não existe), às vezes escalona imediatamente (prematuro para problemas temporários de rede) e às vezes pede esclarecimentos ao usuário (inadequado quando o problema é um erro de permissão no backend). A investigação mostra que sua ferramenta MCP retorna respostas de erro uniformes: {"isError": true, "content": [{"type": "text", "text": "Operation failed"}]}. O agente não consegue distinguir entre os tipos de erro.

Qual é a melhoria mais eficaz?

---
[ ] A - Enriquecer as respostas de erro com metadados estruturados: incluir errorCategory (transient/validation/permission), um booleano isRetryable e uma descrição do que causou a falha.
[ ] B - Criar uma ferramenta MCP `analyze_error` que o agente chama após qualquer falha para determinar a categoria do erro e a ação recomendada.
[ ] C - Implementar lógica de nova tentativa com backoff exponencial no seu servidor MCP para todos os erros, retornando ao agente somente depois de esgotadas as tentativas.
[ ] D - Adicionar exemplos few-shot ao prompt do sistema demonstrando como interpretar padrões de mensagens de erro e selecionar respostas adequadas para cada um.

---
Tags: Domain_2::Tool_Design_MCP_Integration
