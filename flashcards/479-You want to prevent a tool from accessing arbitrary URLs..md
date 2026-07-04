Title: You want to prevent a tool from accessing arbitrary URLs.
---

You want to prevent a tool from accessing arbitrary URLs. Which design approach is the most robust?
[Resposta correta: Constranger a capacidade na própria interface da ferramenta torna o comportamento indesejado impossível, atacando a causa. Instruções no prompt não fazem enforcement confiável, blocklists são incompletas e exigem manutenção, e revisar depois não impede o acesso.]

---
[ ] A - Add instructions in the prompt forbidding external URLs
[ ] B - Restrict the capability in the tool interface, replacing fetch_url with load_document that validates formats
[ ] C - Keep a blocklist of forbidden domains and update it periodically
[ ] D - Log the calls and review improper accesses afterwards

---
Tags: Domain_2::Tool_Design_MCP_Integration
