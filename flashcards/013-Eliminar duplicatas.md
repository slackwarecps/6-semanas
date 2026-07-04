Title: Eliminar findings duplicados após commit de correções iterativas
---
After an initial automated review generates 12 findings, a developer pushes new commits to address the issues. When the review runs again, it produces 8 findings—but developers report that 5 duplicate earlier comments on code that was already fixed in the new commits. What's the most effective way to eliminate this redundant feedback while maintaining thorough analysis?
---
[ ] A - Add a post-processing filter that removes findings matching previous file paths and issue descriptions before posting comments.
[ ] B - Run reviews only on initial PR creation and final pre-merge state, skipping intermediate commits.
[ ] C - Include prior review findings in context, instructing Claude to only report new or still-unaddressed issues.
[ ] D - Restrict the review scope to only files modified in the most recent push, excluding files from earlier commits.
---
Tags: Domain_1::Agentic_Architecture_Orchestration Domain_4::Prompt_Engineering_Structured_Output Domain_5::Context_Management_Reliability
