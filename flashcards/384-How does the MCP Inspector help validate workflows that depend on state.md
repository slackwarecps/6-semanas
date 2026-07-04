Title: How does the MCP Inspector help validate workflows that depend on state?
---

How does the MCP Inspector help validate workflows that depend on state?
[Resposta correta: O Inspector preserva estado entre chamadas, viabilizando testes sequenciais. A reiniciaria o estado, contrariando o objetivo. C e D negam a capacidade de testar mudanças de estado em sequência.]

---
[ ] A - It restarts the server on each call, ensuring total isolation.
[ ] B - It keeps the server state between calls, allowing tools to be tested in sequence, such as editing a doc and then reading to confirm persistence.
[ ] C - It executes all tools in parallel with no defined order.
[ ] D - It prevents any state change during the tests.

---
Tags: Domain_2::Tool_Design_MCP_Integration
