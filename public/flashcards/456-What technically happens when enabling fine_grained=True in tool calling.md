Title: What technically happens when enabling fine_grained=True in tool calling?
---

What technically happens when enabling fine_grained=True in tool calling?
[Resposta correta: O fine-grained tool calling desabilita a validação de JSON da API e entrega os chunks conforme são gerados, sem o buffering entre chaves de topo. A opção A inverte o comportamento, C confunde com o reenvio de schema e D confunde com max_uses.]

---
[ ] A - The API starts validating the JSON more strictly before delivering it
[ ] B - The API-side JSON validation is disabled and chunks are delivered as soon as they are generated
[ ] C - The tool schema is no longer needed
[ ] D - The number of tool calls becomes automatically limited

---
Tags: Domain_2::Tool_Design_MCP_Integration
