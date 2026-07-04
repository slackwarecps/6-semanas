Title: Production logs reveal that the agent misinterprets data from your MCP tools: Unix timestamps from get_customer , ISO 8601 dates from lookup_order , and numeric status codes (1=pending, 2=shipped).
---

Production logs reveal that the agent misinterprets data from your MCP tools: Unix timestamps from get_customer , ISO 8601 dates from lookup_order , and numeric status codes (1=pending, 2=shipped). Some tools are third-party MCP servers you cannot modify. What's the most maintainable approach to normalize data formats?
O que a pergunta pede: most maintainable approach → "a abordagem mais sustentável ". Querem a solução mais limpa e durável, não um remendo rápido.

A pegadinha: third-party MCP servers you cannot modify → servidores de terceiros que você não pode modificar . Essa é a pegadinha: qualquer opção que dependa só de alterar essas ferramentas é impossível.

Raciocínio: A restrição proíbe modificar ferramentas de terceiros, mas não proíbe criar wrappers em volta delas. Corrija as que você controla e envolva as que não pode. A (hook) é frágil e dependente de infraestrutura. C joga a responsabilidade no prompt — pouco confiável. D depende de o agente lembrar de chamar a ferramenta toda vez. B resolve na fonte sem violar a regra.

---
[ ] A - Use a PostToolUse hook to intercept tool results and apply formatting transformations before agent processing
[ ] B - Modify tools you control to return human-readable formats; create wrapper tools for third-party tools
[ ] C - Add detailed format documentation to your system prompt explaining each tool's data conventions
[ ] D - Create a normalize_data tool that the agent calls after each data retrieval to transform values

---
Tags: Domain_2::Tool_Design_MCP_Integration
