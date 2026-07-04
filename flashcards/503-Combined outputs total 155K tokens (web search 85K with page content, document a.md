Title: Combined outputs total 155K tokens (web search 85K with page content, document analysis 70K with reasoning chains), but synthesis performs optimally under 50K.
---

Combined outputs total 155K tokens (web search 85K with page content, document analysis 70K with reasoning chains), but synthesis performs optimally under 50K. What's the most effective solution?
O que a pergunta pede: most effective solution para caber sob 50K.

A pegadinha: O excesso vem de conteúdo verboso (page content + reasoning chains), não da quantidade de fatos.

Raciocínio: A raiz é a verbosidade. Fazer os agentes a montante emitirem só o essencial estruturado ataca a causa e melhora a qualidade. A complica o fluxo; C adiciona infraestrutura pesada; D adiciona um agente extra (e pode perder fidelidade). B corrige na fonte.

---
[ ] A - Process findings in sequential batches, maintaining running state.
[ ] B - Modify upstream agents to return structured data (key facts, citations, relevance) instead of verbose content and reasoning.
[ ] C - Store findings in a vector database and give synthesis retrieval tools.
[ ] D - Add an intermediate summarization agent before synthesis.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
