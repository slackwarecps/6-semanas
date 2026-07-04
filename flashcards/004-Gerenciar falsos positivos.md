Title: Gerenciar falsos positivos em análise automatizada com confiança
---
Analysis of your automated code review shows significant variation in false positive rates across finding categories. Security and correctness findings have an 8% false positive rate, performance findings have 18%, style and naming findings have 52%, and documentation findings have 48%. Developer surveys indicate growing distrust—many have started dismissing findings without review because "half are wrong." The high false positive categories are undermining confidence in the accurate categories. What approach best restores developer trust while improving the system?
---
[ ] A - Temporarily disable high false positive categories (style, naming, documentation) and run only high-precision categories while improving prompts.
[ ] B - Keep all categories but display a confidence score with each finding, letting developers decide which to investigate.
[ ] C - Keep all categories enabled while adding few-shot examples to improve each category's accuracy over the coming weeks.
[ ] D - Apply a uniform strictness reduction across all categories to bring the overall false positive rate to an acceptable level.
---
Tags: Domain_4::Prompt_Engineering_Structured_Output Domain_1::Agentic_Architecture_Orchestration Domain_5::Context_Management_Reliability
