Title: How do you run a verbose skill without polluting the main conversation, preserving full capability?
---

How do you run a verbose skill without polluting the main conversation, preserving full capability?
[Resposta correta: context: fork executa a skill em subagente isolado, e a saída não retorna à conversa. O prefixo ! ainda envia a saída do bash ao contexto; /compact comprime e perde capacidade; rodar em sequência ainda polui o contexto.]

---
[ ] A - Use the ! prefix to run via bash
[ ] B - Add context: fork to the skill's frontmatter, isolating the execution in a subagent
[ ] C - Run /compact after the skill
[ ] D - Run the skills in sequence to dilute the output

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
