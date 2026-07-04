Title: get_customer returns all matches when searching by name.
---

get_customer returns all matches when searching by name. Claude currently picks the most recent order when multiple results return, but 15% of multi-match cases proceed with the wrong customer. How should you address this?
O que a pergunta pede: how should you address this → corrigir a escolha errada em multi-match.

A pegadinha: Adivinhar (pegar o mais recente) é arriscado → peça um identificador adicional antes de agir.

Raciocínio: Quando a identificação errada causa dano (conta errada, reembolso errado), o certo é desambiguar pedindo mais um dado antes de agir. A esconde a ambiguidade num ranking (pode errar silenciosamente); B continua adivinhando; D ainda prossegue automaticamente acima de um limiar arbitrário. C elimina o palpite.

---
[ ] A - Modify get_customer to return only the single best match by ranking.
[ ] B - Few-shot using conversational context to infer the right customer without asking.
[ ] C - Instruct Claude to ask for an additional identifier (email, phone, order #) when multiple matches return, before any customer-specific action.
[ ] D - A confidence score that proceeds above 85% and prompts below.

---
Tags: Domain_2::Tool_Design_MCP_Integration
