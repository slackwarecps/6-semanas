Title: After an initial review generates 12 findings, a developer pushes new commits.
---

After an initial review generates 12 findings, a developer pushes new commits. The review runs again and produces 8 findings — but 5 duplicate earlier comments on code already fixed. What's the most effective way to eliminate this redundant feedback while maintaining thorough analysis?
O que a pergunta pede: eliminate redundant feedback while maintaining thorough analysis → restrição dupla: eliminar redundância MAS manter a análise completa.

A pegadinha: while maintaining thorough analysis elimina qualquer opção que reduza o que é analisado.

Raciocínio: A solução precisa atender às duas metades. A (só o último push) perde a análise completa de interações com arquivos antigos. C pula commits intermediários (perde cobertura). D é frágil (correspondência exata de texto falha fácil). B dá ao Claude a memória dos achados anteriores para ele mesmo filtrar, mantendo a análise completa.

---
[ ] A - Restrict the review scope to only files modified in the most recent push.
[ ] B - Include prior review findings in context, instructing Claude to only report new or still-unaddressed issues.
[ ] C - Run reviews only on initial PR creation and final pre-merge state, skipping intermediate commits.
[ ] D - Add a post-processing filter that removes findings matching previous file paths and descriptions.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
