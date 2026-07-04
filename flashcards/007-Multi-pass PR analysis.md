Title: Reestruturar análise de PR com múltiplos passes para consistência
---
A pull request modifies 14 files across the stock tracking module. Your single-pass review analyzing all files together produces inconsistent results: detailed feedback for some files but superficial comments for others, obvious bugs missed, and contradictory feedback—flagging a pattern as problematic in one file while approving identical code elsewhere in the same PR. How should you restructure the review?
---
[ ] A - Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs.
[ ] B - Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs.
[ ] C - Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.
[ ] D - Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass.
---
Tags: Domain_1::Agentic_Architecture_Orchestration Domain_4::Prompt_Engineering_Structured_Output Domain_5::Context_Management_Reliability
