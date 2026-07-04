Title: The agent sometimes selects get_customer when lookup_order would be better, especially for ambiguous requests ("help with my recent purchase").
---

The agent sometimes selects get_customer when lookup_order would be better, especially for ambiguous requests ("help with my recent purchase"). You'll add few-shot examples. Which approach most effectively addresses this?
O que a pergunta pede: which approach... most effectively (dado que você vai usar few-shot).

A pegadinha: O problema está nos casos ambíguos → os exemplos devem cobrir a ambiguidade, com raciocínio.

Raciocínio: As falhas estão em casos ambíguos , então os exemplos devem mirar essa ambiguidade e mostrar o raciocínio da escolha. C ensina o que o agente já acerta (casos claros); A não é few-shot (a pergunta fixou few-shot); B (agrupar) é mais fraco que mostrar o contraste com raciocínio. D .

---
[ ] A - "Use when"/"do not use when" guidelines in each tool description.
[ ] B - Examples grouped by tool — all get_customer, then all lookup_order.
[ ] C - 10-15 examples of clear, unambiguous requests for each tool's typical use.
[ ] D - 4-6 examples targeting ambiguous scenarios, each showing reasoning for why one tool was chosen over plausible alternatives.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
