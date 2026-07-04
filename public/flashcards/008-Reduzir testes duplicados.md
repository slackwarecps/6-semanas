Title: Reduzir sugestões duplicadas em geração de testes automatizada
---
Your automated review generates test case suggestions for each PR. When reviewing a PR that adds course completion tracking, Claude suggests 10 test cases but developer feedback indicates 6 duplicate scenarios already covered in the existing test suite. What change would most effectively reduce duplicate suggestions?
---
[ ] A - Add instructions directing Claude to focus exclusively on edge cases and error conditions rather than successful paths
[ ] B - Reduce requested suggestions from 10 to 5, assuming Claude will prioritize the most valuable cases first
[ ] C - Implement post-processing that filters suggestions whose descriptions match keywords from existing test names
[ ] D - Include the existing test file in the context so Claude can identify what scenarios are already covered
---
Tags: Domain_4::Prompt_Engineering_Structured_Output Domain_2::Tool_Design_MCP_Integration Domain_5::Context_Management_Reliability
