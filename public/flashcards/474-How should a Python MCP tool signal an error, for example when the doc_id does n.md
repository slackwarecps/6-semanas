Title: How should a Python MCP tool signal an error, for example when the doc_id does not exist?
---

How should a Python MCP tool signal an error, for example when the doc_id does not exist?
[Resposta correta: O tratamento de erro se integra naturalmente via exceptions Python, como levantar ValueError quando o doc_id não existe. Retornar string vazia esconde o erro, is_error é campo do tool_result e não do decorator, e a web search é irrelevante ao caso.]

---
[ ] A - By returning an empty string
[ ] B - By raising a Python exception, such as ValueError
[ ] C - By setting is_error directly in the decorator
[ ] D - By calling the web search tool to look up the doc_id

---
Tags: Domain_2::Tool_Design_MCP_Integration
