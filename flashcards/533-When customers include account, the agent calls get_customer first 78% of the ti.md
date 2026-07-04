Title: When customers include "account", the agent calls get_customer first 78% of the time; without "account", it calls lookup_order first 93%.
---

When customers include "account", the agent calls get_customer first 78% of the time; without "account", it calls lookup_order first 93%. The tool descriptions are well-written and unambiguous. What is the most likely root cause?
O que a pergunta pede: most likely root cause → a causa raiz.

A pegadinha: tool descriptions are well-written and unambiguous → o problema não é a descrição. É a associação aprendida da palavra "account".

Raciocínio: O enunciado afirma que as descrições são boas e inequívocas — isso elimina C (e enfraquece soluções de descrição). O viés vem da associação aprendida no pré-treino entre "account" e "customer". B presume instruções keyword-sensitive não mencionadas; D é desproporcional. A .

---
[ ] A - The model's base training creates associations between "account" and customer operations that override the descriptions.
[ ] B - The system prompt has keyword-sensitive instructions.
[ ] C - The descriptions need negative examples.
[ ] D - The model needs fine-tuning on multi-concept messages.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
