Title: You create an /explore-alternatives skill to brainstorm approaches.
---

You create an /explore-alternatives skill to brainstorm approaches. After running it, Claude's subsequent responses are influenced by the exploration — referencing abandoned approaches. What's the most effective way to configure this skill?
O que a pergunta pede: most effective way to configure this skill → como configurar a skill.

A pegadinha: O contexto exploratório vaza para o trabalho seguinte → é preciso isolar o contexto.

Raciocínio: A raiz é a contaminação do contexto principal. context: fork roda a exploração em contexto isolado , descartado depois — exatamente o comportamento desejado. A depende de disciplina manual; C é sobre executar comandos, não isolar contexto; D só muda o escopo (pessoal vs projeto), não isola. B .

---
[ ] A - Split into /explore-start and /explore-end to demarcate context.
[ ] B - Add context: fork to the skill's frontmatter.
[ ] C - Use the ! prefix to run the logic as a bash subprocess.
[ ] D - Create the skill in ~/.claude/skills/ instead of .claude/skills/.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
