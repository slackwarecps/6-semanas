Title: In the follow-up that sends the tool_result, the developer omits the tool schema to save tokens.
---

In the follow-up that sends the tool_result, the developer omits the tool schema to save tokens. What is the problem?
[Resposta correta: Mesmo sem esperar nova chamada, o schema deve ser reenviado para Claude interpretar as referências à tool já presentes no histórico. A opção A representa exatamente a pegadinha a ser evitada e as demais confundem com outros campos ou recursos.]

---
[ ] A - No problem, the schema is only needed on the first call
[ ] B - Claude still needs the schema to understand the references to the tool in the conversation history
[ ] C - The tool_result is rejected due to a missing is_error
[ ] D - The schema is only needed when using fine_grained tool calling

---
Tags: Domain_2::Tool_Design_MCP_Integration
