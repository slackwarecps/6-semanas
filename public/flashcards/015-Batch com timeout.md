Title: Otimizar custos de API com batch processing e timeout fallback
---
Your team wants to reduce API costs for automated analysis. Currently, real-time Claude calls power two workflows: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. Your manager proposes switching both to the Message Batches API for its 50% cost savings. How should you evaluate this proposal?
---
[ ] A - Switch both workflows to batch processing with status polling to check for completion.
[ ] B - Keep real-time calls for both workflows to avoid batch result ordering issues.
[ ] C - Switch both to batch processing with a timeout fallback to real-time if batches take too long.
[ ] D - Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.
---
Tags: Domain_2::Tool_Design_MCP_Integration Domain_1::Agentic_Architecture_Orchestration Domain_5::Context_Management_Reliability
