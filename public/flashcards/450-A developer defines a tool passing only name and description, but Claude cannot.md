Title: A developer defines a tool passing only name and description, but Claude cannot assemble the arguments correctly.
---

A developer defines a tool passing only name and description, but Claude cannot assemble the arguments correctly. What is missing from the specification?
[Resposta correta: A especificação completa exige name, description e input_schema; sem o input_schema Claude não sabe a estrutura dos argumentos. max_uses pertence à web search tool, is_error e tool_use_id pertencem ao bloco tool_result, não à definição da tool.]

---
[ ] A - The max_uses field
[ ] B - The input_schema with the JSON Schema of the arguments
[ ] C - The is_error field
[ ] D - The tool_use_id field

---
Tags: Domain_2::Tool_Design_MCP_Integration
