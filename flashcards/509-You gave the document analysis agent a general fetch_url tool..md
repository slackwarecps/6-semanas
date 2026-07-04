Title: You gave the document analysis agent a general fetch_url tool.
---

You gave the document analysis agent a general fetch_url tool. It now frequently fetches search engine result pages to do ad-hoc searches — behavior that should route through the web search agent. What's the most effective fix?
O que a pergunta pede: most effective fix → correção mais eficaz.

A pegadinha: A ferramenta genérica demais permite o abuso. A correção limpa restringe a capacidade por design.

Raciocínio: A correção mais robusta troca a ferramenta ampla por uma de escopo restrito ( load_document que valida o formato), eliminando o abuso por design (menor privilégio). A é frágil (lista de domínios nunca completa); B depende do modelo obedecer. C . (Obs.: D também é um design defensável; em provas da Anthropic, a preferência costuma ser a ferramenta de escopo apertado.)

---
[ ] A - Filter/block fetch_url calls to known search-engine domains.
[ ] B - Add prompt instructions to use fetch_url only for document URLs.
[ ] C - Replace fetch_url with a load_document tool that validates URLs point to document formats.
[ ] D - Remove fetch_url from the document agent and route all URL loading through the coordinator to the web search agent.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
