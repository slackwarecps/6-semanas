Title: In the MCP flow, who makes the call to the external API (e.
---

In the MCP flow, who makes the call to the external API (e.g., GitHub)?
[Resposta correta: O server faz a chamada externa após receber o CallToolRequest. A atribui isso ao client. B trata tool_use como se executasse a chamada. D não corresponde ao fluxo automatizado.]

---
[ ] A - The MCP Client, directly, without involving the server.
[ ] B - Claude itself, when generating the tool_use.
[ ] C - The MCP Server, triggered by a CallToolRequest from the client, returning CallToolResult.
[ ] D - The end user, manually.

---
Tags: Domain_2::Tool_Design_MCP_Integration
