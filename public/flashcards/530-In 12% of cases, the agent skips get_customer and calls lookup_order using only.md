Title: In 12% of cases, the agent skips get_customer and calls lookup_order using only the stated name, sometimes causing misidentified accounts and wrong refunds.
---

In 12% of cases, the agent skips get_customer and calls lookup_order using only the stated name, sometimes causing misidentified accounts and wrong refunds. What change would most effectively address this reliability issue?
O que a pergunta pede: most effectively address this reliability issue → garantir confiabilidade (verificação obrigatória).

A pegadinha: Consequência grave (reembolsos errados) → precisa de uma garantia programática , não só instrução.

Raciocínio: Quando o erro causa dano financeiro, a garantia tem que ser estrutural, não persuasiva . Um bloqueio programático impede a ação sem verificação — 100% confiável. B e C reduzem mas não garantem (o modelo pode falhar nos 12%); A é mais indireto. D é a salvaguarda determinística.

---
[ ] A - A routing classifier that enables only the appropriate tool subset per request.
[ ] B - Strengthen the system prompt: get_customer verification is mandatory before order operations.
[ ] C - Few-shot examples showing the agent always calling get_customer first.
[ ] D - A programmatic prerequisite that blocks lookup_order and process_refund until get_customer returns a verified ID.

---
Tags: Domain_1::Agentic_Architecture_Orchestration
