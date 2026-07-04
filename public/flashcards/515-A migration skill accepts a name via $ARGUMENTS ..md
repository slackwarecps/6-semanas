Title: A /migration skill accepts a name via $ARGUMENTS .
---

A /migration skill accepts a name via $ARGUMENTS . Three issues: (1) devs invoke without arguments → poorly-named files, (2) it incorporates schema details from unrelated earlier conversations, (3) a dev triggered destructive cleanup due to broad tool access. Which configuration addresses all three?
O que a pergunta pede: configuration approach addresses all three issues → uma config que resolve os três .

A pegadinha: Mapeie cada problema a uma config: (1) falta argumento → argument-hint ; (2) contexto vazando → context: fork ; (3) acesso amplo → allowed-tools .

Raciocínio: Só A usa os três mecanismos configuráveis que casam 1:1 com os três problemas. B tenta resolver tudo por instrução (frágil — depende do modelo obedecer); C e D resolvem partes mas não os três com mecanismos nativos. A .

---
[ ] A - Add argument-hint frontmatter to prompt for parameters, use context: fork to isolate execution, and restrict allowed-tools to file writes.
[ ] B - Add validation instructions in SKILL.md to check $ARGUMENTS, ignore prior context, and list forbidden operations.
[ ] C - Use positional $1/$2, reference schema via @ syntax, and add a description warning about destructive ops.
[ ] D - Split into /migration-create and /migration-apply, request a name if missing, and use different allowed-tools scopes.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
