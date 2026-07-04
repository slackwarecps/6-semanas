Title: Geração de Código com Claude Code
---

Sua base contém áreas com convenções de código diferentes: componentes React usam estilo funcional com hooks, handlers de API usam async/await com tratamento específico de erros e modelos de banco seguem o padrão repository. Arquivos de teste estão distribuídos pela base ao lado do código sob teste (ex.: `Button.test.tsx` ao lado de `Button.tsx`), e você quer que todos os testes sigam as mesmas convenções independentemente da localização.

Qual é a forma mais suportada de garantir que Claude aplique automaticamente as convenções corretas ao gerar código?

---
[ ] A - Colocar todas as convenções no CLAUDE.md raiz sob cabeçalhos por área e contar com Claude para inferir qual seção se aplica.
[ ] B - Criar skills em `.claude/skills/` para cada tipo de código, embutindo convenções em cada SKILL.md.
[ ] C - Colocar um arquivo CLAUDE.md separado em cada subdiretório com convenções para aquela área.
[ ] D - Criar arquivos de regra em `.claude/rules/` com frontmatter YAML especificando padrões glob para aplicar convenções condicionalmente baseadas em paths.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
