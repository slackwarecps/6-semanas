Title: Implementing the agentic loop.
---

Implementing the agentic loop. After each API call, you decide whether to continue (execute tools, call again) or stop (present the final response). What determines this decision?
O que a pergunta pede: what determines this decision → o que decide continuar ou parar.

A pegadinha: Decisão determinística → ler o campo stop_reason da resposta (fato técnico, não heurística de texto).

Raciocínio: O loop agêntico é controlado deterministicamente pelo stop_reason : tool_use significa que o Claude quer executar ferramentas (continue); end_turn significa que terminou (pare). A é um guard-rail útil mas não a lógica central; B é frágil (parsing de linguagem natural); D é incorreto (há texto junto com tool_use). C .

---
[ ] A - A max iteration count (e.g., 10) — stop when reached, regardless of whether Claude needs more work.
[ ] B - Parse the response text for phrases like "I've completed" or "Is there anything else?".
[ ] C - Check the stop_reason field: continue when it equals "tool_use", stop when it equals "end_turn".
[ ] D - Check whether the response includes any assistant text — if so, end the loop.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
