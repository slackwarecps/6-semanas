Title: Progressive summarization at 70% capacity.
---

Progressive summarization at 70% capacity. Customers reference specific amounts ("the 15% discount I mentioned") but the agent gives wrong values — details stated 20+ turns ago got condensed into "discussed promotional pricing." Most effective fix?
O que a pergunta pede: most effective fix → corrigir a perda de valores específicos.

A pegadinha: Dados transacionais (valores, datas, números) não podem virar resumo vago → extraia para um bloco persistente.

Raciocínio: A correção robusta separa os fatos críticos da sumarização : um bloco "case facts" sempre presente garante que valores nunca se percam, por mais antigos que sejam. C melhora mas ainda depende da sumarização não falhar; A só adia; D é mais complexo e reativo. B .

---
[ ] A - Raise the summarization threshold from 70% to 85%.
[ ] B - Extract transactional facts (amounts, dates, order numbers) into a persistent "case facts" block included in every prompt, outside the summarized history.
[ ] C - Revise the summarization prompt to preserve all numbers, percentages, and dates verbatim.
[ ] D - Store full history externally and retrieve when the agent detects phrases like "as I mentioned."

---
Tags: Domain_5::Context_Management_Reliability
