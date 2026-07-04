Title: Analysis shows false positive rates vary: security/correctness 8%, performance 18%, style/naming 52%, documentation 48%.
---

Analysis shows false positive rates vary: security/correctness 8%, performance 18%, style/naming 52%, documentation 48%. Developers are dismissing findings without review because "half are wrong." The high false positive categories are undermining confidence in the accurate ones. What approach best restores developer trust while improving the system?
O que a pergunta pede: best restores developer trust while improving the system → restrição dupla: recuperar a confiança E melhorar o sistema.

A pegadinha: As categorias ruidosas (style 52%, docs 48%) estão contaminando a confiança nas precisas (security 8%) agora .

Raciocínio: A confiança está desabando agora por causa das categorias ruidosas. Desligá-las temporariamente restaura a confiança imediata (as restantes têm 8–18%, aceitável) enquanto você corrige os prompts. A só adiciona trabalho de leitura. C é lento demais — a confiança já está caindo. D degrada as boas categorias junto com as ruins. B ataca a causa preservando o que funciona.

---
[ ] A - Keep all categories but display a confidence score with each finding.
[ ] B - Temporarily disable high false positive categories (style, naming, documentation) and run only high-precision categories while improving prompts.
[ ] C - Keep all categories enabled while adding few-shot examples to improve accuracy over the coming weeks.
[ ] D - Apply a uniform strictness reduction across all categories to bring the overall false positive rate down.

---
Tags: Domain_3::Claude_Code_Configuration_Workflows
