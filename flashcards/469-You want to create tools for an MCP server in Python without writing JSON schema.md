Title: You want to create tools for an MCP server in Python without writing JSON schema manually.
---

You want to create tools for an MCP server in Python without writing JSON schema manually. What does the official SDK offer?
[Resposta correta: O SDK permite definir tools com o decorator @mcp.tool usando type hints e Field do Pydantic, gerando o schema correto automaticamente. As demais inventam um gerador externo, confundem com web search ou negam o recurso do SDK.]

---
[ ] A - An external schema generator that runs before the deploy
[ ] B - @mcp.tool decorators with type hints and Pydantic's Field, generating the schema automatically
[ ] C - An allowed_domains field that dispenses with the schema
[ ] D - Writing the schema by hand remains mandatory

---
Tags: Domain_2::Tool_Design_MCP_Integration
