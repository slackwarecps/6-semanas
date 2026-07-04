Title: Reduzir falsos positivos em análise de comentários com contexto
---
Your automated review analyzes comments and docstrings. The current prompt instructs Claude to "check that comments are accurate and up-to-date." Findings frequently flag acceptable patterns (TODO markers, straightforward descriptions) while missing comments that describe behavior the code no longer implements. What change addresses the root cause of this inconsistent analysis?
---
[ ] A - Filter out TODO, FIXME, and descriptive comment patterns before analysis to reduce noise
[ ] B - Add few-shot examples of misleading comments to help the model recognize similar patterns in the codebase
[ ] C - Specify explicit criteria: flag comments only when their claimed behavior contradicts actual code behavior
[ ] D - Include git blame data so Claude can identify comments that predate recent code modifications
---
Tags: Domain_4::Prompt_Engineering_Structured_Output Domain_5::Context_Management_Reliability Domain_3::Claude_Code_Configuration_Workflows
