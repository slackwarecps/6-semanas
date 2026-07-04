Title: Claude Code para Integração Contínua
---

Após uma review automatizada inicial identificar 12 achados, um dev faz push de novos commits para tratar os problemas. Re-rodar a review produz 8 achados, mas devs reportam que 5 duplicam comentários anteriores em código que já foi corrigido nos novos commits. Qual é a forma mais efetiva de eliminar esse feedback redundante mantendo a profundidade?

---
[ ] A - Rodar review apenas quando o PR é criado e no estado final pré-merge, pulando commits intermediários.
[ ] B - Adicionar um filtro de pós-processamento que remove achados que casam com anteriores por path e descrição antes de postar comentários.
[ ] C - Restringir o escopo da review aos arquivos alterados no push mais recente, excluindo arquivos de commits anteriores.
[ ] D - Incluir achados de reviews anteriores no contexto e instruir Claude a reportar apenas problemas novos ou ainda não resolvidos.

---
Tags: Domain_4::Prompt_Engineering_Structured_Output
