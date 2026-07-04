Title: When returning data from a resource in the Python SDK, do you need to convert the object to JSON manually?
---

When returning data from a resource in the Python SDK, do you need to convert the object to JSON manually?
[Resposta correta: O SDK serializa automaticamente, bastando retornar a estrutura. A e C impõem uma conversão manual desnecessária. D nega que resources retornem dados estruturados.]

---
[ ] A - Yes, always calling json.dumps before returning.
[ ] B - No, the Python SDK serializes the return value automatically; just return the data structure.
[ ] C - Yes, but only for mime_type text/plain.
[ ] D - No, because resources do not return structured data.

---
Tags: Domain_2::Tool_Design_MCP_Integration
