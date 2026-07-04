Title: In the client, how do you decide how to process the content returned by a resource?
---

In the client, how do you decide how to process the content returned by a resource?
[Resposta correta: A decisão se baseia no mimeType do conteúdo. A ignora tipos não-JSON. C usa um critério irrelevante. D adiciona uma chamada desnecessária.]

---
[ ] A - Always parse as JSON, regardless of the type.
[ ] B - By checking the mimeType: if "application/json", parse as JSON; otherwise, return the raw text.
[ ] C - By consulting the payload size in bytes.
[ ] D - By executing an additional tool to infer the format.

---
Tags: Domain_2::Tool_Design_MCP_Integration
