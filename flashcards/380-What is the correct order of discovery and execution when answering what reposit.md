Title: What is the correct order of discovery and execution when answering "what repositories do I have?
---

What is the correct order of discovery and execution when answering "what repositories do I have?"
[Resposta correta: A ordem é descobrir (ListTools) e então executar (CallTool), com o Claude no meio decidindo. A inverte a sequência. C ignora a descoberta e execução. D trata os dois pares como simultâneos, o que não corresponde ao fluxo.]

---
[ ] A - CallToolRequest first, then ListToolsRequest to confirm.
[ ] B - ListToolsRequest/Result, sending query and tools to Claude, decision to call the tool, CallToolRequest/Result, return to Claude and final response.
[ ] C - Claude responds directly without discovering or executing tools.
[ ] D - CallToolRequest and ListToolsRequest happen simultaneously before anything is sent to Claude.

---
Tags: Domain_2::Tool_Design_MCP_Integration
