Title: Padrões de Arquitetura de IA Conversacional
---

Monitoramento de produção mostra que sua ferramenta `search_catalog` falha 12% do tempo: 8% são timeouts de rede que sucedem ao retentar e 4% são erros de sintaxe de query que nunca sucedem por mais que se retente. Atualmente ambos os tipos de erro são retornados de forma idêntica, causando retentativas desperdiçadas.

Como você deveria modificar o tratamento de erros da ferramenta?

---
[ ] A - Adicionar exemplos few-shot ao system prompt demonstrando como distinguir erros de rede de erros de sintaxe.
[ ] B - Aplicar lógica de retry com backoff exponencial uniformemente a todos os erros.
[ ] C - Implementar retry automático com backoff para timeouts de rede dentro da ferramenta; retornar erros de sintaxe imediatamente com detalhes de validação de parâmetro.
[ ] D - Retornar todos os erros com flag booleana `retryable` e detalhes do tipo de erro.

---
Tags: Domain_2::Tool_Design_MCP_Integration
