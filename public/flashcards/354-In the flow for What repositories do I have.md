Title: In the flow for "What repositories do I have?
---

In the flow for "What repositories do I have?", at what moment is GitHub actually called?
[Resposta correta: A chamada externa ocorre no CallToolRequest, quando o server aciona o GitHub. A confunde descoberta com execução. B trata tool_use como se já trouxesse dados. D nega a chamada externa.]

---
[ ] A - At the ListToolsRequest, before Claude sees the question.
[ ] B - When Claude responds with tool_use, which already contains the GitHub response.
[ ] C - After the CallToolRequest, when the MCP server executes the tool and calls GitHub, returning CallToolResult.
[ ] D - Only in the final response, formulated by Claude without an external call.

---
Tags: Domain_2::Tool_Design_MCP_Integration
