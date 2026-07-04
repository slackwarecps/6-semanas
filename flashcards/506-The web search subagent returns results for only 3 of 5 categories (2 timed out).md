Title: The web search subagent returns results for only 3 of 5 categories (2 timed out).
---

The web search subagent returns results for only 3 of 5 categories (2 timed out). Document analysis succeeded. The synthesis subagent must produce a summary from this mixed-quality input. What's the most effective error propagation strategy?
O que a pergunta pede: most effective error propagation strategy → como propagar o estado de erro.

A pegadinha: A síntese deve ser transparente sobre o que faltou — não esconder, nem travar tudo.

Raciocínio: A melhor propagação é transparente e útil : produz a síntese possível e marca explicitamente onde há lacunas. B esconde as falhas (perigoso); C/D travam o fluxo por dados parcialmente úteis. A entrega valor e sinaliza a incerteza.

---
[ ] A - Structure the synthesis output with coverage annotations indicating which findings are well-supported vs which areas have gaps from unavailable sources.
[ ] B - Proceed using only the successful sources, without indicating what was unavailable.
[ ] C - Have synthesis ask the coordinator to retry the timed-out sources with longer timeouts first.
[ ] D - Have synthesis return an error for incomplete data, triggering a full retry or failure.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
