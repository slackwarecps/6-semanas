Title: An application generates EventBridge JSON rules and the user needs the raw JSON to copy, but Claude always wraps the output in markdown with explanatory text.
---

An application generates EventBridge JSON rules and the user needs the raw JSON to copy, but Claude always wraps the output in markdown with explanatory text. Which approach reliably delivers the clean JSON?
[Resposta correta: O prefill com "```json" mais a stop sequence "```" força Claude a produzir apenas o conteúdo e encerrar ao fechar o bloco. Instruções em prosa (B) não garantem a supressão do markdown, temperature (C) controla aleatoriedade e não formato, e few-shot (D) é mais custoso e menos determinístico que a combinação prefill mais stop sequence.]

---
[ ] A - Prefix the assistant message with "```json" and set stop_sequences=["```"], making Claude complete only the JSON and stop when it tries to close the block.
[ ] B - Add the instruction "do not use markdown and do not explain anything" to the user message.
[ ] C - Increase the temperature to reduce the verbosity of the explanation.
[ ] D - Ask for few-shot examples of other JSONs until the model learns not to comment.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
