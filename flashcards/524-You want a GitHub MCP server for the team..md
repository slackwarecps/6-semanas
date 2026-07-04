Title: You want a GitHub MCP server for the team.
---

You want a GitHub MCP server for the team. Each of six developers has their own personal access token. You want consistent tooling without committing credentials. What's the most effective configuration approach?
O que a pergunta pede: most effective configuration... without committing credentials → consistência sem versionar segredos.

A pegadinha: without committing credentials elimina qualquer opção que fixe tokens no repositório.

Raciocínio: Um .mcp.json versionado dá tooling consistente ao time; a expansão ${GITHUB_TOKEN} mantém o segredo fora do versionamento (cada dev provê sua variável). B perde a consistência (cada um configura do seu jeito); C é complexidade desnecessária; D mistura placeholder versionado com override (frágil). A .

---
[ ] A - Add the server to a project-scoped .mcp.json with environment variable expansion (${GITHUB_TOKEN}) for auth, and document the variable in the README.
[ ] B - Each developer configures the server in user scope with claude mcp add --scope user.
[ ] C - Create a wrapper that reads tokens from .env and proxies to the GitHub API.
[ ] D - Configure project scope with a placeholder token, then have developers override locally.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
