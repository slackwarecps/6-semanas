Title: Reviews average 15 findings with 40% false positives.
---

Reviews average 15 findings with 40% false positives. The bottleneck is investigation time: devs must click each finding to read reasoning before deciding. CLAUDE.md already has comprehensive rules, and stakeholders rejected any approach that filters findings before review. What change best addresses the investigation time bottleneck?
O que a pergunta pede: best addresses the investigation time bottleneck → reduzir o tempo de investigação.

A pegadinha: stakeholders rejected any approach that filters → NÃO pode filtrar antes da revisão. Isso mata A e D na hora.

Raciocínio: A restrição proíbe filtrar (mata A e D ). O gargalo é ter que clicar para ler o raciocínio. Trazer raciocínio + confiança inline elimina o clique sem remover nenhum achado. C reorganiza mas não corta o tempo de leitura por achado. B .

---
[ ] A - Surface only high-confidence findings, filtering out uncertain flags before devs see them.
[ ] B - Require Claude to include its reasoning and confidence assessment inline with each finding.
[ ] C - Categorize findings as "blocking" vs "suggestions" with tiered review requirements.
[ ] D - Add a post-processor that suppresses findings matching historical false-positive signatures.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
