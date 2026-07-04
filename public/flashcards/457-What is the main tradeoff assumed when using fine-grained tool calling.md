Title: What is the main tradeoff assumed when using fine-grained tool calling?
---

What is the main tradeoff assumed when using fine-grained tool calling?
[Resposta correta: Como a validação de JSON é desabilitada, o código passa a receber JSON parcial ou inválido, incluindo valores não terminados que não casam com o schema. A opção A inverte o benefício de menor buffering, C contradiz o próprio caso de uso e D confunde com a web search tool.]

---
[ ] A - An increase in buffering time between chunks
[ ] B - The code needs to handle invalid or partial JSON, such as unterminated strings
[ ] C - The loss of the ability to show progress in real time
[ ] D - The need to enable the tool in the organization console

---
Tags: Domain_2::Tool_Design_MCP_Integration
