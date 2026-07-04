Title: How do you share the configuration of an MCP server with the team while keeping individual credentials?
---

How do you share the configuration of an MCP server with the team while keeping individual credentials?
[Resposta correta: O padrão é .mcp.json de projeto com variáveis de ambiente e documentação no README, dando fonte única sem expor credenciais. A comita credencial real, o que é inseguro. B faz a config divergir entre devs. D comita placeholder, o que a orientação diz para nunca fazer.]

---
[ ] A - Commit a .mcp.json with the real token embedded for everyone to use.
[ ] B - Each dev creates their own per-user config, with no shared file.
[ ] C - Use a project-scoped .mcp.json expanding environment variables (e.g., ${GITHUB_TOKEN}) and document the variable in the README.
[ ] D - Put a token placeholder in the .mcp.json and commit it to guide the team.

---
Tags: Domain_2::Tool_Design_MCP_Integration
