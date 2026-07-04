Title: What is the main mechanism to control the agentic loop (continue or stop)?
---

What is the main mechanism to control the agentic loop (continue or stop)?
[Resposta correta: O controle correto é ler o campo stop_reason. A usa contagem de tokens, que é guardrail de segurança, não controle de loop. C é frágil, e D é falso porque Claude pode gerar texto e tool calls juntos.]

---
[ ] A - Count the tokens of the response and stop when reaching a limit.
[ ] B - Check the stop_reason field: continue when it is "tool_use" and stop when it is "end_turn".
[ ] C - Parse the natural language text to detect completion.
[ ] D - Stop as soon as the response contains any text.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
