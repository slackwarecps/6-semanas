Title: A technically correct tool is almost never called by Claude.
---

A technically correct tool is almost never called by Claude. What is the most likely cause according to the tool design criteria?
[Resposta correta: A description é o que Claude lê para decidir quando e como chamar a tool, então uma description ruim gera uso incorreto ou ausência de uso. As demais opções tratam de detalhes técnicos que não explicam a não utilização motivada por documentação fraca.]

---
[ ] A - The input_schema uses numeric types instead of strings
[ ] B - The description is the documentation Claude reads and, being poor, causes incorrect use or no use at all
[ ] C - The tool was not registered as built-in
[ ] D - fine_grained tool calling is not enabled

---
Tags: Domain_2::Tool_Design_MCP_Integration
