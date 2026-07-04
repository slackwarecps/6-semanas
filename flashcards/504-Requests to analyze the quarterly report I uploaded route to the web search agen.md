Title: Requests to "analyze the quarterly report I uploaded" route to the web search agent 45% of the time.
---

Requests to "analyze the quarterly report I uploaded" route to the web search agent 45% of the time. The web search agent has analyze_content ("analyzes content and extracts key information"); the document agent has analyze_document ("analyzes documents and extracts key information"). How should you address this misrouting?
O que a pergunta pede: how should you address this misrouting → corrigir o encaminhamento errado.

A pegadinha: As duas descrições são quase idênticas → o coordenador não distingue. A raiz é a ambiguidade da ferramenta de web search.

Raciocínio: A causa é a colisão de descrições. Diferenciar a ferramenta ambígua na fonte (nome + descrição que deixa claro que é conteúdo web ) elimina a sobreposição. C corrige só um lado (a de web continua atraindo "analyze"); B e D adicionam camadas sem remover a ambiguidade de raiz. A .

---
[ ] A - Rename the web tool to extract_web_results and redescribe it as "processes information retrieved from web searches and URLs."
[ ] B - Add a pre-routing classifier.
[ ] C - Expand only the document tool's description, leaving the web tool unchanged.
[ ] D - Add few-shot routing examples to the coordinator's prompt.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
