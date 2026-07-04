Title: Distinct areas have different conventions (React functional+hooks, API async/await, DB repository pattern).
---

Distinct areas have different conventions (React functional+hooks, API async/await, DB repository pattern). Test files are spread alongside code (Button.test.tsx next to Button.tsx), and you want all tests to follow the same conventions regardless of location. Most maintainable way to apply correct conventions automatically?
O que a pergunta pede: most maintainable way... automatically apply correct conventions → aplicar automaticamente, por caminho/tipo de arquivo.

A pegadinha: As convenções dependem do tipo de arquivo , e os testes seguem regra própria onde quer que estejam → globs.

Raciocínio: A aplicação automática por tipo/caminho de arquivo (incluindo testes espalhados, via glob *.test.* ) é exatamente o que .claude/rules/ com globs faz. A depende de inferência (não confiável); B não cobre testes espalhados de forma uniforme; D exige invocação manual (não é automático). C .

---
[ ] A - Consolidate all conventions in the root CLAUDE.md under headers, relying on inference.
[ ] B - Place a CLAUDE.md in each subdirectory.
[ ] C - Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to apply conventions by file path.
[ ] D - Create skills per code type with conventions in their SKILL.md.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
