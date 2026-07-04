Title: Melhorar feedback de código automático com prompting e contexto
---
Your automated reviews identify valid issues but developers report the feedback isn't actionable. Findings say things like "complex ticket allocation logic" or "potential null pointer" without specifying what to change. When you add detailed instructions like "always include specific fix suggestions," the model still produces inconsistent output—sometimes detailed, sometimes vague. What prompting technique would most reliably produce consistently actionable feedback?
---
[ ] A - Expand the context window to include more of the surrounding codebase so the model has sufficient information to suggest specific fixes
[ ] B - Further refine the instructions with more explicit requirements for each part of the feedback format (location, issue, severity, suggested fix)
[ ] C - Implement a two-pass approach where one prompt identifies issues and a second prompt generates fixes, allowing specialization
[ ] D - Add 3-4 few-shot examples showing the exact format you want: issue identified, code location, specific fix suggestion
---
Tags: Domain_4::Prompt_Engineering_Structured_Output Domain_5::Context_Management_Reliability Domain_3::Claude_Code_Configuration_Workflows
