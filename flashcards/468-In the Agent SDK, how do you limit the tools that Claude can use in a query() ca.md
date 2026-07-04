Title: In the Agent SDK, how do you limit the tools that Claude can use in a query() call?
---

In the Agent SDK, how do you limit the tools that Claude can use in a query() call?
[Resposta correta: Passar options.allowedTools restringe as tools disponíveis, equivalente à flag --allowedTools do CLI. Remover input_schema quebraria a definição, max_uses é da web search e fine_grained não controla disponibilidade de tools.]

---
[ ] A - By removing the input_schema from the unwanted tools
[ ] B - By passing options.allowedTools, for example { allowedTools: ["Read", "Glob"] }
[ ] C - By setting max_uses to zero for each tool
[ ] D - By disabling fine_grained tool calling

---
Tags: Domain_2::Tool_Design_MCP_Integration
