Title: Which line correctly initializes an MCP server with FastMCP in the Python SDK?
---

Which line correctly initializes an MCP server with FastMCP in the Python SDK?
[Resposta correta: A inicialização usa from mcp.server.fastmcp import FastMCP seguido de mcp = FastMCP("DocumentMCP", log_level="ERROR"). As demais usam métodos inexistentes ou misturam parâmetros de outras tools.]

---
[ ] A - mcp = MCP.start("DocumentMCP")
[ ] B - from mcp.server.fastmcp import FastMCP and then mcp = FastMCP("DocumentMCP", log_level="ERROR")
[ ] C - mcp = FastMCP.connect(allowed_domains=["nih.gov"])
[ ] D - import fastmcp and then fastmcp.run()

---
Tags: Domain_2::Tool_Design_MCP_Integration
