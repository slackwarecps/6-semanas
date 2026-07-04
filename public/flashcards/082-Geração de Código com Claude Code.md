Title: Geração de Código com Claude Code
---

Seu CLAUDE.md cresceu para 400+ linhas contendo padrões de código, convenções de testes, um checklist detalhado de PR review, instruções de deploy e procedimentos de migração de banco. Você quer que Claude sempre siga padrões de código e convenções de testes, mas aplique guias de PR review, deploy e migration apenas quando estiver fazendo essas tarefas.

Qual abordagem de reestruturação é mais efetiva?

---
[ ] A - Mover toda a orientação para arquivos Skills separados organizados por tipo de fluxo, deixando apenas uma breve descrição do projeto no CLAUDE.md.
[ ] B - Manter tudo no CLAUDE.md mas usar sintaxe `@import` para organizar em arquivos mantidos separadamente por categoria.
[ ] C - Dividir o CLAUDE.md em arquivos sob `.claude/rules/` com padrões glob path-bound para que cada regra carregue só para os tipos de arquivo relevantes.
[ ] D - Manter padrões universais no CLAUDE.md e criar Skills para guias específicos de fluxo (PR review, deploy, migrations) com palavras-chave de gatilho.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
