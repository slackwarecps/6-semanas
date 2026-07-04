Title: How does FastMCP (Python SDK) reduce the work of defining a tool?
---

How does FastMCP (Python SDK) reduce the work of defining a tool?
[Resposta correta: O SDK usa decorator e type hints para gerar o schema, com Field do Pydantic nas descrições. A é o trabalho manual que o SDK evita. C ignora o papel dos type hints. D confunde tool com resource.]

---
[ ] A - It requires you to write the JSON schema by hand for each parameter.
[ ] B - It uses decorators (@mcp.tool) and type hints to generate the JSON schema automatically, with Pydantic's Field describing the parameters.
[ ] C - It generates the schema only at runtime, without type hints.
[ ] D - It converts the function into a templated resource.

---
Tags: Domain_2::Tool_Design_MCP_Integration
