Title: Consistência de severidade em análise de código automatizada
---
Your automated code review system shows inconsistent severity ratings—similar issues like null pointer risks receive "critical" severity in some PRs but only "medium" in others. Developer trust is declining because teams can't predict which findings require immediate attention. Your CLAUDE.md already contains comprehensive rules for acceptable patterns, and you've started dismissing findings without review because you can't predict which are truly critical. What's the most effective way to improve severity consistency?
---
[ ] A - Modify the prompt to ask Claude to rate severity relative to other issues in the same PR, so the most severe issue is always marked critical and others rated proportionally
[ ] B - Request that Claude include its reasoning for each severity assignment, then use that reasoning to manually calibrate and adjust ratings during review
[ ] C - Add a CLAUDE.md file that lists issue types and their default severities, instructing Claude to reference this mapping when assigning ratings
[ ] D - Include explicit severity criteria in your prompt with concrete code examples for each severity level
---
Tags: Domain_3::Claude_Code_Configuration_Workflows Domain_4::Prompt_Engineering_Structured_Output Domain_5::Context_Management_Reliability
