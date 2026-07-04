Title: Ao implementar sua ferramenta MCP `lookup_order`, o backend às vezes retorna erros (por exemplo, "Order not found" ou falhas temporárias de banco de dados).
---

Ao implementar sua ferramenta MCP `lookup_order`, o backend às vezes retorna erros (por exemplo, "Order not found" ou falhas temporárias de banco de dados).

Qual é o padrão correto para comunicar esses erros de volta ao agente?

---
[ ] A - Registrar o erro no lado do servidor e retornar um resultado vazio para evitar confundir o modelo.
[ ] B - Retornar a mensagem de erro no conteúdo do resultado da ferramenta, com a flag isError definida como true.
[ ] C - Lançar uma exceção a partir do handler da ferramenta para que o framework do agente possa capturá-la e registrá-la.
[ ] D - Retornar uma resposta de sucesso com um campo "status" indicando o tipo de erro.

---
Tags: Domain_2::Tool_Design_MCP_Integration
