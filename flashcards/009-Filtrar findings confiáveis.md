Title: Filtrar e priorizar findings de análise automatizada por confiança
---
Your automated code review averages 15 findings per pull request, with developers reporting a 40% false positive rate. The bottleneck is investigation time: developers must click into each finding to read Claude's reasoning before deciding whether to address or dismiss it. Your CLAUDE.md already contains comprehensive rules for acceptable patterns, and you want to reduce the investigation burden. What change would best address the investigation time bottleneck?
---
[ ] A - Add a post-processor that analyzes finding patterns and automatically suppresses those matching historical false positive signatures
[ ] B - Configure Claude to only surface findings it assesses as high confidence, filtering out uncertain flags before developers see them
[ ] C - Categorize findings as "blocking issues" versus "suggestions" with tiered review requirements
[ ] D - Require Claude to include its reasoning and confidence assessment inline with each finding
---
Tags: Domain_5::Context_Management_Reliability Domain_4::Prompt_Engineering_Structured_Output Domain_3::Claude_Code_Configuration_Workflows
